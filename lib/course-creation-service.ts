"use server";

import { currentUser } from "@clerk/nextjs/server";
import db from "@/db/client";
import { content, course as courseTable, module as moduleTable, option, question, slide, written } from "@/db/schema";
import { CourseOutline, ModuleOutline } from "@/lib/course-ai-service";
import { generateSlideContent, generateSlideWithQuestion } from "@/app/course/edit/[id]/slide/ai-actions";
import { generateMCQFromSlide } from "@/app/course/edit/[id]/question/ai-actions";
import {
  generateWrittenTask,
  GeneratedWrittenTask,
} from "@/app/course/edit/[id]/written/ai-actions";
import {
  AiScope,
  GenerationState,
  ResolvedAiContext,
  loadLearnerProfile,
} from "@/lib/ai-context";

export interface CourseGenerationProgress {
  stage:
    | "creating-course"
    | "generating-slides"
    | "generating-questions"
    | "generating-written"
    | "finalizing";
  progress: number;
  message: string;
  currentModule?: number;
  totalModules?: number;
}

export interface GeneratedCourse {
  id: string;
  title: string;
  description: string;
  modules: GeneratedModule[];
}

export interface GeneratedModule {
  id: string;
  title: string;
  order: number;
  slides: GeneratedSlide[];
  questions: GeneratedQuestion[];
  written: GeneratedWritten | null;
}

export interface GeneratedWritten {
  id: string;
  title: string;
  prompt: string;
  guidance?: string;
  order: number;
}

