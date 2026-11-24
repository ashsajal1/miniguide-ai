"use server";

import { and, asc, desc, eq, notInArray } from "drizzle-orm";
import db from "@/db/client";
import {
  content as contentTable,
  course as courseTable,
  module as moduleTable,
  option as optionTable,
  question as questionTable,
  slide as slideTable,
  written as writtenTable,
  type ContentType,
} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// Helper to verify course ownership
async function verifyCourseOwner(courseId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const found = await db.query.course.findFirst({
    where: eq(courseTable.id, courseId),
    columns: { creator: true },
  });

  return found?.creator === userId;
}

async function verifyModuleOwner(moduleId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const courseModule = await db.query.module.findFirst({
    where: eq(moduleTable.id, moduleId),
    with: { course: { columns: { creator: true } } },
  });

  return courseModule?.course.creator === userId;
}

async function verifySlideOwner(slideId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const found = await db.query.slide.findFirst({
    where: eq(slideTable.id, slideId),
    with: { module: { with: { course: { columns: { creator: true } } } } },
  });

  return found?.module.course.creator === userId;
}

async function verifyQuestionOwner(questionId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const found = await db.query.question.findFirst({
    where: eq(questionTable.id, questionId),
    with: { module: { with: { course: { columns: { creator: true } } } } },
  });

  return found?.module.course.creator === userId;
}

async function verifyWrittenOwner(writtenId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const found = await db.query.written.findFirst({
    where: eq(writtenTable.id, writtenId),
    with: { module: { with: { course: { columns: { creator: true } } } } },
  });

  return found?.module.course.creator === userId;
}

