"use server";

import { currentUser } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";
import db from "@/db/client";
import {
  content,
  course as courseTable,
  module as moduleTable,
  option,
  question,
  slide,
  written,
} from "@/db/schema";
import { CourseOutline, ModuleOutline } from "@/lib/course-ai-service";
import {
  generateSlideContent,
  generateSlideWithQuestion,
} from "@/app/course/edit/[id]/slide/ai-actions";
import { generateMCQFromSlide } from "@/app/course/edit/[id]/question/ai-actions";
import {
  generateWrittenTask,
  GeneratedWrittenTask,
} from "@/app/course/edit/[id]/written/ai-actions";
import { AiScope, GenerationState, loadAiContext } from "@/lib/ai-context";

/** Older outlines were capped at ten modules; keep generated courses the same size. */
const MAX_MODULES = 10;

export interface CourseSkeletonModule {
  id: string;
  title: string;
  order: number;
}

export interface CourseSkeleton {
  id: string;
  title: string;
  description: string;
  modules: CourseSkeletonModule[];
}

export interface ModuleGenerationResult {
  slides: number;
  questions: number;
  written: boolean;
}

/**
 * Saves the course and its module list before any content is generated, so the
 * editor shows the structure straight away and a failed build leaves a course
 * that can be resumed instead of a half-written one.
 */
export async function createCourseSkeleton(
  outline: CourseOutline
): Promise<{ success: boolean; course?: CourseSkeleton; error?: string }> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const [course] = await db
      .insert(courseTable)
      .values({
        name: outline.title,
        description: outline.description,
        difficulty: outline.difficulty,
        lang: outline.language,
        thumbnail_url: "",
        creator: user.id,
      })
      .returning();

    const modules: CourseSkeletonModule[] = [];
    try {
      for (const moduleOutline of outline.modules.slice(0, MAX_MODULES)) {
        const [newModule] = await db
          .insert(moduleTable)
          .values({
            title: moduleOutline.title,
            course_id: course.id,
            order: moduleOutline.order ?? modules.length + 1,
          })
          .returning();
        modules.push({
          id: newModule.id,
          title: newModule.title,
          order: newModule.order ?? modules.length + 1,
        });
      }
    } catch (error) {
      // No transactions on the HTTP driver: undo the empty course ourselves.
      await db.delete(moduleTable).where(eq(moduleTable.course_id, course.id));
      await db.delete(courseTable).where(eq(courseTable.id, course.id));
      throw error;
    }

    return {
      success: true,
      course: {
        id: course.id,
        title: course.name,
        description: course.description,
        modules,
      },
    };
  } catch (error) {
    console.error("Error creating course skeleton:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}

/**
 * Writes one module's slides, questions and written task. Everything is
 * generated in memory first and only then saved, so an AI failure leaves the
 * module empty and a retry starts clean.
 */
export async function generateModuleContent(
  courseId: string,
  moduleId: string,
  moduleOutline: ModuleOutline
): Promise<{
  success: boolean;
  module?: ModuleGenerationResult;
  error?: string;
}> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dbCourse = await db.query.course.findFirst({
      where: eq(courseTable.id, courseId),
      with: {
        modules: {
          orderBy: asc(moduleTable.order),
          columns: { id: true, title: true, order: true },
        },
      },
    });
    if (!dbCourse || dbCourse.creator !== user.id) {
      return { success: false, error: "Course not found" };
    }
    const position = dbCourse.modules.findIndex((m) => m.id === moduleId);
    if (position === -1) {
      return { success: false, error: "Module not found" };
    }

    const context = (await loadAiContext({ courseId, moduleId })) ?? {};
    context.module = {
      title: moduleOutline.title,
      description: moduleOutline.description,
      learningObjectives: moduleOutline.learningObjectives,
      position: position + 1,
      totalModules: dbCourse.modules.length,
    };
    const scope: AiScope = { courseId, moduleId, context };
    const state: GenerationState =
      context.state ?? (context.state = { slides: [], questions: [], written: [] });

    const drafts = await buildModuleDrafts(moduleOutline, scope, state);
    const saved = await saveModuleDrafts(moduleId, drafts);

    return { success: true, module: saved };
  } catch (error) {
    console.error("Error generating module content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to write module",
    };
  }
}

