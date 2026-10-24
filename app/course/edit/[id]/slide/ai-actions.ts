"use server";

import { generateText } from "ai";
import { aiProvider, getModel, isAiConfigured } from "@/lib/ai";

// Detect if the docs contain URLs
function containsUrls(text: string): boolean {
  const urlPattern = /https?:\/\/[^\s]+/gi;
  return urlPattern.test(text);
}

export async function generateSlideContent(prompt: string, docs?: string) {
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

    const systemPrompt = `You are an expert educational content creator specializing in creating engaging, effective course slides. Generate comprehensive slide content in Markdown format.

CONTENT REQUIREMENTS:
- Create engaging, educational content suitable for online learning
- Include 4-6 key points or concepts per slide (not just 1)
- Use a mix of text, examples, and actionable insights
- Make content memorable and practical
- Include relevant statistics, quotes, or frameworks when appropriate
- Structure content to facilitate learning and retention

FORMATTING RULES:
- Use clear headings and subheadings
- Bullet points for key concepts and lists
- Bold important terms and **key takeaways**
- Include practical examples or scenarios
- End with 1-2 thought-provoking questions or action items
- Keep total content to 150-200 words for readability

EDUCATIONAL PRINCIPLES:
- Start with what students already know, then build new knowledge
- Include real-world applications and examples
- Use active language and actionable insights
- Connect concepts to broader learning objectives

${hasUrls ? "When URLs are provided, fetch and analyze the content from those URLs to create accurate, up-to-date slides with current examples and data." : ""}

Output ONLY the markdown content for the slide with a clear title, nothing else.`;


    const userPrompt = docs
      ? `Based on the following documentation/context:\n\n${docs}\n\nCreate a slide about: ${prompt}`
      : `Create a slide about: ${prompt}`;

    const { text } = await generateText({
      model: aiProvider.chatModel(model),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxOutputTokens: 2048,
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

