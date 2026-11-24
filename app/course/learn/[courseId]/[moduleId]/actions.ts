"use server";

import { and, asc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/client";
import {
  content as contentTable,
  user as userTable,
  userModuleProgress as progressTable,
  written as writtenTable,
  writtenSubmission as submissionTable,
} from "@/db/schema";
import type { UserLevel } from "@/db/schema";
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
  if (xp >= XP_THRESHOLDS.MASTER) return "MASTER";
  if (xp >= XP_THRESHOLDS.ADVANCED) return "ADVANCED";
  if (xp >= XP_THRESHOLDS.INTERMEDIATE) return "INTERMEDIATE";
  return "BEGINNER";
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
    let user = await db.query.user.findFirst({
      where: eq(userTable.clerk_id, clerkId),
    });

    if (!user) {
      [user] = await db
        .insert(userTable)
        .values({ clerk_id: clerkId, xp: 0, level: "BEGINNER" })
        .returning();
    }

    // Check if module is already completed
    const existingProgress = await db.query.userModuleProgress.findFirst({
      where: and(
        eq(progressTable.user_id, user.id),
        eq(progressTable.module_id, moduleId),
      ),
    });

    if (existingProgress?.is_completed) {
      return { success: true, xpEarned: 0 };
    }

    // Update or create progress
    const now = new Date();
    await db
      .insert(progressTable)
      .values({
        user_id: user.id,
        module_id: moduleId,
        is_completed: true,
        completed_at: now,
      })
      .onConflictDoUpdate({
        target: [progressTable.user_id, progressTable.module_id],
        set: {
          is_completed: true,
          completed_at: now,
          updated_at: now,
        },
      });

    // Award XP and update level
    const newXp = user.xp + XP_PER_MODULE;
    const newLevel = calculateLevel(newXp);

    await db
      .update(userTable)
      .set({ xp: newXp, level: newLevel, updated_at: new Date() })
      .where(eq(userTable.id, user.id));

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

    const user = await db.query.user.findFirst({
      where: eq(userTable.clerk_id, clerkId),
    });

    if (!user) {
      return { isCompleted: false };
    }

    const progress = await db.query.userModuleProgress.findFirst({
      where: and(
        eq(progressTable.user_id, user.id),
        eq(progressTable.module_id, moduleId),
      ),
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
    const written = await db.query.written.findFirst({
      where: eq(writtenTable.id, writtenId),
      columns: {
        id: true,
        module_id: true,
        prompt: true,
        guidance: true,
      },
      with: {
        module: {
          columns: { title: true, course_id: true },
          with: {
            course: {
              columns: { name: true, difficulty: true, lang: true },
            },
            content: {
              where: eq(contentTable.type, "SLIDE"),
              orderBy: asc(contentTable.order),
              columns: { id: true },
              with: {
                slide: { columns: { title: true, content: true } },
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

    let user = await db.query.user.findFirst({
      where: eq(userTable.clerk_id, clerkId),
    });

    if (!user) {
      [user] = await db
        .insert(userTable)
        .values({ clerk_id: clerkId, xp: 0, level: "BEGINNER" })
        .returning();
    }

    const feedback = analysis.feedback;
    const now = new Date();
    const [submission] = await db
      .insert(submissionTable)
      .values({
        answer,
        verdict: feedback.verdict,
        score: feedback.score,
        summary: feedback.summary,
        strengths: feedback.strengths,
        gaps: feedback.gaps,
        model_answer: feedback.modelAnswer,
        user_id: user.id,
        written_id: written.id,
      })
      .onConflictDoUpdate({
        target: [submissionTable.user_id, submissionTable.written_id],
        set: {
          answer,
          verdict: feedback.verdict,
          score: feedback.score,
          summary: feedback.summary,
          strengths: feedback.strengths,
          gaps: feedback.gaps,
          model_answer: feedback.modelAnswer,
          updated_at: now,
        },
      })
      .returning();

    revalidatePath(`/course/learn/${courseId}/${moduleId}`);

    return {
      success: true,
      submission: {
        answer: submission.answer,
        verdict: feedback.verdict,
        score: feedback.score,
        summary: feedback.summary,
        strengths: feedback.strengths,
        gaps: submission.gaps ?? [],
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
