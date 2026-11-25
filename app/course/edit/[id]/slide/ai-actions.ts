"use server";

import { generateText } from "ai";
import { aiProvider, getModel, isAiConfigured } from "@/lib/ai";
import { stripCodeFences } from "@/lib/written-ai";
import {
  AiScope,
  buildCoursePromptContext,
  buildLearnerPromptContext,
  buildStatePromptContext,
  resolveAiContext,
} from "@/lib/ai-context";

// Detect if the docs contain URLs
function containsUrls(text: string): boolean {
  const urlPattern = /https?:\/\/[^\s]+/gi;
  return urlPattern.test(text);
}

export async function generateSlideContent(
  prompt: string,
  docs?: string,
  scope?: AiScope
) {
  if (!isAiConfigured()) {
    return {
      success: false,
      error: "AI provider is not configured",
    };
  }

  try {
    const hasUrls = docs ? containsUrls(docs) : false;

    // URL-aware model for docs containing links, regular model otherwise
    const model = getModel(hasUrls);

    // Stateful context: course + module + everything generated so far
    const context = await resolveAiContext(scope);
    const courseContextBlock = buildCoursePromptContext(
      context?.course,
      context?.module
    );
    const stateContextBlock = buildStatePromptContext(context?.state);
    const learnerContextBlock = buildLearnerPromptContext(context?.learnerProfile);

    const systemPrompt = `You write slide cards for a short guided course. A card teaches exactly one thing and reads in under a minute.

${courseContextBlock}

${learnerContextBlock}

CARD BRIEF:
- Body copy: 40-80 words. One idea, one example, or one distinction per card. Never bundle several points into one card.
- Pick the strongest single angle for the card: explain the idea, show a real-world example, or contrast it with a common mistake.
- Title: at most 7 words, naming the idea rather than describing the card.
- Body: 1-2 short paragraphs or at most 3 bullets. No extra headings.
- Plain Markdown: a single H1 title, then the body. No tables, images, or code unless the idea needs them.

WHAT TO LEAVE OUT:
- No introductions, summaries, overviews, agenda, or "in this slide" framing.
- No restating the learning objective as a sentence.
- No closing questions, calls to action, or "next up" notes.
- No statistics, quotes, citations, or facts that are not present in the source context. If the source does not give a number, do not invent one.

CONSISTENCY RULES (this card belongs to a guided course):
- Stay inside the current module: do not teach content the roadmap assigns to a later module, and do not re-explain what an earlier module already covered.
- Reuse the course's established terms and naming; do not invent synonyms for concepts named in the context above.
- Never repeat an idea listed under ALREADY GENERATED; each card must add new material.
- Match the course's difficulty level and language.

${stateContextBlock ? `${stateContextBlock}\n\n` : ""}${hasUrls ? "When URLs are provided, fetch and analyse the content from those URLs for accurate, current examples and data." : ""}

Output ONLY the card in Markdown: one H1 title followed by the body. Nothing else.`;


    const userPrompt = docs
      ? `Based on the following documentation/context:\n\n${docs}\n\nCreate one card about: ${prompt}`
      : `Create one card about: ${prompt}`;

    const { text } = await generateText({
      model: aiProvider.chatModel(model),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxOutputTokens: 700,
    });

    let content = text;

    if (!content) {
      return {
        success: false,
        error: "No content generated",
      };
    }

    // Remove markdown code block wrapper if present
    content = content.replace(/^```(?:markdown|md)?\n?([\s\S]*?)```$/gm, "$1").trim();

    // Extract title from first heading line (# or ## or ###)
    const headingMatch = content.match(/^(#{1,3})\s+(.+)$/m);
    let title: string | undefined;

    if (headingMatch) {
      title = headingMatch[2].trim();
      // Remove the first heading line from content
      content = content.replace(/^#{1,3}\s+.+\n?/, "").trim();
    }


    return {
      success: true,
      content,
      title,
      model,
    };


  } catch (error) {
    console.error("Error generating slide content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate content",
    };
  }
}

export interface GeneratedCardQuestion {
  title: string;
  question: string;
  options: { text: string; isCorrect: boolean; explanation: string }[];
}

/**
 * Generates one card and the question that checks it in a single call, so
 * course creation pays one round trip per card instead of two.
 */
export async function generateSlideWithQuestion(
  prompt: string,
  scope?: AiScope
) {
  if (!isAiConfigured()) {
    return { success: false, error: "AI provider is not configured" };
  }

  try {
    const context = await resolveAiContext(scope);
    const courseContextBlock = buildCoursePromptContext(
      context?.course,
      context?.module
    );
    const stateContextBlock = buildStatePromptContext(context?.state);
    const learnerContextBlock = buildLearnerPromptContext(
      context?.learnerProfile
    );

    const systemPrompt = `You write one slide card for a short guided course, then one question that checks whether it landed. A card teaches exactly one thing and reads in under a minute.

${courseContextBlock}

${learnerContextBlock}

CARD BRIEF:
- Body: 40-80 words. One idea, one example, or one distinction per card. Never bundle several points into one card.
- Pick the strongest single angle: explain the idea, show a real-world example, or contrast it with a common mistake.
- Title: at most 7 words, naming the idea rather than describing the card.
- Body: 1-2 short paragraphs or at most 3 bullets. No extra headings.
- Plain Markdown. No tables, images, or code unless the idea needs them.

WHAT TO LEAVE OUT:
- No introductions, summaries, overviews, agenda, or "in this card" framing.
- No restating the learning objective as a sentence.
- No closing questions, calls to action, or "next up" notes.
- No statistics, quotes, citations, or facts that are not present in the source context. If the source does not give a number, do not invent one.

QUESTION BRIEF (tests the same card, nothing else):
- Choose the format deliberately: default to a 3-4 option multiple choice question. Most cards deserve MCQ.
- Use true/false only when the card's core point is one clear binary claim a learner should judge (a definition, a rule, a common misconception). Never use true/false just because it is shorter, and never for a card that explains a process, comparison, or example.
- Multiple choice: one clearly correct answer; wrong answers are plausible real mistakes.
- True/false: exactly two options, worded exactly "True" and "False", one correct.
- Options are similar in length and style; avoid absolute terms like "always" or "never" unless truly accurate.
- Every option carries a one-sentence explanation that teaches.

CONSISTENCY RULES:
- Stay inside the current module: do not teach content the roadmap assigns to a later module, and do not re-explain what an earlier module covered.
- Reuse the course's established terms; do not invent synonyms for concepts named in the context above.
- Never repeat an idea or question listed under ALREADY GENERATED.

${stateContextBlock ? `${stateContextBlock}\n\n` : ""}Return ONLY valid JSON (no markdown fences). "options" is an array: 3-4 entries for a multiple choice question, or exactly 2 ("True" and "False") only for a true/false question.
{
  "title": "card title, at most 7 words",
  "content": "card body in Markdown, no heading",
  "question": {
    "title": "short label for what the question tests",
    "question": "the question text",
    "options": [
      { "text": "correct option text", "isCorrect": true, "explanation": "why" },
      { "text": "plausible wrong option", "isCorrect": false, "explanation": "why not" },
      { "text": "another plausible wrong option", "isCorrect": false, "explanation": "why not" },
      { "text": "a third plausible wrong option", "isCorrect": false, "explanation": "why not" }
    ]
  }
}`;

    const { text, finishReason } = await generateText({
      model: aiProvider.chatModel(getModel()),
      system: systemPrompt,
      prompt: `Create one card about: ${prompt}`,
      temperature: 0.7,
      // Reasoning models spend part of this budget thinking before the JSON.
      maxOutputTokens: 4000,
    });

    if (finishReason === "length") {
      return {
        success: false,
        error: "AI response was cut off before the card finished. Try again.",
      };
    }

    // Models sometimes wrap the object in prose or fences; keep just the object.
    const raw = stripCodeFences(text);
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    let parsed: { title?: string; content?: string; question?: GeneratedCardQuestion };
    try {
      parsed = JSON.parse(start === -1 ? raw : raw.slice(start, end + 1));
    } catch {
      return { success: false, error: "AI returned an unreadable card. Try again." };
    }

    const question = parsed.question;
    if (
      !parsed.title?.trim() ||
      !parsed.content?.trim() ||
      !question?.question?.trim() ||
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      !question.options.some((option) => option.isCorrect)
    ) {
      return { success: false, error: "Invalid card structure generated" };
    }

    return {
      success: true,
      card: {
        title: parsed.title.trim(),
        content: parsed.content.trim(),
        question: {
          title: question.title?.trim() || parsed.title.trim(),
          question: question.question.trim(),
          options: question.options.map((option) => ({
            text: option.text,
            isCorrect: Boolean(option.isCorrect),
            explanation: option.explanation || "",
          })),
        },
      },
    };
  } catch (error) {
    console.error("Error generating slide with question:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate card and question",
    };
  }
}

