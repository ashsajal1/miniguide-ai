"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/prisma/client";
import { CourseOutline, ModuleOutline } from "@/lib/course-ai-service";
import { generateSlideContent } from "@/app/course/edit/[id]/slide/ai-actions";
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

    const course = await prisma.course.create({
      data: {
        name: outline.title,
        description: outline.description,
        difficulty: outline.difficulty,
        lang: outline.language,
        thumbnail_url: "", // Will be updated later if needed
        creator: user.id,
      },
    });

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
      const newModule = await prisma.module.create({
        data: {
          title: moduleOutline.title,
          course_id: course.id,
          order: moduleOutline.order ?? moduleOrder,
        },
      });

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

      // Generate slides for this module (or use provided ones)
      let slides: GeneratedSlide[];
      if (moduleOutline.slides && moduleOutline.slides.length > 0) {
        // Use provided slides
        slides = [];
        for (let j = 0; j < moduleOutline.slides.length; j++) {
          const slideOutline = moduleOutline.slides[j];

          // Create content relationship first
          const contentItem = await prisma.content.create({
            data: {
              type: 'SLIDE',
              order: orderCursor.next++,
              module_id: moduleId,
            },
          });

          // Create slide in database
          const slide = await prisma.slide.create({
            data: {
              title: slideOutline.title,
              content: slideOutline.content,
              module_id: moduleId,
              content_item_id: contentItem.id,
            },
          });

          slides.push({
            id: slide.id,
            title: slide.title ?? `Slide ${j + 1}`,
            content: slide.content,
            order: contentItem.order,
          });

          generationState.slides!.push({
            module: moduleOutline.title,
            title: slide.title ?? `Slide ${j + 1}`,
          });
        }
      } else {
        // Generate slides using AI
        slides = await generateSlidesForModule(
          moduleOutline,
          moduleId,
          aiScope,
          orderCursor
        );
      }
      generatedModule.slides = slides;

      // Generate questions for this module (or use provided ones)
      let questions: GeneratedQuestion[];
      if (moduleOutline.questions && moduleOutline.questions.length > 0) {
        // Use provided questions
        questions = [];
        for (let j = 0; j < moduleOutline.questions.length; j++) {
          const questionOutline = moduleOutline.questions[j];

          // Create content relationship first
          const questionContentItem = await prisma.content.create({
            data: {
              type: 'QUESTION',
              order: orderCursor.next++,
              module_id: moduleId,
            },
          });

          // Create question in database
          const questionRecord = await prisma.question.create({
            data: {
              title: questionOutline.title,
              content: questionOutline.content,
              module_id: moduleId,
              content_item_id: questionContentItem.id,
            },
          });

          // Create options
          const questionOptions: QuestionOption[] = [];
          for (const optionData of questionOutline.options) {
            const option = await prisma.option.create({
              data: {
                text: optionData.text,
                isCorrect: optionData.isCorrect,
                explanation: optionData.explanation || "",
                questionId: questionRecord.id,
              },
            });

            questionOptions.push({
              id: option.id,
              text: option.text,
              isCorrect: option.isCorrect,
              explanation: option.explanation ?? "",
            });
          }

          questions.push({
            id: questionRecord.id,
            title: questionRecord.title ?? `Question ${j + 1}`,
            question: questionRecord.content,
            options: questionOptions,
            order: questionContentItem.order,
          });

          generationState.questions!.push({
            module: moduleOutline.title,
            title: questionRecord.title ?? `Question ${j + 1}`,
          });
        }
      } else {
        // Generate questions using AI
        questions = await generateQuestionsForModule(
          slides,
          moduleId,
          moduleOutline,
          aiScope,
          orderCursor
        );
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

      const writtenContentItem = await prisma.content.create({
        data: {
          type: "WRITTEN",
          order: orderCursor.next++,
          module_id: moduleId,
        },
      });
      const writtenRecord = await prisma.written.create({
        data: {
          title: writtenTask.title,
          prompt: writtenTask.prompt,
          guidance: writtenTask.guidance ?? null,
          module_id: moduleId,
          content_item_id: writtenContentItem.id,
        },
      });

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
 */
async function generateSlidesForModule(
  moduleOutline: ModuleOutline,
  moduleId: string,
  scope: AiScope | undefined,
  orderCursor: OrderCursor
): Promise<GeneratedSlide[]> {
  const slides: GeneratedSlide[] = [];
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

      // Generate one card (stateful: sees course, module and prior cards)
      const slideResult = await generateSlideContent(slidePrompt, undefined, scope);

      if (slideResult.success && slideResult.content) {
        // Create content relationship first
        const contentItem = await prisma.content.create({
          data: {
            type: 'SLIDE',
            order: orderCursor.next++,
            module_id: moduleId,
          },
        });

        // Create slide in database
        const slide = await prisma.slide.create({
          data: {
            title: slideResult.title || `Slide ${i + 1}`,
            content: slideResult.content,
            module_id: moduleId,
            content_item_id: contentItem.id,
          },
        });

        slides.push({
          id: slide.id,
          title: slide.title ?? `Slide ${i + 1}`,
          content: slide.content,
          order: contentItem.order,
        });

        // Record in the shared generation state so the next slide/question builds on this one
        scope?.context?.state?.slides?.push({
          module: moduleOutline.title,
          title: slide.title ?? `Slide ${i + 1}`,
        });
      }
    }
  } catch (error) {
    console.error("Error generating slides for module:", error);
  }

  return slides;
}

