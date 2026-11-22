"use server";

import { generateText } from "ai";
import { z } from "zod";
import { aiProvider, getModel, isAiConfigured } from "@/lib/ai";
import {
  AiScope,
  buildCoursePromptContext,
  buildLearnerPromptContext,
  buildStatePromptContext,
  resolveAiContext,
} from "@/lib/ai-context";

export interface GeneratedWrittenTask {
  title: string;
  prompt: string;
  guidance?: string;
}

const taskSchema = z.object({
  title: z.string().trim().min(1).max(90),
  prompt: z.string().trim().min(1).max(700),
  guidance: z.string().trim().max(700).optional().nullable(),
});

function stripCodeFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * Generates one short written task for a module. The learner answers in
 * 3-6 sentences and the answer is later assessed against this same material.
 */
export async function generateWrittenTask(
  material: string,
  scope?: AiScope
): Promise<
  { success: true; task: GeneratedWrittenTask } | { success: false; error: string }
> {
  if (!isAiConfigured()) {
    return { success: false, error: "AI provider is not configured" };
  }

  const context = await resolveAiContext(scope);
  const sourceMaterial = material.trim() || context?.previousSlideContent || "";

  if (!sourceMaterial.trim()) {
    return { success: false, error: "Module material is required" };
  }

  try {
    const courseContextBlock = buildCoursePromptContext(
      context?.course,
      context?.module
    );
    const stateContextBlock = buildStatePromptContext(context?.state);
    const learnerContextBlock = buildLearnerPromptContext(context?.learnerProfile);

    const systemPrompt = `You design one short written practice task for a module in a guided course.

${courseContextBlock}

${learnerContextBlock}

TASK REQUIREMENTS:
- Write one scenario or task that a learner can answer in 3-6 sentences.
- The task must be answerable using only the module material provided below. Never require outside facts.
- Never reveal, hint at, or restate the answer in the task. Ask the learner to explain, decide, compare, or apply.
- Never invent statistics, quotes, sources, company names, or claims that are not in the material.
- Do not duplicate or lightly rephrase the multiple-choice questions listed under ALREADY GENERATED.
- Stay in this module; do not ask about content the roadmap assigns to a later module.
- Use the course's established terms and write in the course language.
- title: at most 7 words, naming the skill the learner practises.
- prompt: 1-3 sentences, concrete and specific.
- guidance: 2-3 short points a strong answer should cover, phrased as hints, not the answers.

Return ONLY valid JSON with this exact shape, no markdown or code fences:
{
  "title": "string",
  "prompt": "string",
  "guidance": "string"
}

${stateContextBlock}`.trimEnd();

    const userPrompt = `MODULE MATERIAL:
${sourceMaterial.slice(0, 6000)}

Design the written practice task for this module.`;

    const { text } = await generateText({
      model: aiProvider.chatModel(getModel()),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.6,
      maxOutputTokens: 700,
    });

    if (!text) {
      return { success: false, error: "No task generated" };
    }

    let raw: unknown;
    try {
      raw = JSON.parse(stripCodeFences(text));
    } catch {
      return { success: false, error: "Failed to parse generated task" };
    }

    const parsed = taskSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: "Invalid written task generated" };
    }

    return {
      success: true,
      task: {
        title: parsed.data.title,
        prompt: parsed.data.prompt,
        guidance: parsed.data.guidance?.trim() || undefined,
      },
    };
  } catch (error) {
    console.error("Error generating written task:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate task",
    };
  }
}
