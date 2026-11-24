import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import db from "@/db/client";
import {
  course as courseTable,
  module as moduleTable,
  user as userTable,
  userModuleProgress as progressTable,
} from "@/db/schema";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  RotateCcw,
  Play,
  Trophy,
  BookOpen,
  ArrowLeft,
  PenLine,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const { userId } = await auth();
  const course = await db.query.course.findFirst({
    where: eq(courseTable.id, courseId),
    columns: { name: true, creator: true },
  });

  if (!course || course.creator !== userId) {
    return { title: "Guide Not Found" };
  }

  return {
    title: `Learning Path: ${course.name}`,
    description: `Track your progress in ${course.name}`,
  };
}

export default async function page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { userId: clerkId } = await auth();

  // Guides are private: only the creator can learn from one.
  const courseOwner = await db.query.course.findFirst({
    where: eq(courseTable.id, courseId),
    columns: { creator: true },
  });
  if (!courseOwner || courseOwner.creator !== clerkId) {
    notFound();
  }

  const moduleRows = await db.query.module.findMany({
    where: and(
      eq(moduleTable.course_id, courseId),
      isNull(moduleTable.deleted_at),
    ),
    columns: {
      id: true,
      title: true,
      course_id: true,
      created_at: true,
      updated_at: true,
    },
    with: {
      slides: { columns: { id: true } },
      written: { columns: { id: true } },
    },
    orderBy: asc(moduleTable.order),
  });
  const courseModules = moduleRows.map((m) => ({
    ...m,
    _count: { slides: m.slides.length, written: m.written.length },
  }));

  const userProgress: Map<
    string,
    { isCompleted: boolean; completedAt: Date | null }
  > = new Map();

  if (clerkId && courseModules.length > 0) {
    const user = await db.query.user.findFirst({
      where: eq(userTable.clerk_id, clerkId),
      with: {
        modules_progress: {
          where: inArray(
            progressTable.module_id,
            courseModules.map((m) => m.id),
          ),
        },
      },
    });

    if (user) {
      user.modules_progress.forEach((progress) => {
        userProgress.set(progress.module_id, {
          isCompleted: progress.is_completed,
          completedAt: progress.completed_at,
        });
      });
    }
  }

  const nextModuleId = courseModules.find(
    (module) => !userProgress.get(module.id)?.isCompleted
  )?.id;

  const completedCount = courseModules.filter(
    (m) => userProgress.get(m.id)?.isCompleted
  ).length;
  const totalModules = courseModules.length;
  const progressPercent =
    totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const allCompleted = completedCount === totalModules && totalModules > 0;

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Back to Course */}
        <Link
          href={`/course/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[10px] bg-accent-soft">
            <BookOpen className="h-6 w-6 text-accent-deep" aria-hidden />
          </div>
          <h1 className="mb-2 text-[clamp(1.9rem,3.4vw,2.6rem)] text-foreground">
            Course learning path
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Follow the modules below to track your progress through the course.
          </p>
        </div>

        {/* Progress Card */}
        <div className="mb-8 rounded-[14px] border border-rule bg-card">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold">Your Progress</h3>
                <p className="text-xs text-muted-foreground">
                  {completedCount} of {totalModules} modules completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  {progressPercent}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-paper-3">
              <div
                className="h-full origin-left rounded-full bg-accent transition-transform duration-700"
                style={{ transform: `scaleX(${progressPercent / 100})` }}
              />
            </div>
            {allCompleted && (
              <div className="flex items-center gap-2 mt-3 text-sm text-success font-medium">
                <Trophy className="h-4 w-4" />
                All modules completed!
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {courseModules.map((module, index) => {
            const progress = userProgress.get(module.id);
            const isCompleted = progress?.isCompleted || false;
            const isNextModule = module.id === nextModuleId;
            const isLast = index === courseModules.length - 1;

            return (
              <div key={module.id} className="relative pb-6 last:pb-0">
                {/* Timeline Line */}
                {!isLast && (
                  <div
                    className={`absolute left-5 top-11 w-0.5 h-[calc(100%-2.75rem)] ${
                      isCompleted ? "bg-success/40" : "bg-muted"
                    }`}
                  />
                )}

                {/* Timeline Item */}
                <div className="relative flex items-start gap-4">
                  {/* Marker */}
                  <div className="flex-shrink-0 z-10">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-[12px] font-medium ${
                        isCompleted
                          ? "bg-accent text-accent-ink"
                          : isNextModule
                            ? "bg-accent-soft text-ink ring-4 ring-accent-soft"
                            : "bg-paper-3 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 rounded-[10px] border transition-shadow hover:shadow-[var(--shadow-card)] ${
                      isNextModule
                        ? "border-accent bg-accent-soft/30"
                        : isCompleted
                          ? "border-rule bg-card"
                          : "border-rule bg-card"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-semibold text-sm leading-tight truncate">
                              {module.title}
                            </h2>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                                <CheckCircle className="h-2.5 w-2.5" />
                                Done
                              </span>
                            )}
                            {isNextModule && !isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                                <Play className="h-2.5 w-2.5" />
                                Up Next
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {module._count.slides} slide
                              {module._count.slides !== 1 ? "s" : ""}
                            </span>
                            {module._count.written > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <PenLine className="h-3 w-3" />
                                {module._count.written} written
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                module.updated_at
                              ).toLocaleDateString()}
                            </span>
                            {isCompleted && progress?.completedAt && (
                              <span className="inline-flex items-center gap-1 text-success">
                                <CheckCircle className="h-3 w-3" />
                                {new Date(
                                  progress.completedAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        <Link
                          href={`/course/learn/${courseId}/${module.id}`}
                          className="flex-shrink-0"
                        >
                          <button
                            className={`btn btn-xs gap-1 ${
                              isNextModule
                                ? "btn-primary"
                                : isCompleted
                                  ? "btn-outline btn-success"
                                  : "btn-ghost"
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <RotateCcw className="h-3 w-3" />
                                <span className="hidden sm:inline">Review</span>
                              </>
                            ) : isNextModule ? (
                              <>
                                <span>Continue</span>
                                <ArrowRight className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <span>Start</span>
                                <ArrowRight className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {courseModules.length === 0 && (
          <div className="card bg-card border border border-dashed">
            <div className="card-body items-center text-center !py-12">
              <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No modules in this course yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
