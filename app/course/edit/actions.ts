"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/client";

export const getCourses = async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const courses = await prisma.course.findMany({
    where: { creator: userId, deleted_at: null },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  return courses;
};
