"use server";

import { eq } from "drizzle-orm";
import db from "@/db/client";
import { slide as slideTable } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function getSlide(slideId: string) {
  return await db.query.slide.findFirst({
    where: eq(slideTable.id, slideId),
  });
}

export async function updateSlide(
  slideId: string,
  courseId: string,
  title: string,
  content: string,
  references: string[] = []
) {
  try {
    await db
      .update(slideTable)
      .set({
        title,
        content,
        references,
        updated_at: new Date(),
      })
      .where(eq(slideTable.id, slideId));

    revalidatePath(`/course/edit/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update slide:", error);
    return { success: false, message: "Failed to update slide." };
  }
}
