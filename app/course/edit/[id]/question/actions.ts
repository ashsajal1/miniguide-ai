"use server";

import { and, desc, eq } from "drizzle-orm";
import db from "@/db/client";
import {
  content as contentTable,
  option as optionTable,
  question as questionTable,
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

// Get the content of the last slide in a module (for AI question generation)
export async function getPreviousSlideContent(moduleId: string): Promise<string | null> {
  try {
    // Find the last slide content item in the module
    const lastSlideContent = await db.query.content.findFirst({
      where: and(
        eq(contentTable.module_id, moduleId),
        eq(contentTable.type, "SLIDE"),
      ),
      orderBy: desc(contentTable.order),
      with: {
        slide: {
          columns: { content: true, title: true },
        },
      },
    });

    if (lastSlideContent?.slide) {
      const { title, content } = lastSlideContent.slide;
      return title ? `# ${title}\n\n${content}` : content;
    }

    return null;
  } catch (error) {
    console.error("Error fetching previous slide:", error);
    return null;
  }
}

export async function createQuestion(
  moduleId: string,
  title: string,
  question: string,
  options: Array<{
    text: string;
    isCorrect: boolean;
    explanation: string;
  }>
) {
  try {
    // First create the content item
    const contentId = crypto.randomUUID();
    const questionId = crypto.randomUUID();
    const contentInsert = db.insert(contentTable).values({
      id: contentId,
      type: "QUESTION",
      module_id: moduleId,
      order: await getNextOrder(moduleId),
    });
    const questionInsert = db.insert(questionTable).values({
      id: questionId,
      title,
      content: question,
      module_id: moduleId,
      content_item_id: contentId,
    });

    // Create the question with options
    if (options.length > 0) {
      await db.batch(
        [
          contentInsert,
          questionInsert,
          db.insert(optionTable).values(
            options.map((opt) => ({
              questionId,
              text: opt.text,
              isCorrect: opt.isCorrect,
              explanation: opt.explanation || null,
            })),
          ),
        ],
      );
    } else {
      await db.batch([contentInsert, questionInsert]);
    }

    const questionRecord = await db.query.question.findFirst({
      where: eq(questionTable.id, questionId),
      with: {
        options: true,
        module: true, // include module to get course_id
      },
    });

    if (!questionRecord) {
      return { success: false, error: "Failed to create question" };
    }

    revalidatePath(`/course/edit/${questionRecord.module.course_id}`);
    return { success: true, question: questionRecord };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create question" };
  }
}
