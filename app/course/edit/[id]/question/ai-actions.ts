"use server";

import { generateText } from "ai";
import { aiProvider, getModel, isAiConfigured } from "@/lib/ai";
import {
  AiScope,
  buildCoursePromptContext,
  buildStatePromptContext,
  resolveAiContext,
} from "@/lib/ai-context";

interface MCQOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface GeneratedMCQ {
  title: string;
  question: string;
  options: MCQOption[];
}

export async function generateMCQFromSlide(
  slideContent: string,
  scope?: AiScope
) {
  if (!isAiConfigured()) {
    return {
      success: false,
      error: "AI provider is not configured",
    };
  }

  // Stateful context: course + module + everything generated so far
  const context = await resolveAiContext(scope);

  const material = slideContent.trim()
    ? slideContent
    : context?.previousSlideContent ?? "";
  const hasSlide = Boolean(material.trim());

  if (!hasSlide) {
    return {
      success: false,
      error: "Slide content is required",
    };
  }

  try {
    const courseContextBlock = buildCoursePromptContext(
      context?.course,
      context?.module
    );
    const stateContextBlock = buildStatePromptContext(context?.state);

    const systemPrompt = `You are an expert educational assessment designer. Create high-quality multiple choice questions that effectively test learning and understanding.

${courseContextBlock}

CONSISTENCY RULES (this question belongs to a guided course):
- Test only material from the current module's slide content below; do not ask about content the roadmap assigns to a later module.
- Reuse the course's established terms and naming; do not invent synonyms for concepts named in the context above.
- Never repeat or rephrase a question listed under ALREADY GENERATED; each question must assess different material.
- Calibrate difficulty to the course's level and write in the course's language.

QUESTION DESIGN PRINCIPLES:
- **Cognitive Levels**: Create questions that test analysis, application, and critical thinking (not just recall)
- **Distractors**: Wrong answers should be plausible and based on common misconceptions
- **Clarity**: Questions should be unambiguous and well-written
- **Relevance**: Questions should test the most important concepts from the content
- **Educational Value**: Include explanations that teach, not just state right/wrong

QUESTION TYPES TO CONSIDER:
- **Conceptual Understanding**: Test comprehension of key ideas
- **Application**: Test ability to apply concepts to new situations
- **Analysis**: Test ability to break down complex ideas
- **Problem-Solving**: Test practical application of knowledge
- **Critical Thinking**: Test evaluation and synthesis of ideas

OPTIONS GUIDELINES:
- Create 3-4 options (never 2 - that's too easy)
- One clearly correct answer
- Wrong answers should be based on real mistakes students make
- All options should be similar in length and style
- Avoid absolute terms like "always" or "never" unless truly accurate

EXPLANATIONS:
- Correct answer: Explain WHY it's right and reinforce the concept
- Wrong answers: Explain WHY it's wrong and address the misconception
- Use explanations to teach additional context and learning

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Descriptive title of what the question tests (e.g., 'Understanding React Hooks', 'Database Normalization Principles')",
  "question": "Clear, well-written question that tests understanding (not just recall)",
  "options": [
    {
      "text": "Option text that could plausibly be correct",
      "isCorrect": false,
      "explanation": "Educational explanation of why this is incorrect and what the misconception is"
    },
    {
      "text": "The correct option text",
      "isCorrect": true,
      "explanation": "Explanation of why this is correct and reinforcement of the key concept"
    }
  ]
}

Return ONLY valid JSON, no additional text or formatting.

${stateContextBlock}`.trimEnd();

    const userPrompt = `Based on the following slide content, create an MCQ question:

${material}`;

    const { text: content } = await generateText({
      model: aiProvider.chatModel(getModel()),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    if (!content) {
      return {
        success: false,
        error: "No content generated",
      };
    }

    // Parse the JSON response
    let mcqData: GeneratedMCQ;
    try {
      // Remove any potential markdown code block wrappers
      const cleanedContent = content
        .replace(/^```(?:json)?\n?/gm, "")
        .replace(/```$/gm, "")
        .trim();
      mcqData = JSON.parse(cleanedContent);
    } catch {
      return {
        success: false,
        error: "Failed to parse generated MCQ",
      };
    }

    // Validate the response structure
    if (
      !mcqData.title ||
      !mcqData.question ||
      !Array.isArray(mcqData.options) ||
      mcqData.options.length < 2
    ) {
      return {
        success: false,
        error: "Invalid MCQ structure generated",
      };
    }

    // Ensure each option has an id
    const optionsWithIds = mcqData.options.map((opt) => ({
      id: crypto.randomUUID(),
      text: opt.text,
      isCorrect: opt.isCorrect,
      explanation: opt.explanation || "",
    }));

    return {
      success: true,
      mcq: {
        title: mcqData.title,
        question: mcqData.question,
        options: optionsWithIds,
      },
    };
  } catch (error) {
    console.error("Error generating MCQ:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate MCQ",
    };
  }
}
