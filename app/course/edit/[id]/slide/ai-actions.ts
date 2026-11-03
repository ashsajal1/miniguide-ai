"use server";

import { generateText } from "ai";
import { aiProvider, getModel, isAiConfigured } from "@/lib/ai";
import {
  AiScope,
  buildCoursePromptContext,
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

    const systemPrompt = `You write slide cards for a short guided course. A card teaches exactly one thing and reads in under a minute.

${courseContextBlock}

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

