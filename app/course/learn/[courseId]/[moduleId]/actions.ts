"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/client";
import { ContentType, UserLevel } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { isAiConfigured } from "@/lib/ai";
import { analyzeWrittenAnswer, WrittenVerdict } from "@/lib/written-ai";

const XP_PER_MODULE = 10;

// XP thresholds for level progression
const XP_THRESHOLDS = {
  BEGINNER: 0,
  INTERMEDIATE: 100,
  ADVANCED: 500,
  MASTER: 1000,
};

function calculateLevel(xp: number): UserLevel {
  if (xp >= XP_THRESHOLDS.MASTER) return UserLevel.MASTER;
  if (xp >= XP_THRESHOLDS.ADVANCED) return UserLevel.ADVANCED;
  if (xp >= XP_THRESHOLDS.INTERMEDIATE) return UserLevel.INTERMEDIATE;
  return UserLevel.BEGINNER;
}

export async function completeModule(
  moduleId: string,
  courseId: string
): Promise<{ success: boolean; xpEarned?: number; error?: string }> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { success: false, error: "Unauthorized" };
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerk_id: clerkId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerk_id: clerkId,
          xp: 0,
          level: UserLevel.BEGINNER,
        },
      });
    }

    // Check if module is already completed
    const existingProgress = await prisma.userModuleProgress.findUnique({
      where: {
        user_id_module_id: {
          user_id: user.id,
          module_id: moduleId,
        },
      },
    });

    if (existingProgress?.is_completed) {
      return { success: true, xpEarned: 0 };
    }

    // Update or create progress
    await prisma.userModuleProgress.upsert({
      where: {
        user_id_module_id: {
          user_id: user.id,
          module_id: moduleId,
        },
      },
      update: {
        is_completed: true,
        completed_at: new Date(),
      },
      create: {
        user_id: user.id,
        module_id: moduleId,
        is_completed: true,
        completed_at: new Date(),
      },
    });

    // Award XP and update level
    const newXp = user.xp + XP_PER_MODULE;
    const newLevel = calculateLevel(newXp);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });

    revalidatePath(`/course/learn/${courseId}/${moduleId}`);

    return { success: true, xpEarned: XP_PER_MODULE };
  } catch (error) {
    console.error("Error completing module:", error);
    return { success: false, error: "Failed to complete module" };
  }
}

export async function getUserModuleProgress(moduleId: string): Promise<{
  isCompleted: boolean;
  completedAt?: Date | null;
}> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { isCompleted: false };
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: clerkId },
    });

    if (!user) {
      return { isCompleted: false };
    }

    const progress = await prisma.userModuleProgress.findUnique({
      where: {
        user_id_module_id: {
          user_id: user.id,
          module_id: moduleId,
        },
      },
    });

    return {
      isCompleted: progress?.is_completed ?? false,
      completedAt: progress?.completed_at,
    };
  } catch (error) {
    console.error("Error fetching module progress:", error);
    return { isCompleted: false };
  }
}

const WRITTEN_ANSWER_MIN = 40;
const WRITTEN_ANSWER_MAX = 2000;

export interface WrittenSubmissionView {
  answer: string;
  verdict: WrittenVerdict;
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  model_answer: string;
}

export type WrittenSubmissionErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_ANSWER"
  | "NOT_FOUND"
  | "NOT_CONFIGURED"
  | "AI_FAILED";

export type SubmitWrittenResult =
  | { success: true; submission: WrittenSubmissionView }
  | { success: false; code: WrittenSubmissionErrorCode; error: string };

export async function submitWrittenResponse(input: {
  courseId: string;
  moduleId: string;
  writtenId: string;
  answer: string;
}): Promise<SubmitWrittenResult> {
  const { courseId, moduleId, writtenId } = input;
  const answer = typeof input.answer === "string" ? input.answer.trim() : "";

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return {
      success: false,
      code: "UNAUTHENTICATED",
      error: "Sign in to get feedback on your answer.",
    };
  }

  if (answer.length < WRITTEN_ANSWER_MIN || answer.length > WRITTEN_ANSWER_MAX) {
    return {
      success: false,
      code: "INVALID_ANSWER",
      error: `Write between ${WRITTEN_ANSWER_MIN} and ${WRITTEN_ANSWER_MAX} characters.`,
    };
  }

  if (!isAiConfigured()) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      error: "Feedback is unavailable right now. Try again later.",
    };
  }

  try {
    const written = await prisma.written.findUnique({
      where: { id: writtenId },
      select: {
        id: true,
        module_id: true,
        prompt: true,
        guidance: true,
        module: {
          select: {
            title: true,
            course_id: true,
            course: {
              select: { name: true, difficulty: true, lang: true },
            },
            content: {
              where: { type: ContentType.SLIDE },
              orderBy: { order: "asc" },
              select: {
                slide: { select: { title: true, content: true } },
              },
            },
          },
        },
      },
    });

    if (
      !written ||
      written.module_id !== moduleId ||
      written.module.course_id !== courseId
    ) {
      return {
        success: false,
        code: "NOT_FOUND",
        error: "This written task could not be found.",
      };
    }

    const material = written.module.content
      .filter((item) => item.slide)
      .map(
        (item) =>
          `--- ${item.slide!.title ?? "Card"} ---\n${item.slide!.content}`
      )
      .join("\n\n");

    const analysis = await analyzeWrittenAnswer({
      course: {
        title: written.module.course.name,
        difficulty: written.module.course.difficulty,
        language: written.module.course.lang,
      },
      module: { title: written.module.title },
      material,
      task: { prompt: written.prompt, guidance: written.guidance },
      answer,
    });

    if (!analysis.success) {
      console.error("Written analysis failed:", analysis.error);
      return {
        success: false,
        code: "AI_FAILED",
        error: "We could not read that answer. Try again.",
      };
    }

    let user = await prisma.user.findUnique({
      where: { clerk_id: clerkId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerk_id: clerkId,
          xp: 0,
          level: UserLevel.BEGINNER,
        },
      });
    }

    const feedback = analysis.feedback;
    const submission = await prisma.writtenSubmission.upsert({
      where: {
        user_id_written_id: {
          user_id: user.id,
          written_id: written.id,
        },
      },
      update: {
        answer,
        verdict: feedback.verdict,
        score: feedback.score,
        summary: feedback.summary,
        strengths: feedback.strengths,
        gaps: feedback.gaps,
        model_answer: feedback.modelAnswer,
      },
      create: {
        answer,
        verdict: feedback.verdict,
        score: feedback.score,
        summary: feedback.summary,
        strengths: feedback.strengths,
        gaps: feedback.gaps,
        model_answer: feedback.modelAnswer,
        user_id: user.id,
        written_id: written.id,
      },
    });

    revalidatePath(`/course/learn/${courseId}/${moduleId}`);

    return {
      success: true,
      submission: {
        answer: submission.answer,
        verdict: feedback.verdict,
        score: feedback.score,
        summary: feedback.summary,
        strengths: feedback.strengths,
        gaps: submission.gaps,
        model_answer: submission.model_answer,
      },
    };
  } catch (error) {
    console.error("Error submitting written response:", error);
    return {
      success: false,
      code: "AI_FAILED",
      error: "Something went wrong while checking your answer. Try again.",
    };
  }
}
