"use server";

import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/client";
import { course as courseTable } from "@/db/schema";

export const getCourses = async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const courses = await db.query.course.findMany({
    where: and(eq(courseTable.creator, userId), isNull(courseTable.deleted_at)),
    columns: {
      id: true,
      name: true,
      description: true,
    },
  });
  return courses;
};
