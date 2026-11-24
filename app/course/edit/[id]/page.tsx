import { asc, eq } from "drizzle-orm";
import db from "@/db/client";
import {
  content as contentTable,
  course as courseTable,
  module as moduleTable,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import Modules from "./modules";
import CourseStatusToggle from "./course-status-toggle";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  HelpCircle,
  Eye,
  PenLine,
  Settings,
} from "lucide-react";

export default async function ManageCourse({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const course = await db.query.course.findFirst({
    where: eq(courseTable.id, id),
    with: {
      modules: {
        orderBy: asc(moduleTable.order),
        with: {
          content: {
            orderBy: asc(contentTable.order),
            with: {
              slide: {
                columns: { id: true, title: true, content: true },
              },
              question: {
                columns: { id: true, title: true, content: true },
                with: {
                  options: {
                    columns: {
                      id: true,
                      text: true,
                      isCorrect: true,
                      explanation: true,
                    },
                  },
                },
              },
              written: {
                columns: {
                  id: true,
                  title: true,
                  prompt: true,
                  guidance: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course || course.creator !== userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Guide Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This guide doesn&apos;t exist, or it isn&apos;t yours.
          </p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalSlides = course.modules.reduce(
    (sum, module) => sum + module.content.filter((c) => c.slide).length,
    0
  );
  const totalQuestions = course.modules.reduce(
    (sum, module) => sum + module.content.filter((c) => c.question).length,
    0
  );
  const totalWritten = course.modules.reduce(
    (sum, module) => sum + module.content.filter((c) => c.written).length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/course/learn/${course.id}`}
                className="btn btn-ghost btn-sm gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
              <button className="btn btn-ghost btn-sm gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Course Info Card */}
            <div className="card bg-card">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shadow-lg">
                    <BookOpen className="w-7 h-7 text-accent-ink" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg line-clamp-2">
                      {course.name}
                    </h2>
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground  mb-1">
                      Difficulty
                    </div>
                    <div
                      className={`badge ${
                        course.difficulty === "Beginner"
                          ? "badge-success"
                          : course.difficulty === "Intermediate"
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {course.difficulty}
                    </div>
                  </div>

                  {course.description && (
                    <div>
                      <div className="text-xs text-muted-foreground  mb-1">
                        Description
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <CourseStatusToggle
              courseId={course.id}
              isPublic={course.isPublic}
            />

            {/* Stats Cards */}
            <div className="card bg-card">
              <div className="card-body">
                <h3 className="font-bold text-sm text-muted-foreground  mb-3">
                  Content Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Modules</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {course.modules.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-info" />
                      </div>
                      <span className="text-sm font-medium">Slides</span>
                    </div>
                    <span className="text-2xl font-bold text-info">
                      {totalSlides}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-success" />
                      </div>
                      <span className="text-sm font-medium">Questions</span>
                    </div>
                    <span className="text-2xl font-bold text-success">
                      {totalQuestions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                        <PenLine className="w-4 h-4 text-warning" />
                      </div>
                      <span className="text-sm font-medium">Written</span>
                    </div>
                    <span className="text-2xl font-bold text-warning">
                      {totalWritten}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="card bg-card">
              <div className="card-body">
                <Modules
                  modules={course.modules ?? []}
                  courseId={course.id ?? ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
