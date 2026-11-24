import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Globe,
  Layers,
  Pencil,
  Users,
} from "lucide-react";
import { and, asc, eq, isNull } from "drizzle-orm";
import db from "@/db/client";
import { course as courseTable, module as moduleTable } from "@/db/schema";
import {
  getCourseEnrollmentCount,
  isEnrolledInCourse,
} from "@/lib/enrollment-service";
import { getAverageRating } from "@/lib/rating-service";
import EnrollButton from "./enroll-btn";
import { auth } from "@clerk/nextjs/server";
import StarRating from "@/app/components/ui/star-rating";
import CourseRating from "./course-rating";
import SaveCourseButton from "@/app/components/course/save-course-button";

const difficultyBadge: Record<string, string> = {
  Beginner: "badge-success",
  Intermediate: "badge-warning",
  Advanced: "badge-info",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { userId } = await auth();
  const course = await db.query.course.findFirst({
    where: eq(courseTable.id, id),
    columns: {
      name: true,
      description: true,
      thumbnail_url: true,
      creator: true,
    },
  });

  if (!course || course.creator !== userId) {
    return {
      title: "Guide Not Found",
    };
  }

  return {
    title: course.name,
    description: course.description,
    openGraph: {
      title: course.name,
      description: course.description,
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: course.name,
      description: course.description,
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await db.query.course.findFirst({
    where: eq(courseTable.id, id),
    with: {
      category: true,
      modules: {
        where: isNull(moduleTable.deleted_at),
        orderBy: [asc(moduleTable.order), asc(moduleTable.created_at)],
        with: {
          slides: { columns: { id: true } },
          questions: { columns: { id: true } },
          written: { columns: { id: true } },
        },
      },
    },
  });

  const { userId: clerkId } = await auth();

  // Guides are private: only the creator can open one.
  if (!course || course.creator !== clerkId) {
    notFound();
  }

  const modules = course.modules.map((courseModule) => ({
    ...courseModule,
    _count: {
      slides: courseModule.slides.length,
      questions: courseModule.questions.length,
      written: courseModule.written.length,
    },
  }));

  const enrollmentCount = await getCourseEnrollmentCount(id);
  const isEnrolled = await isEnrolledInCourse(id);
  let ratingData = { average: 0, count: 0 };
  try {
    ratingData = await getAverageRating(id);
  } catch (error) {
    console.warn("Failed to fetch rating data:", error);
  }

  const totalLessons = modules.reduce((sum, m) => sum + m._count.slides, 0);
  const totalQuestions = modules.reduce((sum, m) => sum + m._count.questions, 0);
  const totalWritten = modules.reduce((sum, m) => sum + m._count.written, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <section className="course-media relative h-72 sm:h-80">
        <Image
          src={course.thumbnail_url || "/placeholder-course.svg"}
          alt={course.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
          priority
        />
        {/* Legibility scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-shade/80 via-shade/30 to-shade/10" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />

        <div className="absolute inset-0">
          <div className="container mx-auto h-full px-4 sm:px-6 md:px-8 flex flex-col justify-end pb-12">
            <nav className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to courses
              </Link>
            </nav>

            {course.category && (
              <p className="mb-2 text-xs font-medium text-white/80">
                {course.category.name}
              </p>
            )}
            <h1 className="mb-4 max-w-3xl text-[clamp(2rem,4vw,3.2rem)] leading-[1.04] text-white">
              {course.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm">
              <span
                className={`badge ${difficultyBadge[course.difficulty] ?? "badge-outline"} border-0`}
              >
                {course.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/90">
                <Globe className="h-3.5 w-3.5" aria-hidden />
                {(course.lang || "en").toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/90">
                <Users className="h-3.5 w-3.5" aria-hidden />
                {enrollmentCount} enrolled
              </span>
              {ratingData.count > 0 && (
                <span className="inline-flex items-center gap-1.5 [&_span]:text-white">
                  <StarRating rating={ratingData.average} size={15} showValue />
                  <span className="text-white/75">({ratingData.count})</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* About */}
            <section className="rounded-[14px] border border-rule bg-card p-6 sm:p-7">
              <h2 className="text-xl font-bold tracking-tight mb-3">
                About this course
              </h2>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                {course.description}
              </p>
            </section>

            {/* Curriculum */}
            <section className="rounded-[14px] border border-rule bg-card p-6 sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
                <h2 className="text-xl font-bold tracking-tight">Curriculum</h2>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {modules.length} {modules.length === 1 ? "module" : "modules"}
                  {", "}
                  {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                  {totalQuestions > 0 && `, ${totalQuestions} practice questions`}
                  {totalWritten > 0 &&
                    `, ${totalWritten} written ${totalWritten === 1 ? "task" : "tasks"}`}
                </p>
              </div>

              {modules.length === 0 ? (
                <p className="text-muted-foreground">
                  The instructor hasn&apos;t published any modules yet.
                </p>
              ) : (
                <ol className="space-y-2.5">
                  {modules.map((courseModule, index) => (
                    <li
                      key={courseModule.id}
                      className="flex items-center gap-3.5 rounded-xl border border-border bg-background p-3.5"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-accent-soft font-mono text-[11px] font-medium text-ink">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium text-foreground truncate">
                        {courseModule.title}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Rating + review form */}
            {(ratingData.count > 0 || clerkId) && (
              <section className="rounded-[14px] border border-rule bg-card p-6 sm:p-7">
                <h2 className="text-xl font-bold tracking-tight mb-4">
                  Ratings &amp; reviews
                </h2>
                {ratingData.count > 0 ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {ratingData.average.toFixed(1)}
                    </span>
                    <div>
                      <StarRating rating={ratingData.average} size={18} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {ratingData.count} review
                        {ratingData.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-2">
                    This course hasn&apos;t been reviewed yet.
                  </p>
                )}
                {clerkId && <CourseRating courseId={id} />}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="dose-label overflow-hidden p-0">
                <div className="p-6 pb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold tracking-[-0.03em]">
                      Free
                    </span>
                    <span className="text-sm text-muted-foreground">
                      to get started
                    </span>
                  </div>

                  <ul className="mt-5 space-y-3 text-sm">
                    <li className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {modules.length}{" "}
                        {modules.length === 1 ? "module" : "modules"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Globe className="h-4 w-4 shrink-0 text-primary" />
                      <span>{(course.lang || "en").toUpperCase()}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Award className="h-4 w-4 shrink-0 text-primary" />
                      <span>Certificate on completion</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-rule p-6 pt-0">
                  <div className="pt-5">
                    {!clerkId ? (
                      <Link
                        href="/sign-in"
                        className="btn btn-primary btn-lg w-full gap-2 "
                      >
                        Sign In to Enroll
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : isEnrolled ? (
                      <Link
                        href={`/course/learn/${id}`}
                        className="btn btn-primary btn-lg w-full gap-2 "
                      >
                        Continue Learning
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <EnrollButton courseId={id} className="btn-lg w-full " />
                    )}

                    <SaveCourseButton
                      courseId={id}
                      fullWidth
                      label="Save for later"
                      className="mt-3 border border-rule hover:bg-paper-2"
                    />

                    {clerkId === course.creator && (
                      <Link
                        href={`/course/edit/${id}`}
                        className="btn btn-outline w-full gap-2 mt-3"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Course
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
