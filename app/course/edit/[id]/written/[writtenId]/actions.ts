"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/client";
import { revalidatePath } from "next/cache";

export async function getWritten(writtenId: string) {
  const written = await prisma.written.findUnique({
    where: { id: writtenId },
    select: {
      id: true,
      title: true,
      prompt: true,
      guidance: true,
      module_id: true,
      module: { select: { course_id: true } },
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

    const written = await prisma.written.findUnique({
      where: { id: writtenId },
      select: {
        module_id: true,
        module: {
          select: {
            course_id: true,
            course: { select: { creator: true } },
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

    await prisma.written.update({
      where: { id: writtenId },
      data: {
        title,
        prompt,
        guidance: guidance?.trim() || null,
      },
    });

    revalidatePath(`/course/edit/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update written task:", error);
    return { success: false, error: "Failed to update written task" };
  }
}