export interface GeneratedSlide {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface GeneratedQuestion {
  id: string;
  title: string;
  question: string;
  options: QuestionOption[];
  order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

/** Per-module content order: 0, 1, 2… so a module can hold any number of items. */
interface OrderCursor {
  next: number;
}

/**
 * Creates a full course from an outline, including slides and questions
 */
export async function createCourseFromOutline(
  outline: CourseOutline
): Promise<{ success: boolean; course?: GeneratedCourse; error?: string }> {
  "use server";

  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Stage 1: Create course record

    const [course] = await db.insert(courseTable).values({
      name: outline.title,
      description: outline.description,
      difficulty: outline.difficulty,
      lang: outline.language,
      thumbnail_url: "", // Will be updated later if needed
      creator: user.id,
    }).returning();

    const generatedCourse: GeneratedCourse = {
      id: course.id,
      title: course.name,
      description: course.description,
      modules: [],
    };

    // Stateful AI context shared across every generation call in this run:
    // the course (with its full module roadmap) plus an accumulating record of
    // everything already generated, so later modules/slides/questions build on
    // earlier ones instead of repeating them.
    const totalModules = Math.min(outline.modules.length, 10);
    const generationState: GenerationState = {
      slides: [],
      questions: [],
      written: [],
    };
    const aiContext: ResolvedAiContext = {
      learnerProfile: await loadLearnerProfile(),
      course: {
        title: outline.title,
        description: outline.description,
        difficulty: outline.difficulty,
        language: outline.language,
        roadmap: outline.modules.slice(0, totalModules).map((m, idx) => ({
          order: idx + 1,
          title: m.title,
          description: m.description,
        })),
      },
      state: generationState,
    };
    const aiScope: AiScope = { courseId: course.id, context: aiContext };

    // Stage 2: Generate modules with content (limit to prevent payload size issues)

    for (let i = 0; i < totalModules; i++) {
      const moduleOutline = outline.modules[i];
      const moduleOrder = i + 1;

      // Create module
      const [newModule] = await db.insert(moduleTable).values({
        title: moduleOutline.title,
        course_id: course.id,
        order: moduleOutline.order ?? moduleOrder,
      }).returning();

      const moduleId = newModule.id;

      // Point the shared context at the module currently being generated
      aiContext.module = {
        title: moduleOutline.title,
        description: moduleOutline.description,
        learningObjectives: moduleOutline.learningObjectives,
        position: moduleOrder,
        totalModules,
      };

      const generatedModule: GeneratedModule = {
        id: moduleId,
        title: newModule.title,
        order: newModule.order ?? moduleOrder,
        slides: [],
        questions: [],
        written: null,
      };

      // Content order is sequential per module, so 5 cards + 2 questions + a
      // written task cannot collide the way a stride of 10 would.
      const orderCursor: OrderCursor = { next: 0 };

      // Every slide is followed by a check-your-understanding question, unless
      // the outline already carries hand-written questions for this module.
      const hasProvidedQuestions = Boolean(moduleOutline.questions?.length);
      const askQuestion = !hasProvidedQuestions;

      let slides: GeneratedSlide[] = [];
      let questions: GeneratedQuestion[] = [];

      if (moduleOutline.slides && moduleOutline.slides.length > 0) {
        // Use provided slides; each still gets its own generated question.
        for (let j = 0; j < moduleOutline.slides.length; j++) {
          const slideOutline = moduleOutline.slides[j];
          const savedSlide = await saveSlide(
            slideOutline.title,
            slideOutline.content,
            moduleId,
            moduleOutline,
            aiScope,
            orderCursor,
            `Slide ${j + 1}`
          );
          slides.push(savedSlide);

          const question = askQuestion
            ? await generateQuestionForSlide(
                savedSlide,
                moduleId,
                moduleOutline,
                aiScope,
                orderCursor
              )
            : null;
          if (question) questions.push(question);
        }
      } else {
        // Generate slides using AI
        const generated = await generateSlidesForModule(
          moduleOutline,
          moduleId,
          aiScope,
          orderCursor,
          askQuestion
        );
        slides = generated.slides;
        questions = generated.questions;
      }
      generatedModule.slides = slides;

      if (hasProvidedQuestions) {
        for (let j = 0; j < moduleOutline.questions!.length; j++) {
          const questionOutline = moduleOutline.questions![j];
          const savedQuestion = await saveQuestion(
            {
              title: questionOutline.title,
              question: questionOutline.content,
              options: questionOutline.options,
            },
            moduleId,
            orderCursor,
            `Question ${j + 1}`
          );
          questions.push(savedQuestion);
          generationState.questions!.push({
            module: moduleOutline.title,
            title: savedQuestion.title,
          });
        }
      }
      generatedModule.questions = questions;

      // One written practice task per module, after the questions. If the AI
      // call fails, a deterministic task still gives every module a written part.
      const writtenMaterial = slides
        .map((slide) => `--- ${slide.title} ---\n${slide.content}`)
        .join("\n\n");
      const writtenResult = writtenMaterial.trim()
        ? await generateWrittenTask(writtenMaterial, aiScope)
        : null;
      if (writtenResult && !writtenResult.success) {
        console.warn(
          `Using a fallback written task for "${moduleOutline.title}": ${writtenResult.error}`
        );
      }
      const writtenTask: GeneratedWrittenTask = writtenResult?.success
        ? writtenResult.task
        : buildFallbackWrittenTask(moduleOutline);

      const [writtenContentItem] = await db.insert(content).values({
        type: "WRITTEN",
        order: orderCursor.next++,
        module_id: moduleId,
      }).returning();
      const [writtenRecord] = await db.insert(written).values({
        title: writtenTask.title,
        prompt: writtenTask.prompt,
        guidance: writtenTask.guidance ?? null,
        module_id: moduleId,
        content_item_id: writtenContentItem.id,
      }).returning();

      generatedModule.written = {
        id: writtenRecord.id,
        title: writtenRecord.title ?? writtenTask.title,
        prompt: writtenRecord.prompt,
        guidance: writtenRecord.guidance ?? undefined,
        order: writtenContentItem.order,
      };
      generationState.written!.push({
        module: moduleOutline.title,
        title: generatedModule.written.title,
      });

      generatedCourse.modules.push(generatedModule);
    }

    // Stage 3: Finalize
    // Update course with completion status or any final touches

    return { success: true, course: generatedCourse };

  } catch (error) {
    console.error("Error creating course from outline:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}

/**
 * Generates 3-5 atomic cards for a module. Each card teaches exactly one
 * idea: card 0 is the core idea with a concrete example, and each remaining
 * card takes one learning objective, alternating example and distinction.
 * Each card is followed by its own check-your-understanding question.
 */
async function generateSlidesForModule(
  moduleOutline: ModuleOutline,
  moduleId: string,
  scope: AiScope | undefined,
  orderCursor: OrderCursor,
  askQuestion: boolean
): Promise<{ slides: GeneratedSlide[]; questions: GeneratedQuestion[] }> {
  const slides: GeneratedSlide[] = [];
  const questions: GeneratedQuestion[] = [];
  const objectives = moduleOutline.learningObjectives
    .map((objective) => objective.trim())
    .filter(Boolean);
  const cardCount = Math.min(Math.max(objectives.length + 1, 3), 5);

  try {
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

      // Generate one card with its question in a single call (stateful: sees
      // course, module and prior cards). Without a question, cards generate as
      // plain Markdown rather than JSON.
      if (askQuestion) {
        const cardResult = await generateSlideWithQuestion(slidePrompt, scope);
        if (cardResult.success && cardResult.card) {
          const savedSlide = await saveSlide(
            cardResult.card.title,
            cardResult.card.content,
            moduleId,
            moduleOutline,
            scope,
            orderCursor,
            `Slide ${i + 1}`
          );
          slides.push(savedSlide);

          const savedQuestion = await saveQuestion(
            cardResult.card.question,
            moduleId,
            orderCursor,
            `Question for ${savedSlide.title}`
          );
          questions.push(savedQuestion);
          scope?.context?.state?.questions?.push({
            module: moduleOutline.title,
            title: savedQuestion.title,
          });
        }
        continue;
      }

      const slideResult = await generateSlideContent(slidePrompt, undefined, scope);

      if (slideResult.success && slideResult.content) {
        slides.push(
          await saveSlide(
            slideResult.title,
            slideResult.content,
            moduleId,
            moduleOutline,
            scope,
            orderCursor,
            `Slide ${i + 1}`
          )
        );
      }
    }
  } catch (error) {
    console.error("Error generating slides for module:", error);
  }

  return { slides, questions };
}

/** Persists one slide and records it in the shared generation state. */
async function saveSlide(
  title: string | null | undefined,
  slideContent: string,
  moduleId: string,
  moduleOutline: ModuleOutline,
  scope: AiScope | undefined,
  orderCursor: OrderCursor,
  fallbackTitle: string
): Promise<GeneratedSlide> {
  const [contentItem] = await db.insert(content).values({
    type: "SLIDE",
    order: orderCursor.next++,
    module_id: moduleId,
  }).returning();

  const [slideRecord] = await db.insert(slide).values({
    title: title || fallbackTitle,
    content: slideContent,
    module_id: moduleId,
    content_item_id: contentItem.id,
  }).returning();

  const savedSlide: GeneratedSlide = {
    id: slideRecord.id,
    title: slideRecord.title ?? fallbackTitle,
    content: slideRecord.content,
    order: contentItem.order,
  };

  // Record in the shared generation state so the next slide/question builds on this one
  scope?.context?.state?.slides?.push({
    module: moduleOutline.title,
    title: savedSlide.title,
  });

  return savedSlide;
}

/** Generates and saves one true/false or MCQ question from an existing slide. */
async function generateQuestionForSlide(
  slide: GeneratedSlide,
  moduleId: string,
  moduleOutline: ModuleOutline,
  scope: AiScope | undefined,
  orderCursor: OrderCursor
): Promise<GeneratedQuestion | null> {
  const questionResult = await generateMCQFromSlide(
    `Check that the learner understood this slide. Write a 3-4 option multiple choice question by default; use true/false only when the slide's core point is one clear binary claim the learner should judge. Ask about this slide only.\n\n--- ${slide.title} ---\n${slide.content}`,
    scope,
    "mixed"
  );

  if (!questionResult.success || !questionResult.mcq) {
    return null;
  }

  const savedQuestion = await saveQuestion(
    questionResult.mcq,
    moduleId,
    orderCursor,
    `Question for ${slide.title}`
  );

  scope?.context?.state?.questions?.push({
    module: moduleOutline.title,
    title: savedQuestion.title,
  });

  return savedQuestion;
}

/** Persists one question with its options and returns it in the app's shape. */
async function saveQuestion(
  questionData: {
    title?: string | null;
    question: string;
    options: { text: string; isCorrect: boolean; explanation?: string }[];
  },
  moduleId: string,
  orderCursor: OrderCursor,
  fallbackTitle: string
): Promise<GeneratedQuestion> {
  const [questionContentItem] = await db.insert(content).values({
    type: "QUESTION",
    order: orderCursor.next++,
    module_id: moduleId,
  }).returning();

  const [questionRecord] = await db.insert(question).values({
    title: questionData.title || fallbackTitle,
    content: questionData.question,
    module_id: moduleId,
    content_item_id: questionContentItem.id,
  }).returning();

  const questionOptions: QuestionOption[] = [];
  for (const optionData of questionData.options) {
    const [createdOption] = await db.insert(option).values({
      text: optionData.text,
      isCorrect: optionData.isCorrect,
      explanation: optionData.explanation || "",
      questionId: questionRecord.id,
    }).returning();

    questionOptions.push({
      id: createdOption.id,
      text: createdOption.text,
      isCorrect: createdOption.isCorrect,
      explanation: createdOption.explanation ?? "",
    });
  }

  return {
    id: questionRecord.id,
    title: questionRecord.title ?? fallbackTitle,
    question: questionRecord.content,
    options: questionOptions,
    order: questionContentItem.order,
  };
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
        : "A strong answer states the core idea and supports it with one concrete example.",
  };
}

