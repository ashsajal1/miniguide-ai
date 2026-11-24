"use server";

import { avg, count, eq, sql } from "drizzle-orm";
import db from "@/db/client";
import { category, course, enrollment, module, rating, user } from "@/db/schema";

export interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalModules: number;
  averageRating: number;
  courseCreationTrend: { month: string; count: number }[];
  enrollmentTrend: { month: string; count: number }[];
  categoryDistribution: { name: string; count: number }[];
  userLevelDistribution: { level: string; count: number }[];
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Get total counts
  const [
    [usersCount],
    [coursesCount],
    [enrollmentsCount],
    [modulesCount],
  ] = await Promise.all([
    db.select({ value: count() }).from(user),
    db.select({ value: count() }).from(course),
    db.select({ value: count() }).from(enrollment),
    db.select({ value: count() }).from(module),
  ]);

  // Get average rating
  const [ratingsResult] = await db
    .select({ average: avg(rating.rating) })
    .from(rating);
  const averageRating = Number(ratingsResult?.average ?? 0);

  // Get course creation trend (last 12 months)
  const courseCreationTrend = (
    await db.execute(sql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "Course"
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `)
  ).rows as { month: string; count: number }[];

  // Get enrollment trend (last 12 months)
  const enrollmentTrend = (
    await db.execute(sql`
      SELECT
        TO_CHAR(enrolled_at, 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "Enrollment"
      WHERE enrolled_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(enrolled_at, 'YYYY-MM')
      ORDER BY month
    `)
  ).rows as { month: string; count: number }[];

  // Get category distribution
  const categoryDistribution = await db
    .select({ name: category.name, count: count(course.id) })
    .from(category)
    .leftJoin(course, eq(course.category_id, category.id))
    .groupBy(category.name);

  // Get user level distribution
  const userLevelDistribution = await db
    .select({ level: user.level, count: count(user.level) })
    .from(user)
    .groupBy(user.level);

  return {
    totalUsers: usersCount.value,
    totalCourses: coursesCount.value,
    totalEnrollments: enrollmentsCount.value,
    totalModules: modulesCount.value,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    courseCreationTrend,
    enrollmentTrend,
    categoryDistribution,
    userLevelDistribution,
  };
}
