"use server";

import { desc, eq } from "drizzle-orm";
import db from "@/db/client";
import {
  content as contentTable,
  module as moduleTable,
  slide as slideTable,
} from "@/db/schema";
import { revalidatePath } from "next/cache";

// Helper function to get the next order number for content items
async function getNextOrder(moduleId: string): Promise<number> {
  const lastItem = await db.query.content.findFirst({
    where: eq(contentTable.module_id, moduleId),
    orderBy: desc(contentTable.order),
    columns: { order: true },
  });

  return (lastItem?.order || 0) + 1;
}

export async function createSlide(
  moduleId: string,
  title: string,
  content: string,
  references: string[] = []
): Promise<{
  success: boolean;
  slide?: typeof slideTable.$inferSelect & {
    content_item: typeof contentTable.$inferSelect | null;
  };
  error?: string;
}> {
  try {
    const moduleData = await db.query.module.findFirst({
      where: eq(moduleTable.id, moduleId),
      columns: { course_id: true },
    });

    if (!moduleData) {
      return { success: false, error: "Module not found" };
    }

    // Create the content item and slide together
    const contentId = crypto.randomUUID();
    await db.batch([
      db.insert(contentTable).values({
        id: contentId,
        type: "SLIDE",
        module_id: moduleId,
        order: await getNextOrder(moduleId),
      }),
      db.insert(slideTable).values({
        title: title,
        content: content,
        references,
        module_id: moduleId,
        content_item_id: contentId,
      }),
    ]);

    const slide = await db.query.slide.findFirst({
      where: eq(slideTable.content_item_id, contentId),
      with: {
        content_item: true,
      },
    });

    revalidatePath(`/course/edit/${moduleData.course_id}`);
    return {
      success: true,
      slide: slide ?? undefined,
    };
  } catch (error) {
    console.error("Error creating slide:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create slide",
    };
  }
}
