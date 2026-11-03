export const dynamic = "force-dynamic";

import CourseList from "@/app/components/course/course-list";
import prisma from "@/prisma/client";
import { BookOpen, FolderOpen, Layers } from "lucide-react";

export default async function CoursePage() {
  const courses = await prisma.course.findMany({
    where: {
      OR: [{ isPublic: true }, { isPublic: null }],
    },
    include: {
      category: true,
      _count: {
        select: { modules: true },
      },
    },
  });

  const categoryCount = new Set(courses.map((c) => c.category_id).filter(Boolean)).size;
  const moduleCount = courses.reduce((sum, c) => sum + c._count.modules, 0);

  const stats = [
    { icon: BookOpen, value: String(courses.length), label: "Courses" },
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
                Every mini guide, in one tray.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">
                Short courses across topics and skill levels. Pick one for your afternoon.
              </p>
            </div>

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
          </div>
        </div>
      </section>

      {/* Catalog */}
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-10 pb-20">
        <CourseList courses={courses!} />
      </div>
    </div>
  );
}
