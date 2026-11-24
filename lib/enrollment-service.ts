"use server"
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/client";
import { enrollment, user } from "@/db/schema";

/**
 * Enrolls a user in a course
 */
export async function enrollInCourse(courseId: string) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("User not authenticated");
  }

  // Find the user by clerk_id
  let existingUser = await db.query.user.findFirst({
    where: eq(user.clerk_id, clerkId),
  });

  if (!existingUser) {
    [existingUser] = await db.insert(user).values({ clerk_id: clerkId }).returning();
  }

  // Check if user is already enrolled
  const existingEnrollment = await db.query.enrollment.findFirst({
    where: and(
      eq(enrollment.user_id, existingUser.id),
      eq(enrollment.course_id, courseId),
    ),
  });

  if (existingEnrollment) {
    return existingEnrollment;
  }

  // Create the enrollment record
  const [created] = await db
    .insert(enrollment)
    .values({ user_id: existingUser.id, course_id: courseId })
    .returning();

  return created;
}

/**
 * Checks if a user is enrolled in a course
 */
export async function isEnrolledInCourse(courseId: string) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    return false;
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.clerk_id, clerkId),
  });

  if (!existingUser) {
    return false;
  }

  const existingEnrollment = await db.query.enrollment.findFirst({
    where: and(
      eq(enrollment.user_id, existingUser.id),
      eq(enrollment.course_id, courseId),
    ),
  });

  return !!existingEnrollment;
}

/**
 * Gets all courses a user is enrolled in
 */
export async function getEnrolledCourses() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return [];
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.clerk_id, clerkId),
  });

  if (!existingUser) {
    return [];
  }

  const enrollments = await db.query.enrollment.findMany({
    where: eq(enrollment.user_id, existingUser.id),
    with: { course: true },
    orderBy: desc(enrollment.enrolled_at),
  });

  return enrollments.map(enrollment => ({
    id: enrollment.course.id,
    name: enrollment.course.name,
    description: enrollment.course.description,
    difficulty: enrollment.course.difficulty,
    thumbnail_url: enrollment.course.thumbnail_url,
    enrolled_at: enrollment.enrolled_at,
    is_completed: enrollment.is_completed,
  }));
}

/**
 * Gets enrollment count for a course
 */
export async function getCourseEnrollmentCount(courseId: string) {
  const enrollments = await db.query.enrollment.findMany({
    where: eq(enrollment.course_id, courseId),
    columns: { id: true },
  });

  return enrollments.length;
}

/**
 * Marks a course as completed for a user
 */
export async function markCourseAsCompleted(courseId: string) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error("User not authenticated");
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.clerk_id, clerkId),
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const existingEnrollment = await db.query.enrollment.findFirst({
    where: and(
      eq(enrollment.user_id, existingUser.id),
      eq(enrollment.course_id, courseId),
    ),
  });

  if (!existingEnrollment) {
    throw new Error("User is not enrolled in this course");
  }

  const [updatedEnrollment] = await db
    .update(enrollment)
    .set({ is_completed: true, completed_at: new Date() })
    .where(eq(enrollment.id, existingEnrollment.id))
    .returning();

  return updatedEnrollment;
}
