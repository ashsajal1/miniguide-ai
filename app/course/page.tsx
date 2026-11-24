export const dynamic = "force-dynamic";

import { and, desc, eq, isNull } from "drizzle-orm";
import CourseList from "@/app/components/course/course-list";
import db from "@/db/client";
import { course as courseTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, FolderOpen, Layers, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CoursePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // A guide is private to the person who made it: only their own guides
  // are ever listed here.
  const courseRows = await db.query.course.findMany({
    where: and(
      eq(courseTable.creator, userId),
      isNull(courseTable.deleted_at),
    ),
    orderBy: desc(courseTable.created_at),
    with: {
      category: true,
      modules: { columns: { id: true } },
    },
  });

  const courses = courseRows.map((course) => ({
    ...course,
    _count: { modules: course.modules.length },
  }));

  const categoryCount = new Set(courses.map((c) => c.category_id).filter(Boolean)).size;
  const moduleCount = courses.reduce((sum, c) => sum + c._count.modules, 0);

  const stats = [
    { icon: BookOpen, value: String(courses.length), label: "Guides" },
    { icon: FolderOpen, value: String(categoryCount), label: "Categories" },
    { icon: Layers, value: String(moduleCount), label: "Modules" },
  ].filter((stat) => stat.value !== "0");

  return (
    <div className="min-h-screen w-full">
      {/* Page hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="window-light" aria-hidden>
          <span />
          <span />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-14 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 className="max-w-[16ch] text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1.02] text-foreground">
                Your guides, no one else&apos;s.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">
                Every guide you make from a document lives here, shaped by the
                context you share in your profile.
              </p>
              <Link href="/course/create" className="btn btn-primary mt-6 gap-1.5">
                <Plus className="h-4 w-4" aria-hidden />
                New guide
              </Link>
            </div>

            {stats.length > 0 && (
              <dl className="flex flex-wrap gap-x-10 gap-y-4 lg:col-span-5 lg:justify-end">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <stat.icon className="h-4 w-4 shrink-0 text-accent-deep" aria-hidden />
                    <div>
                      <dt className="font-display text-lg font-bold leading-none text-foreground">
                        {stat.value}
                      </dt>
                      <dd className="mt-1 text-[11px] text-muted-foreground">{stat.label}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* Catalog */}
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-10 pb-20">
        {courses.length === 0 ? (
          <div className="rounded-[14px] border border-rule bg-card px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" aria-hidden />
            <h2 className="text-xl text-foreground">No guides yet</h2>
            <p className="mx-auto mt-2 max-w-[44ch] text-sm text-muted-foreground">
              Paste a link or the text of a document and turn it into a short
              guide built around what you already know.
            </p>
            <Link href="/course/create" className="btn btn-primary btn-sm mt-5 gap-1.5">
              <Plus className="h-4 w-4" aria-hidden />
              Create your first guide
            </Link>
          </div>
        ) : (
          <CourseList courses={courses} />
        )}
      </div>
    </div>
  );
}
