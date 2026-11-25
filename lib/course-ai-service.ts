"use server"

import { generateText } from "ai";
import { aiProvider, getModel, isAiConfigured } from "@/lib/ai";
import { buildLearnerPromptContext, loadLearnerProfile } from "@/lib/ai-context";
import {
  extractContentFromUrl,
  summarizeForOutline,
} from "@/lib/url-content-extractor";

export interface SlideOutline {
  title: string;
  content: string;
  order: number;
}

export interface QuestionOutline {
  title: string;
  content: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  order: number;
}

export interface ModuleOutline {
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedDuration: string;
  order: number;
  slides?: SlideOutline[];
  questions?: QuestionOutline[];
}

export interface CourseOutline {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  language: string;
  modules: ModuleOutline[];
}

export interface CourseOutlineResponse {
  success: boolean;
  outline?: CourseOutline;
  error?: string;
}

/**
 * Generates a course outline from a document URL.
 * Fetches the URL content ourselves, extracts clean text,
 * then sends it to the AI model for outline generation.
 */
export async function generateCourseOutline(url: string): Promise<CourseOutlineResponse> {
  "use server";
  if (!isAiConfigured()) {
    return {
      success: false,
      error: "AI service not configured",
    };
  }

  if (!url || !isValidUrl(url)) {
    return {
      success: false,
      error: "Invalid URL provided",
    };
  }

  try {
    // Step 1: Fetch and extract content from URL
    let extractedContent;
    try {
      extractedContent = await extractContentFromUrl(url);
    } catch (fetchError) {
      console.error("Failed to fetch URL content:", fetchError);
      return {
        success: false,
        error: `Failed to fetch content from URL: ${
          fetchError instanceof Error ? fetchError.message : "Unknown error"
        }. Please check the URL and try again.`,
      };
    }

    if (!extractedContent.text || extractedContent.text.trim().length < 50) {
      return {
        success: false,
        error:
          "Could not extract meaningful content from the URL. The page may be empty, require authentication, or contain only images/videos.",
      };
    }

    return await buildOutline(
      extractedContent.title,
      extractedContent.text,
      "Create a guide outline based on this content. The guide should teach the material covered in the document."
    );
  } catch (error) {
    console.error("Error generating course outline:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate course outline",
    };
  }
}

/**
 * Generates a guide outline from document text the learner pasted in
 * (for PDFs or files that cannot be fetched by URL).
 */
export async function generateCourseOutlineFromText(
  title: string,
  text: string
): Promise<CourseOutlineResponse> {
  "use server";
  if (!isAiConfigured()) {
    return { success: false, error: "AI service not configured" };
  }

  const content = text.trim();
  if (content.length < 50) {
    return {
      success: false,
      error:
        "Paste a little more text. We need at least a paragraph to build a useful guide.",
    };
  }

  try {
    return await buildOutline(
      title.trim() || "Untitled document",
      content,
      "Create a guide outline based on this pasted content. The guide should teach the material covered in the document."
    );
  } catch (error) {
    console.error("Error generating course outline from text:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate course outline",
    };
  }
}

