"use server";

import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/client";
import { written as writtenTable } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function getWritten(writtenId: string) {
  const written = await db.query.written.findFirst({
    where: eq(writtenTable.id, writtenId),
    columns: {
      id: true,
      title: true,
      prompt: true,
      guidance: true,
      module_id: true,
    },
    with: {
      module: { columns: { course_id: true } },
    },
  });

  return written;
}

export async function updateWritten(
  writtenId: string,
  courseId: string,
  title: string,
  prompt: string,
  guidance?: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const written = await db.query.written.findFirst({
      where: eq(writtenTable.id, writtenId),
      columns: { module_id: true },
      with: {
        module: {
          columns: { course_id: true },
          with: {
            course: { columns: { creator: true } },
          },
        },
      },
    });

    if (
      !written ||
      written.module.course_id !== courseId ||
      written.module.course.creator !== userId
    ) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(writtenTable)
      .set({
        title,
        prompt,
        guidance: guidance?.trim() || null,
        updated_at: new Date(),
      })
      .where(eq(writtenTable.id, writtenId));

    revalidatePath(`/course/edit/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update written task:", error);
    return { success: false, error: "Failed to update written task" };
  }
}