interface DraftOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

type DraftItem =
  | { type: "SLIDE"; title: string; content: string }
  | {
      type: "QUESTION";
      title: string;
      question: string;
      options: DraftOption[];
    };

/**
 * Builds every item for a module in memory and records them in the shared
 * generation state, so later calls build on them instead of repeating them.
 */
async function buildModuleDrafts(
  moduleOutline: ModuleOutline,
  scope: AiScope,
  state: GenerationState
): Promise<{ items: DraftItem[]; writtenTask: GeneratedWrittenTask }> {
  const items: DraftItem[] = [];
  const objectives = moduleOutline.learningObjectives
    .map((objective) => objective.trim())
    .filter(Boolean);

  // Hand-written questions replace the one-question-per-card behaviour.
  const hasProvidedQuestions = Boolean(moduleOutline.questions?.length);
  const askQuestion = !hasProvidedQuestions;
  const recordSlide = (title: string, slideContent: string) => {
    items.push({ type: "SLIDE", title, content: slideContent });
    state.slides!.push({ module: moduleOutline.title, title });
  };
  const recordQuestion = (questionDraft: {
    title: string;
    question: string;
    options?: DraftOption[];
  }) => {
    items.push({
      type: "QUESTION",
      title: questionDraft.title,
      question: questionDraft.question,
      options: questionDraft.options ?? [],
    });
    state.questions!.push({ module: moduleOutline.title, title: questionDraft.title });
  };

  if (moduleOutline.slides && moduleOutline.slides.length > 0) {
    for (let j = 0; j < moduleOutline.slides.length; j++) {
      const provided = moduleOutline.slides[j];
      recordSlide(provided.title, provided.content);

      if (!askQuestion) continue;
      const questionResult = await generateMCQFromSlide(
        `Check that the learner understood this slide. Write a 3-4 option multiple choice question by default; use true/false only when the slide's core point is one clear binary claim the learner should judge. Ask about this slide only.\n\n--- ${provided.title} ---\n${provided.content}`,
        scope,
        "mixed"
      );
      if (questionResult.success && questionResult.mcq) {
        recordQuestion({
          title:
            questionResult.mcq.title || `Question for ${provided.title}`,
          question: questionResult.mcq.question,
          options: questionResult.mcq.options,
        });
      }
    }
  } else {
    const cardCount = Math.min(Math.max(objectives.length + 1, 3), 5);

    for (let i = 0; i < cardCount; i++) {
      let slidePrompt: string;

      if (i === 0) {
        slidePrompt = `Write card 1 of ${cardCount} for the module "${moduleOutline.title}".

Teach the module's single core idea and make it concrete with one real-world example. Do not introduce the module, list what will be covered, or summarise it.
Module description: ${moduleOutline.description}`;
      } else {
        const objective = objectives[i - 1];
        const angle =
          i % 2 === 1
            ? "Angle: show a concrete real-world example that makes this objective click."
            : "Angle: mark the distinction from a nearby idea, or the mistake learners commonly make.";

        slidePrompt = objective
          ? `Write card ${i + 1} of ${cardCount} for the module "${moduleOutline.title}".

Cover exactly this one learning objective: "${objective}"
${angle}
Do not cover any other objective, and do not summarise the module.`
          : `Write card ${i + 1} of ${cardCount} for the module "${moduleOutline.title}".

${
  i % 2 === 1
    ? "Show one concrete real-world example of the module's idea."
    : "Show the distinction between the module's idea and the mistake learners commonly make."
}
Do not introduce or summarise the module.`;
      }

      // One call writes a card and its question; without a question the card
      // comes back as plain Markdown rather than JSON.
      if (askQuestion) {
        const cardResult = await generateSlideWithQuestion(slidePrompt, scope);
        if (cardResult.success && cardResult.card) {
          recordSlide(cardResult.card.title, cardResult.card.content);
          recordQuestion(cardResult.card.question);
        }
        continue;
      }

      const slideResult = await generateSlideContent(slidePrompt, undefined, scope);
      if (slideResult.success && slideResult.content) {
        recordSlide(slideResult.title || `Slide ${i + 1}`, slideResult.content);
      }
    }
  }

  for (let j = 0; j < (moduleOutline.questions?.length ?? 0); j++) {
    const provided = moduleOutline.questions![j];
    recordQuestion({
      title: provided.title || `Question ${j + 1}`,
      question: provided.content,
      options: provided.options,
    });
  }

  // One written practice task per module, after the questions. If the AI call
  // fails, a deterministic task still gives every module a written part.
  const writtenMaterial = items
    .filter((item): item is Extract<DraftItem, { type: "SLIDE" }> => item.type === "SLIDE")
    .map((item) => `--- ${item.title} ---\n${item.content}`)
    .join("\n\n");
  const writtenResult = writtenMaterial.trim()
    ? await generateWrittenTask(writtenMaterial, scope)
    : null;
  if (writtenResult && !writtenResult.success) {
    console.warn(
      `Using a fallback written task for "${moduleOutline.title}": ${writtenResult.error}`
    );
  }
  const writtenTask = writtenResult?.success
    ? writtenResult.task
    : buildFallbackWrittenTask(moduleOutline);
  state.written!.push({ module: moduleOutline.title, title: writtenTask.title });

  return { items, writtenTask };
}