// Module Actions
export async function createModule(courseId: string, title: string) {
  try {
    const isOwner = await verifyCourseOwner(courseId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const [newMdoule] = await db
      .insert(moduleTable)
      .values({ title, course_id: courseId })
      .returning();
    revalidatePath(`/course/edit/${courseId}`);
    return { success: true, newMdoule };
  } catch {
    return { success: false, error: "Failed to create module" };
  }
}

export async function updateQuestionContent(questionId: string, content: string) {
  try {
    const isOwner = await verifyQuestionOwner(questionId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const [question] = await db
      .update(questionTable)
      .set({ content, updated_at: new Date() })
      .where(eq(questionTable.id, questionId))
      .returning();
    revalidatePath(`/course/edit/module/${question.module_id}`);
    return { success: true, question };
  } catch {
    return { success: false, error: "Failed to update question" };
  }
}

export async function updateModule(moduleId: string, title: string) {
  try {
    const isOwner = await verifyModuleOwner(moduleId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const [updatedModule] = await db
      .update(moduleTable)
      .set({ title, updated_at: new Date() })
      .where(eq(moduleTable.id, moduleId))
      .returning();
    revalidatePath(`/course/edit/${updatedModule.course_id}`);
    return { success: true, module: updatedModule };
  } catch {
    return { success: false, error: "Failed to update module" };
  }
}

export async function deleteModule(moduleId: string) {
  try {
    const isOwner = await verifyModuleOwner(moduleId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    // First get the module to get course_id for revalidation
    const deletedModule = await db.query.module.findFirst({
      where: eq(moduleTable.id, moduleId),
      columns: { course_id: true },
    });

    if (!deletedModule) {
      return { success: false, error: "Module not found" };
    }

    await db.delete(moduleTable).where(eq(moduleTable.id, moduleId));

    revalidatePath(`/course/edit/${deletedModule.course_id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete module" };
  }
}

// Slide Actions
type SlideWithContentItem = typeof slideTable.$inferSelect & {
  content_item: typeof contentTable.$inferSelect;
};

export async function createSlide(
  moduleId: string,
  title: string,
  content: string,
  references: string[] = []
): Promise<{
  success: boolean;
  slide?: SlideWithContentItem;
  error?: string;
}> {
  try {
    const isOwner = await verifyModuleOwner(moduleId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const contentId = crypto.randomUUID();
    const [contentRows, slideRows] = await db.batch([
      db
        .insert(contentTable)
        .values({
          id: contentId,
          type: "SLIDE",
          module_id: moduleId,
          order: await getNextOrder(moduleId),
        })
        .returning(),
      db
        .insert(slideTable)
        .values({
          title: title,
          content: content,
          module_id: moduleId,
          content_item_id: contentId,
          references,
        })
        .returning(),
    ]);

    revalidatePath(`/course/edit/module/${moduleId}`);
    return {
      success: true,
      slide: {
        ...slideRows[0],
        content_item: contentRows[0],
      },
    };
  } catch (error) {
    console.error("Error creating slide:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create slide",
    };
  }
}

export async function updateSlide(
  slideId: string,
  title: string,
  content: string,
  references: string[] = []
) {
  try {
    const isOwner = await verifySlideOwner(slideId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const [updatedSlide] = await db
      .update(slideTable)
      .set({ title, content, references, updated_at: new Date() })
      .where(eq(slideTable.id, slideId))
      .returning();

    revalidatePath(`/course/edit/module/${updatedSlide.module_id}`);
    return { success: true, slide: updatedSlide };
  } catch {
    return { success: false, error: "Failed to update slide" };
  }
}

export async function deleteSlide(slideId: string) {
  try {
    const isOwner = await verifySlideOwner(slideId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    // First get the slide to get module_id for revalidation
    const slide = await db.query.slide.findFirst({
      where: eq(slideTable.id, slideId),
      columns: { module_id: true, content_item_id: true },
    });

    if (!slide) {
      return { success: false, error: "Slide not found" };
    }

    // Delete the slide and its associated content item together
    await db.batch([
      db.delete(slideTable).where(eq(slideTable.id, slideId)),
      db.delete(contentTable).where(eq(contentTable.id, slide.content_item_id)),
    ]);

    revalidatePath(`/course/edit/module/${slide.module_id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete slide:", error);
    return { success: false, error: "Failed to delete slide" };
  }
}

// Question & Quiz Actions
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
    const isOwner = await verifyModuleOwner(moduleId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const contentId = crypto.randomUUID();
    const questionId = crypto.randomUUID();
    const optionsData = options.map((opt) => ({
      id: crypto.randomUUID(),
      questionId,
      text: opt.text,
      isCorrect: opt.isCorrect,
      explanation: opt.explanation || null,
    }));

    const [contentRows, questionRows, optionRows] = await db.batch([
      db
        .insert(contentTable)
        .values({
          id: contentId,
          type: "QUESTION",
          module_id: moduleId,
          order: await getNextOrder(moduleId),
        })
        .returning(),
      db
        .insert(questionTable)
        .values({
          id: questionId,
          title,
          content: question,
          module_id: moduleId,
          content_item_id: contentId,
        })
        .returning(),
      db.insert(optionTable).values(optionsData).returning(),
    ]);

    const courseModule = await db.query.module.findFirst({
      where: eq(moduleTable.id, moduleId),
      columns: { course_id: true },
    });

    revalidatePath(`/course/edit/module/${courseModule?.course_id ?? moduleId}`);
    return {
      success: true,
      question: {
        ...questionRows[0],
        options: optionRows,
        content_item: contentRows[0],
      },
    };
  } catch {
    return { success: false, error: "Failed to create question" };
  }
}

export async function updateQuestion(
  questionId: string,
  title: string,
  content: string,
  options: {
    id?: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[]
) {
  try {
    const isOwner = await verifyQuestionOwner(questionId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    // First update the question
    const [question] = await db
      .update(questionTable)
      .set({ content, title, updated_at: new Date() })
      .where(eq(questionTable.id, questionId))
      .returning();

    // Then replace options (delete all and recreate for simplicity)
    await db.delete(optionTable).where(eq(optionTable.questionId, questionId));

    const optionsArr = options.map((opt) => ({
      questionId: questionId,
      text: opt.text,
      isCorrect: opt.isCorrect,
      explanation: opt.explanation || null,
    }));
    if (optionsArr.length > 0) {
      await db.insert(optionTable).values(optionsArr);
    }

    revalidatePath(`/course/edit/module/${question.module_id}`);
    return { success: true, question };
  } catch {
    return { success: false, error: "Failed to update question" };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    const isOwner = await verifyQuestionOwner(questionId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    // First get the question to get module_id for revalidation
    const question = await db.query.question.findFirst({
      where: eq(questionTable.id, questionId),
      columns: { module_id: true, content_item_id: true },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Delete the question, its options, and associated content item together
    await db.batch([
      db.delete(optionTable).where(eq(optionTable.questionId, questionId)),
      db.delete(questionTable).where(eq(questionTable.id, questionId)),
      db.delete(contentTable).where(eq(contentTable.id, question.content_item_id!)),
    ]);

    revalidatePath(`/course/edit/module/${question.module_id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { success: false, error: "Failed to delete question" };
  }
}

// Written Actions
export async function createWritten(
  moduleId: string,
  title: string,
  prompt: string,
  guidance?: string
) {
  try {
    const isOwner = await verifyModuleOwner(moduleId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const order = await getNextOrder(moduleId);
    const contentId = crypto.randomUUID();
    const [contentRows, writtenRows] = await db.batch([
      db
        .insert(contentTable)
        .values({
          id: contentId,
          type: "WRITTEN" satisfies ContentType,
          module_id: moduleId,
          order,
        })
        .returning(),
      db
        .insert(writtenTable)
        .values({
          title,
          prompt,
          guidance: guidance?.trim() || null,
          module_id: moduleId,
          content_item_id: contentId,
        })
        .returning(),
    ]);

    revalidatePath(`/course/edit/module/${moduleId}`);
    return {
      success: true,
      written: {
        ...writtenRows[0],
        content_item: contentRows[0],
      },
    };
  } catch (error) {
    console.error("Error creating written task:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create written task",
    };
  }
}

export async function updateWritten(
  writtenId: string,
  title: string,
  prompt: string,
  guidance?: string
) {
  try {
    const isOwner = await verifyWrittenOwner(writtenId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const [written] = await db
      .update(writtenTable)
      .set({
        title,
        prompt,
        guidance: guidance?.trim() || null,
        updated_at: new Date(),
      })
      .where(eq(writtenTable.id, writtenId))
      .returning();

    revalidatePath(`/course/edit/module/${written.module_id}`);
    return { success: true, written };
  } catch (error) {
    console.error("Failed to update written task:", error);
    return { success: false, error: "Failed to update written task" };
  }
}

export async function deleteWritten(writtenId: string) {
  try {
    const isOwner = await verifyWrittenOwner(writtenId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const written = await db.query.written.findFirst({
      where: eq(writtenTable.id, writtenId),
      columns: { module_id: true, content_item_id: true },
    });

    if (!written) {
      return { success: false, error: "Written task not found" };
    }

    // Submissions cascade with the written row; the content item must go too.
    await db.batch([
      db.delete(writtenTable).where(eq(writtenTable.id, writtenId)),
      db.delete(contentTable).where(eq(contentTable.id, written.content_item_id)),
    ]);

    revalidatePath(`/course/edit/module/${written.module_id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete written task:", error);
    return { success: false, error: "Failed to delete written task" };
  }
}

// Helper function to get the next order number for content items
async function getNextOrder(moduleId: string): Promise<number> {
  const lastItem = await db.query.content.findFirst({
    where: eq(contentTable.module_id, moduleId),
    orderBy: desc(contentTable.order),
    columns: { order: true },
  });

  return (lastItem?.order || 0) + 1;
}

// Reorder content items
export async function reorderContent(moduleId: string, contentIds: string[]) {
  console.log("reorderContent called", { moduleId, contentIds });
  try {
    const isOwner = await verifyModuleOwner(moduleId);
    if (!isOwner) {
      console.log("reorderContent unauthorized");
      return { success: false, error: "Unauthorized" };
    }

    if (contentIds.length > 0) {
      const updates = contentIds.map((id, index) =>
        db
          .update(contentTable)
          .set({ order: index, updated_at: new Date() })
          .where(and(eq(contentTable.id, id), eq(contentTable.module_id, moduleId)))
      );
      await db.batch(
        updates as [typeof updates[number], ...typeof updates[number][]]
      );
    }

    // Get courseId for revalidation
    const courseModule = await db.query.module.findFirst({
      where: eq(moduleTable.id, moduleId),
      columns: { course_id: true },
    });

    console.log("reorderContent success");
    if (courseModule) {
      revalidatePath(`/course/edit/${courseModule.course_id}`);
    }
    return { success: true };
  } catch (error) {
    console.error("reorderContent error", error);
    return { success: false, error: "Failed to reorder content" };
  }
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  console.log("reorderModules called", { courseId, moduleIds });
  try {
    const isOwner = await verifyCourseOwner(courseId);
    if (!isOwner) {
      console.log("reorderModules unauthorized");
      return { success: false, error: "Unauthorized" };
    }

    if (moduleIds.length > 0) {
      const updates = moduleIds.map((id, index) =>
        db
          .update(moduleTable)
          .set({ order: index, updated_at: new Date() })
          .where(eq(moduleTable.id, id))
      );
      await db.batch(
        updates as [typeof updates[number], ...typeof updates[number][]]
      );
    }

    console.log("reorderModules success");
    revalidatePath(`/course/edit/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("reorderModules error", error);
    return { success: false, error: "Failed to reorder modules" };
  }
}

export async function updateCourseStatus(courseId: string, isPublic: boolean) {
  try {
    const isOwner = await verifyCourseOwner(courseId);
    if (!isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(courseTable)
      .set({ isPublic, updated_at: new Date() })
      .where(eq(courseTable.id, courseId));
    revalidatePath(`/course/edit/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update course status:", error);
    return { success: false, error: "Failed to update course status" };
  }
}