/**
 * Generates questions for a module based on its slides
 */
async function generateQuestionsForModule(
  slides: GeneratedSlide[],
  moduleId: string,
  moduleOutline: ModuleOutline,
  scope: AiScope | undefined,
  orderCursor: OrderCursor
): Promise<GeneratedQuestion[]> {
  const questions: GeneratedQuestion[] = [];

  try {
    // Generate 2 questions per module for comprehensive assessment (limited to prevent large payloads)
    const numQuestions = Math.min(Math.max(slides.length, 2), 2);

    // Create comprehensive module context for better questions
    const moduleContext = `
Module: ${slides[0]?.title || 'Module Content'}
All Slides Content:
${slides.map(slide => `--- ${slide.title} ---\n${slide.content}`).join('\n\n')}

Learning Objectives: ${moduleOutline.learningObjectives.join(', ')}
    `.trim();

    for (let i = 0; i < numQuestions; i++) {
      let questionType = 'conceptual';

      if (i === 0) {
        questionType = 'foundational'; // Test basic understanding
      } else if (i === 1) {
        questionType = 'application'; // Test ability to apply concepts
      } else {
        questionType = 'analysis'; // Test deeper understanding
      }

      // Create specialized prompts for different question types
      const questionPrompt = `Based on this comprehensive module content, create a ${questionType} multiple choice question:

${moduleContext}

Question Type: ${questionType}

Guidelines for ${questionType} questions:
${questionType === 'foundational' ? '- Test basic definitions, terminology, and core concepts' :
 questionType === 'application' ? '- Test ability to apply concepts to real scenarios' :
 '- Test critical thinking, analysis, and connections between ideas'}

Create a challenging but fair question that requires understanding of the material, not just memorization.`;

      // Generate question using existing AI function with enhanced context (stateful: sees course, module and prior questions)
      const questionResult = await generateMCQFromSlide(questionPrompt, scope);

      if (questionResult.success && questionResult.mcq) {
        // Create content relationship first
        const questionContentItem = await prisma.content.create({
          data: {
            type: 'QUESTION',
            order: orderCursor.next++,
            module_id: moduleId,
          },
        });

        // Create question in database
        const questionRecord = await prisma.question.create({
          data: {
            title: questionResult.mcq.title || `Question ${i + 1}`,
            content: questionResult.mcq.question,
            module_id: moduleId,
            content_item_id: questionContentItem.id,
          },
        });

        // Create options
        const questionOptions: QuestionOption[] = [];
        for (const optionData of questionResult.mcq.options) {
          const option = await prisma.option.create({
            data: {
              text: optionData.text,
              isCorrect: optionData.isCorrect,
              explanation: optionData.explanation || "",
              questionId: questionRecord.id,
            },
          });

          questionOptions.push({
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
            explanation: option.explanation ?? "",
          });
        }

        questions.push({
          id: questionRecord.id,
          title: questionRecord.title ?? `Question ${i + 1}`,
          question: questionRecord.content,
          options: questionOptions,
          order: questionContentItem.order,
        });

        // Record in the shared generation state so the next question builds on this one
        scope?.context?.state?.questions?.push({
          module: moduleOutline.title,
          title: questionRecord.title ?? `Question ${i + 1}`,
        });
      }
    }
  } catch (error) {
    console.error("Error generating questions for module:", error);
  }

  return questions;
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