/** Persists a module's drafts in order: card, its question, then the written task. */
async function saveModuleDrafts(
  moduleId: string,
  { items, writtenTask }: Awaited<ReturnType<typeof buildModuleDrafts>>
): Promise<ModuleGenerationResult> {
  let order = 0;
  let slides = 0;
  let questions = 0;

  for (const item of items) {
    const [contentItem] = await db
      .insert(content)
      .values({ type: item.type, order: order++, module_id: moduleId })
      .returning();

    if (item.type === "SLIDE") {
      await db.insert(slide).values({
        title: item.title,
        content: item.content,
        module_id: moduleId,
        content_item_id: contentItem.id,
      });
      slides++;
      continue;
    }

    const [questionRecord] = await db
      .insert(question)
      .values({
        title: item.title,
        content: item.question,
        module_id: moduleId,
        content_item_id: contentItem.id,
      })
      .returning();

    for (const optionData of item.options) {
      await db.insert(option).values({
        text: optionData.text,
        isCorrect: optionData.isCorrect,
        explanation: optionData.explanation || "",
        questionId: questionRecord.id,
      });
    }
    questions++;
  }

  const [writtenContentItem] = await db
    .insert(content)
    .values({ type: "WRITTEN", order: order++, module_id: moduleId })
    .returning();
  await db.insert(written).values({
    title: writtenTask.title,
    prompt: writtenTask.prompt,
    guidance: writtenTask.guidance ?? null,
    module_id: moduleId,
    content_item_id: writtenContentItem.id,
  });

  return { slides, questions, written: true };
}

/** Deterministic written task for when the AI call fails, so no module is left without practice. */
function buildFallbackWrittenTask(
  moduleOutline: ModuleOutline
): GeneratedWrittenTask {
  const objectives = moduleOutline.learningObjectives
    .map((objective) => objective.trim())
    .filter(Boolean);
  const titleWords = moduleOutline.title.trim().split(/\s+/).slice(0, 5).join(" ");

  return {
    title: `Explain ${titleWords}`,
    prompt: `In 3-6 sentences, explain the core idea of "${moduleOutline.title}" in your own words and give one concrete example.`,
    guidance:
      objectives.length > 0
        ? `A strong answer covers: ${objectives.slice(0, 3).join("; ")}.`
        : `A strong answer states the core idea and supports it with one concrete example.`,
  };
}
