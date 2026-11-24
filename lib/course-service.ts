"use server";

import { and, asc, eq, isNull } from "drizzle-orm";
import db from "@/db/client";
import { module } from "@/db/schema";

/**
 * Gets the first module ID for a course
 */
export async function getFirstModuleId(courseId: string) {
  const firstModule = await db.query.module.findFirst({
    where: and(eq(module.course_id, courseId), isNull(module.deleted_at)),
    orderBy: asc(module.created_at),
    columns: { id: true },
  });

  return firstModule?.id || null;
}
