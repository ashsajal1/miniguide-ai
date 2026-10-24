import prisma from "@/prisma/client";

/**
 * Stateful context for AI generation.
 *
 * Every generation call (outline -> slides -> questions, at creation time or
 * from the editor) receives the same three blocks:
 *
 *   1. Course context  - what the whole guided course is about, its level and
 *                        its module roadmap, so content knows its place.
 *   2. Module context  - "Module 3 of 6", its focus and learning objectives,
 *                        for per-module personalization.
 *   3. Generation state- everything already generated (slide and question
 *                        titles), so later calls continue instead of repeat.
 */

/** Course-level facts every generation call should know. */
export interface CourseAiContext {
  title: string;
  description?: string;
  difficulty?: string;
  language?: string;
  /** Full module roadmap so content can acknowledge its place in the course. */
  roadmap?: { order: number; title: string; description?: string }[];
}

/** The module currently being generated into. */
export interface ModuleAiContext {
  title: string;
  description?: string;
  learningObjectives?: string[];
  /** 1-based position of the module in the course. */
  position?: number;
  totalModules?: number;
}

/** What has already been generated - the state carried between calls. */
export interface GenerationState {
  slides?: { module?: string; title: string }[];
  questions?: { module?: string; title: string }[];
}

/** Optional scope a caller can pass; ids are resolved against the database. */
export interface AiScope {
  courseId?: string;
  moduleId?: string;
  /** Pre-built context (e.g. from the outline during creation) skips the DB read. */
  context?: ResolvedAiContext;
}

/**
 * Resolves the effective context for a generation call: a pre-built context
 * wins, otherwise ids are loaded from the database.
 */
export async function resolveAiContext(scope?: AiScope): Promise<ResolvedAiContext | null> {
  if (!scope) return null;
  if (scope.context) return scope.context;
  if (!scope.courseId && !scope.moduleId) return null;
  return loadAiContext(scope);
}

export interface ResolvedAiContext {
  course?: CourseAiContext;
  module?: ModuleAiContext;
  state?: GenerationState;
  /** Last slide already in the module (used when no slide content is given). */
  previousSlideContent?: string | null;
}

const MAX_STATE_ITEMS = 60;

/** Human-readable course + module block, appended to the system prompt. */
export function buildCoursePromptContext(
  course?: CourseAiContext,
  module?: ModuleAiContext
): string {
  if (!course && !module) return "";

  const lines: string[] = ["COURSE CONTEXT"];

  if (course) {
    const level = course.difficulty ? ` - ${course.difficulty}` : "";
    lines.push(`Course: "${course.title}"${level}`);
    if (course.language) lines.push(`Course language: ${course.language}`);
    if (course.description) lines.push(`About the course: ${course.description}`);
    if (course.roadmap && course.roadmap.length > 0) {
      lines.push("Module roadmap (in teaching order):");
      for (const item of course.roadmap) {
        lines.push(`  ${item.order}. ${item.title}`);
      }
    }
  }

  if (module) {
    const position =
      module.position && module.totalModules
        ? `Module ${module.position} of ${module.totalModules}`
        : "Current module";
    lines.push(`${position}: "${module.title}"`);
    if (module.description) lines.push(`Module focus: ${module.description}`);
    if (module.learningObjectives && module.learningObjectives.length > 0) {
      lines.push("Learning objectives for this module:");
      for (const objective of module.learningObjectives) {
        lines.push(`  - ${objective}`);
      }
    }
  }

  return lines.join("\n");
}

/** Everything generated so far, so the model continues instead of repeats. */
export function buildStatePromptContext(state?: GenerationState): string {
  const slides = state?.slides ?? [];
  const questions = state?.questions ?? [];
  if (slides.length === 0 && questions.length === 0) return "";

  const lines: string[] = [
    "ALREADY GENERATED IN THIS COURSE (never repeat these - build on them and keep the same terminology):",
  ];

  for (const slide of slides.slice(-MAX_STATE_ITEMS)) {
    lines.push(
      `  - Slide${slide.module ? ` in "${slide.module}"` : ""}: "${slide.title}"`
    );
  }
  for (const question of questions.slice(-MAX_STATE_ITEMS)) {
    lines.push(
      `  - Question${question.module ? ` in "${question.module}"` : ""}: "${question.title}"`
    );
  }

  return lines.join("\n");
}

/**
 * Loads course + module + generation state from the database for an editor
 * call. Returns null when nothing can be resolved.
 */
export async function loadAiContext(scope: AiScope): Promise<ResolvedAiContext | null> {
  const { courseId, moduleId } = scope;
  if (!courseId && !moduleId) return null;

  const course = await prisma.course.findUnique({
    where: { id: courseId ?? (await moduleIdToCourseId(moduleId!)) },
    include: {
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          content: {
            orderBy: { order: "asc" },
            select: {
              type: true,
              slide: { select: { title: true, content: true } },
              question: { select: { title: true, content: true } },
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  const roadmap = course.modules.map((m) => ({
    order: m.order ?? 0,
    title: m.title,
  }));

  const courseContext: CourseAiContext = {
    title: course.name,
    description: course.description,
    difficulty: course.difficulty,
    language: course.lang,
    roadmap,
  };

  const state: GenerationState = { slides: [], questions: [] };
  let previousSlideContent: string | null = null;

  for (const mod of course.modules) {
    const isCurrentModule = mod.id === moduleId;
    for (const item of mod.content) {
      if (item.type === "SLIDE" && item.slide) {
        state.slides!.push({ module: mod.title, title: item.slide.title ?? "Untitled slide" });
        if (isCurrentModule) {
          const heading = item.slide.title ? `# ${item.slide.title}\n\n` : "";
          previousSlideContent = `${heading}${item.slide.content}`;
        }
      } else if (item.type === "QUESTION" && item.question) {
        state.questions!.push({ module: mod.title, title: item.question.title ?? "Untitled question" });
      }
    }
  }

  const targetIndex = course.modules.findIndex((m) => m.id === moduleId);
  const moduleContext: ModuleAiContext | undefined =
    targetIndex >= 0
      ? {
          title: course.modules[targetIndex].title,
          position: targetIndex + 1,
          totalModules: course.modules.length,
        }
      : undefined;

  return {
    course: courseContext,
    module: moduleContext,
    state,
    previousSlideContent,
  };
}

async function moduleIdToCourseId(moduleId: string): Promise<string> {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { course_id: true },
  });
  return mod?.course_id ?? moduleId;
}
