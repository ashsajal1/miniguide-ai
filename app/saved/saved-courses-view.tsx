"use client";

import { useSavedCourses } from "@/app/store/use-saved-courses";
import { getCourses } from "@/app/course/edit/actions";
import { useEffect, useState } from "react";
import CourseCard from "@/app/components/course/course-card";
import { Loader2, Bookmark } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  lang: string;
  thumbnail_url: string;
  _count: {
    modules: number;
  };
}

export default function SavedCoursesView() {
  const { savedCourseIds } = useSavedCourses();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const allCourses = await getCourses();
        const savedCourses = allCourses.filter((course) =>
          savedCourseIds.includes(course.id)
        );

        setCourses(savedCourses as unknown as Course[]);
      } catch (error) {
        console.error("Failed to fetch saved courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) {
      fetchCourses();
    }
  }, [savedCourseIds, mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-10 lg:py-14">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-accent-soft text-accent-deep">
            <Bookmark className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-[clamp(1.9rem,3.4vw,2.6rem)] text-foreground">Saved courses</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your personal collection of courses</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading saved courses" />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.name}
                description={course.description}
                difficulty={course.difficulty || "Beginner"}
                lang={course.lang || "en"}
                thumbnail_url={course.thumbnail_url || ""}
                moduleCount={course._count?.modules || 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border border-rule bg-card py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-paper-2">
                <Bookmark className="h-8 w-8 text-muted-foreground/50" aria-hidden />
              </div>
              <h2 className="mb-2 text-xl text-foreground">No saved courses yet</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Browse the catalog and save courses you want to come back to.
              </p>
              <Link href="/" className="btn btn-primary">
                Browse courses
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
