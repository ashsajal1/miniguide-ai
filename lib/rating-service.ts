"use server";
import { and, avg, count, desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/client";
import { rating, user } from "@/db/schema";

/**
 * Gets all ratings for a course
 */
export async function getCourseRatings(courseId: string) {
  try {
    const ratings = await db.query.rating.findMany({
      where: eq(rating.course_id, courseId),
      with: {
        user: {
          columns: {
            clerk_id: true,
          },
        },
      },
      orderBy: desc(rating.created_at),
    });

    return ratings;
  } catch (error) {
    console.warn("Rating functionality not available:", error);
    return [];
  }
}

/**
 * Gets the average rating for a course
 */
export async function getAverageRating(courseId: string) {
  try {
    const [result] = await db
      .select({ average: avg(rating.rating), count: count() })
      .from(rating)
      .where(eq(rating.course_id, courseId));

    return {
      average: Number(result?.average ?? 0),
      count: result?.count ?? 0,
    };
  } catch (error) {
    console.warn("Rating functionality not available:", error);
    return { average: 0, count: 0 };
  }
}

/**
 * Submits a rating for a course
 */
export async function submitRating(courseId: string, ratingValue: number, review?: string) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      throw new Error("User not authenticated");
    }

    if (ratingValue < 1 || ratingValue > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Find or create user
    let existingUser = await db.query.user.findFirst({
      where: eq(user.clerk_id, clerkId),
    });

    if (!existingUser) {
      [existingUser] = await db.insert(user).values({ clerk_id: clerkId }).returning();
    }

    // Upsert the rating (one per user and course)
    const [savedRating] = await db
      .insert(rating)
      .values({
        user_id: existingUser.id,
        course_id: courseId,
        rating: ratingValue,
        review,
      })
      .onConflictDoUpdate({
        target: [rating.user_id, rating.course_id],
        set: { rating: ratingValue, review, updated_at: new Date() },
      })
      .returning();

    return savedRating;
  } catch (error) {
    console.warn("Rating functionality not available:", error);
    throw error;
  }
}

/**
 * Checks if a user has already rated a course
 */
export async function hasUserRatedCourse(courseId: string) {
  try {
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

    const existingRating = await db.query.rating.findFirst({
      where: and(
        eq(rating.user_id, existingUser.id),
        eq(rating.course_id, courseId),
      ),
    });

    return !!existingRating;
  } catch (error) {
    console.warn("Rating functionality not available:", error);
    return false;
  }
}

/**
 * Gets user's rating for a course
 */
export async function getUserRatingForCourse(courseId: string) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return null;
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.clerk_id, clerkId),
    });

    if (!existingUser) {
      return null;
    }

    const existingRating = await db.query.rating.findFirst({
      where: and(
        eq(rating.user_id, existingUser.id),
        eq(rating.course_id, courseId),
      ),
    });

    return existingRating ?? null;
  } catch (error) {
    console.warn("Rating functionality not available:", error);
    return null;
  }
}
