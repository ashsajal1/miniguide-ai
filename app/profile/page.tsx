import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import db from "@/db/client";
import { course as courseTable, user as userTable } from "@/db/schema";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  PlayCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CourseProgressSection } from "../components/profile/course-progress-section";
import { CreatedCoursesSection } from "../components/profile/created-courses-section";
import { LogoutButton } from "../components/auth/logout-button";
import { getEnrolledCourses } from "@/lib/enrollment-service";
import { SavedCoursesSection } from "../components/profile/saved-courses-section";
import { ProfileContextForm } from "../components/profile/profile-context-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch or create the DB user
  const userWithProgress = () =>
    db.query.user.findFirst({
      where: eq(userTable.clerk_id, user.id),
      with: {
        modules_progress: {
          with: {
            module: {
              with: {
                course: true,
              },
            },
          },
        },
      },
    });

  let dbUser = await userWithProgress();

  if (!dbUser) {
    await db
      .insert(userTable)
      .values({ clerk_id: user.id, level: "BEGINNER", xp: 0 })
      .onConflictDoNothing({ target: userTable.clerk_id });
    dbUser = await userWithProgress();
  }

  if (!dbUser) {
    redirect("/sign-in");
  }

  // Calculate course progress
  const courseProgress = new Map<
    string,
    {
      course: (typeof dbUser.modules_progress)[0]["module"]["course"];
      completedModules: number;
      totalModules: number;
    }
  >();

  // Get all unique course IDs from progress
  const courseIds = new Set(
    dbUser.modules_progress.map((p) => p.module.course_id)
  );

  // Fetch total module counts for these courses
  const coursesWithCounts = await db.query.course.findMany({
    where: inArray(courseTable.id, Array.from(courseIds)),
    with: { modules: { columns: { id: true } } },
  });

  // Initialize map with course info and total counts
  coursesWithCounts.forEach((c) => {
    courseProgress.set(c.id, {
      course: c,
      completedModules: 0,
      totalModules: c.modules.length,
    });
  });

  // Count completed modules
  dbUser.modules_progress.forEach((p) => {
    if (p.is_completed && courseProgress.has(p.module.course_id)) {
      const progress = courseProgress.get(p.module.course_id)!;
      progress.completedModules += 1;
    }
  });

  const courses = Array.from(courseProgress.values());

  // Fetch enrolled courses using the new enrollment service
  const enrolledCourses = await getEnrolledCourses();

  // Fetch last 10 courses created by the user
  const createdRows = await db.query.course.findMany({
    where: and(
      eq(courseTable.creator, user.id),
      isNull(courseTable.deleted_at),
    ),
    orderBy: desc(courseTable.created_at),
    limit: 10,
    with: { modules: { columns: { id: true } } },
  });
  const createdCourses = createdRows.map((course) => ({
    ...course,
    _count: { modules: course.modules.length },
  }));

  // Check admin status
  const isAdmin = dbUser.role === "ADMIN";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1080px] space-y-8 px-5 py-10 sm:px-8">
        {/* Header */}
        <div className="rounded-[14px] border border-rule bg-card p-6 sm:p-7">
          <div className="flex flex-col gap-5 text-center md:flex-row md:items-center md:gap-6 md:text-left">
            <Image
              src={user.imageUrl}
              alt={user.fullName || "User"}
              width={96}
              height={96}
              className="mx-auto h-20 w-20 rounded-full border-2 border-rule object-cover md:mx-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[clamp(1.7rem,3vw,2.4rem)] text-foreground">
                {user.fullName}
              </h1>
              <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="badge badge-primary">{dbUser.level}</span>
                <span className="badge border-0 bg-paper-2 font-mono text-ink-2">{dbUser.xp} XP</span>
                {isAdmin && (
                  <span className="badge border-0 bg-ink text-paper gap-1">
                    <ShieldCheck className="h-3 w-3" aria-hidden />
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-row justify-center gap-2 md:flex-col">
              {isAdmin && (
                <Link href="/admin" className="btn btn-outline btn-sm gap-1.5">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Admin dashboard
                </Link>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>

        <ProfileContextForm initialValue={dbUser.profile_context ?? ""} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: BookOpen, label: "Courses enrolled", value: enrolledCourses.length },
            { icon: PlayCircle, label: "In progress", value: courses.length },
            { icon: Award, label: "Modules completed", value: dbUser.modules_progress.filter((p) => p.is_completed).length },
            { icon: Zap, label: "Total XP", value: dbUser.xp },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-[14px] border border-rule bg-card p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent-deep">
                <stat.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-xl font-medium leading-none text-foreground">{stat.value}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Enrolled courses */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl text-foreground">Enrolled courses</h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {enrolledCourses.length} {enrolledCourses.length === 1 ? "course" : "courses"}
            </span>
          </div>
          {enrolledCourses.length === 0 ? (
            <div className="rounded-[14px] border border-rule bg-card p-10 text-center">
              <BookOpen className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" aria-hidden />
              <p className="mb-4 text-sm text-muted-foreground">
                You haven&apos;t enrolled in any courses yet.
              </p>
              <Link href="/" className="btn btn-primary btn-sm gap-1.5">
                Browse courses
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-[14px] border border-rule bg-card"
                >
                  <div className="flex-1 p-5">
                    <h3 className="mb-1.5 line-clamp-1 text-[16px] font-medium text-foreground">
                      {course.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-outline">{course.difficulty}</span>
                      {course.is_completed ? (
                        <span className="badge badge-primary">Completed</span>
                      ) : (
                        <span className="badge border-0 bg-paper-2 text-ink-2">In progress</span>
                      )}
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <a
                      href={`/course/learn/${course.id}`}
                      className={`btn btn-sm w-full gap-1.5 ${
                        course.is_completed ? "btn-outline" : "btn-primary"
                      }`}
                    >
                      {course.is_completed ? "Review" : "Continue"}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <SavedCoursesSection />
        <CourseProgressSection courses={courses} />
        <CreatedCoursesSection courses={createdCourses} />
      </div>
    </div>
  );
}