/** Shared outline generation for URL and pasted-text sources. */
async function buildOutline(
  documentTitle: string,
  documentText: string,
  instruction: string
): Promise<CourseOutlineResponse> {
  const contentForAI = await summarizeForOutline(documentText);
  const learnerContextBlock = buildLearnerPromptContext(
    await loadLearnerProfile()
  );

  const systemPrompt = `Analyze the following document content and create a structured, personalised mini-guide outline.

Requirements:
- 3-6 modules forming a progressive learning path: each module must build on the previous one, starting from fundamentals and advancing to complex topics
- No topic overlap between modules: split concerns cleanly so each module owns a distinct part of the subject
- Specific, measurable learning objectives per module (2-4 each), phrased so later modules can assume earlier ones were learned
- Realistic time estimates per module
- Difficulty: Beginner/Intermediate/Advanced, calibrated to the learner's profile when one is provided
- Language matches document (default: English)
- Use the document's actual topics, terminology, and structure

${learnerContextBlock}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Guide title based on document content",
  "description": "2-3 sentence description of what this guide covers",
  "difficulty": "Beginner|Intermediate|Advanced",
  "language": "en",
  "estimatedDuration": "X hours",
  "modules": [
    {
      "title": "Module title",
      "description": "What this module covers and how it builds on earlier modules",
      "learningObjectives": ["Specific objective 1", "Specific objective 2"],
      "estimatedDuration": "X min",
      "order": 1
    }
  ]
}`;

  const userPrompt = `Document title: ${documentTitle}

Document content:
${contentForAI}

${instruction}`;

  const aiContent = await generateWithBackoff({
    model: aiProvider.chatModel(getModel()),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    maxOutputTokens: 4096,
  });

  if (!aiContent) {
    return {
      success: false,
      error: "No content generated from AI",
    };
  }

  let outlineData: CourseOutline;
  try {
    const cleanedContent = aiContent
      .replace(/^```(?:json)?\n?/gm, "")
      .replace(/```$/gm, "")
      .trim();
    outlineData = JSON.parse(cleanedContent);
  } catch (parseError) {
    console.error("Failed to parse outline JSON:", parseError);
    console.error("Raw content:", aiContent);
    return {
      success: false,
      error: "Failed to parse generated outline. Please try again.",
    };
  }

  if (!outlineData.title || !outlineData.modules || outlineData.modules.length === 0) {
    return {
      success: false,
      error: "Invalid outline structure generated",
    };
  }

  outlineData.modules.forEach((module, index) => {
    module.order = index + 1;
  });

  return {
    success: true,
    outline: outlineData,
  };
}

/** Waits out a spent per-minute quota once, honouring the provider's retry-after. */
async function generateWithBackoff(
  options: Parameters<typeof generateText>[0]
): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      const { text } = await generateText(options);
      return text;
    } catch (error) {
      const waitMs = retryAfterMs(error);
      if (attempt > 0 || waitMs === null) throw error;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

/** Delay before retrying a 429, or null when the error is not retryable. */
function retryAfterMs(error: unknown): number | null {
  const typed = error as {
    statusCode?: number;
    responseHeaders?: Record<string, string>;
  };
  if (typed?.statusCode !== 429) return null;
  const seconds = Number(typed.responseHeaders?.["retry-after"]);
  return Number.isFinite(seconds) && seconds > 0
    ? Math.min(seconds, 10) * 1000
    : 3000;
}

/**
 * Validates if a URL is properly formatted
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check for supported protocols (HTTP and HTTPS)
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Estimates course complexity and suggests generation settings
 */
export async function estimateCourseComplexity(outline: CourseOutline): Promise<{ totalSlides: number; totalQuestions: number; estimatedGenerationTime: string; }> {
  const moduleCount = outline.modules.length;
  const avgSlidesPerModule = outline.difficulty === 'Advanced' ? 3 : outline.difficulty === 'Intermediate' ? 2 : 1.5;
  const avgQuestionsPerModule = 2;

  const totalSlides = Math.round(moduleCount * avgSlidesPerModule);
  const totalQuestions = moduleCount * avgQuestionsPerModule;

  // Estimate generation time (rough calculation)
  const slideGenerationTime = totalSlides * 30; // 30 seconds per slide
  const questionGenerationTime = totalQuestions * 15; // 15 seconds per question
  const totalSeconds = slideGenerationTime + questionGenerationTime;

  const minutes = Math.ceil(totalSeconds / 60);
  const estimatedGenerationTime = minutes > 60 ?
    `${Math.ceil(minutes / 60)} hours` :
    `${minutes} minutes`;

  return {
    totalSlides,
    totalQuestions,
    estimatedGenerationTime,
  };
}