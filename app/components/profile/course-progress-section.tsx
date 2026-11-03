import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

type CourseProgressProps = {
  courses: Array<{
    course: {
      id: string;
      name: string;
      thumbnail_url: string;
    };
    completedModules: number;
    totalModules: number;
  }>;
};

export function CourseProgressSection({ courses }: CourseProgressProps) {
  const completedCount = courses.filter(
    ({ completedModules, totalModules }) =>
      totalModules > 0 && completedModules >= totalModules
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl text-foreground">My Learning</h2>
        {courses.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {courses.length}{" "}
            {courses.length === 1 ? "course" : "courses"}
            {completedCount > 0 &&
              `, ${completedCount} ${completedCount === 1 ? "completed" : "completed"}`}
          </span>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="rounded-[14px] border border-rule bg-card p-10 text-center">
          <div className="grid place-items-center h-12 w-12 mx-auto mb-3 rounded-[10px] bg-accent-soft text-accent-deep">
            <BookOpen className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t started any courses yet.
          </p>
          <Link href="/" className="btn btn-primary btn-sm gap-1.5 mx-auto">
            Find your first course
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {courses.map(({ course, completedModules, totalModules }) => {
            const percentage =
              totalModules > 0
                ? Math.round((completedModules / totalModules) * 100)
                : 0;
            const isCompleted =
              totalModules > 0 && completedModules >= totalModules;

            return (
              <li key={course.id}>
                <Link
                  href={`/course/${course.id}`}
                  className="group rounded-[14px] border border-rule bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-shadow hover:shadow-[var(--shadow-card)]"
                >
                  <div className="relative w-full sm:w-32 h-40 sm:h-20 shrink-0 rounded-[10px] overflow-hidden bg-paper-2">
                    <Image
                      src={course.thumbnail_url || "/placeholder-course.svg"}
                      alt={course.name}
                      fill
                      className="object-cover transition-transform duration-500 "
                      sizes="128px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold leading-snug truncate group-hover:text-primary transition-colors">
                        {course.name}
                      </h3>
                      <span
                        className={`text-sm font-bold shrink-0 ${
                          isCompleted ? "text-accent-deep" : "text-primary"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-paper-2 overflow-hidden">
                        <div
                          className={`h-full origin-left rounded-full transition-transform duration-500 ${
                            isCompleted ? "bg-accent" : "bg-primary"
                          }`}
                          style={{ transform: `scaleX(${percentage / 100})` }}
                        />
                      </div>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-deep shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {completedModules}/{totalModules} modules
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary shrink-0 transition-colors duration-300">
                    {isCompleted ? "Review" : "Continue"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
