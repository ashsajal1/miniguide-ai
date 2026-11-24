"use server";

import { and, eq, notInArray } from "drizzle-orm";
import db from "@/db/client";
import {
  option as optionTable,
  question as questionTable,
} from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function getQuestion(questionId: string) {
  return await db.query.question.findFirst({
    where: eq(questionTable.id, questionId),
    with: {
      options: true,
    },
  });
}

type Option = {
  id?: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
};

export async function updateQuestion(
  questionId: string,
  courseId: string,
  title: string,
  question: string,
  options: Option[]
) {
  try {
    // Validate that there is exactly one correct answer
    const correctOptionsCount = options.filter(opt => opt.isCorrect).length;
    if (correctOptionsCount !== 1) {
      return { success: false, message: "There must be exactly one correct answer." };
    }

    // Separate options into new and existing
    const newOptions = options.filter((opt) => !opt.id);
    const existingOptions = options.filter((opt) => opt.id);
    const optionIdsToKeep = existingOptions.map(opt => opt.id as string).filter(id => id);

    const statements = [
      db
        .update(questionTable)
        .set({ title, content: question, updated_at: new Date() })
        .where(eq(questionTable.id, questionId)),
      ...(newOptions.length > 0
        ? [
            db.insert(optionTable).values(
              newOptions.map((opt) => ({
                questionId,
                text: opt.text,
                isCorrect: opt.isCorrect,
                explanation: opt.explanation,
              })),
            ),
          ]
        : []),
      ...existingOptions.map((option) =>
        db
          .update(optionTable)
          .set({
            text: option.text,
            isCorrect: option.isCorrect,
            explanation: option.explanation,
            updated_at: new Date(),
          })
          .where(eq(optionTable.id, option.id as string)),
      ),
      // Delete options that are not in the submission
      db
        .delete(optionTable)
        .where(
          and(
            eq(optionTable.questionId, questionId),
            optionIdsToKeep.length > 0
              ? notInArray(optionTable.id, optionIdsToKeep)
              : undefined,
          ),
        ),
    ];

    await db.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);

    revalidatePath(`/course/edit/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update question:", error);
    let message = "Failed to update question.";
    if (error instanceof Error) {
        message = error.message;
    }
    return { success: false, message };
  }
}
