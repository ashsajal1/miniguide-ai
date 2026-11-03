"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, X } from "lucide-react";
import { Course, Category } from "@/generated/prisma";
import CourseCard from "@/app/components/course/course-card";

type CourseWithCount = Course & {
  _count: {
    modules: number;
  };
  category?: Category | null;
};

const difficultyOptions = ["Beginner", "Intermediate", "Advanced"] as const;

export default function CourseList({
  courses,
}: {
  courses: CourseWithCount[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl/Cmd+K or "/" focuses search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Search suggestions from visible courses
  const suggestions = useMemo(() => {
    if (searchQuery.trim() === "") return [];
    const q = searchQuery.toLowerCase();
    return courses
      .filter((course) => course.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [courses, searchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const categoriesData = await res.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchQuery === "" ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(course.difficulty);

      const matchesCategory =
        selectedCategories.length === 0 ||
        (course.category_id && selectedCategories.includes(course.category_id));

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [courses, searchQuery, selectedDifficulties, selectedCategories]);

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDifficulties([]);
    setSelectedCategories([]);
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedDifficulties.length > 0 || selectedCategories.length > 0;

  return (
    <div className="space-y-6">
      {/* Search and filter bar */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search courses"
            className="h-[52px] w-full rounded-[10px] border border-muted-foreground bg-muted pl-11 pr-20 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
                searchRef.current?.blur();
              }
            }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-3">
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchRef.current?.focus();
                }}
                className="grid h-6 w-6 place-items-center rounded-full bg-paper-2 text-muted-foreground transition-colors hover:bg-paper-3 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : (
              <kbd className="hidden h-5 items-center rounded-[5px] border border-rule bg-paper-2 px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                /
              </kbd>
            )}
          </div>

          {showSuggestions && searchQuery.trim() !== "" && (
            <div className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-[10px] border border-rule bg-card shadow-[var(--shadow-lift)]">
              {suggestions.length > 0 ? (
                suggestions.map((course) => (
                  <button
                    key={course.id}
                    onMouseDown={() => {
                      setSearchQuery(course.name);
                      setShowSuggestions(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-paper-2"
                  >
                    <span className="truncate font-medium text-foreground">{course.name}</span>
                    <span className="badge badge-sm shrink-0">{course.difficulty}</span>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  No courses match &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline h-[52px] rounded-[10px]"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filter
            {(selectedDifficulties.length > 0 || selectedCategories.length > 0) && (
              <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 font-mono text-[10px] text-accent-ink">
                {selectedDifficulties.length + selectedCategories.length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-ghost h-[52px] rounded-[10px]">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedDifficulties.map((difficulty) => (
            <span key={difficulty} className="badge badge-primary gap-1.5">
              {difficulty}
              <button
                onClick={() => toggleDifficulty(difficulty)}
                className="grid h-4 w-4 place-items-center rounded-full bg-ink/10"
                aria-label={`Remove ${difficulty} filter`}
              >
                <X className="h-2.5 w-2.5" aria-hidden />
              </button>
            </span>
          ))}
          {selectedCategories.map((categoryId) => {
            const category = categories.find((c) => c.id === categoryId);
            return (
              <span key={categoryId} className="badge badge-primary gap-1.5">
                {category?.name || "Unknown category"}
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="grid h-4 w-4 place-items-center rounded-full bg-ink/10"
                  aria-label={`Remove ${category?.name || "Category"} filter`}
                >
                  <X className="h-2.5 w-2.5" aria-hidden />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Filter panel: plastic keys */}
      {showFilters && (
        <div className="space-y-5 rounded-[14px] border border-rule bg-paper-2 p-5">
          <div>
            <h3 className="mb-3 text-xs font-medium text-muted-foreground">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={
                    selectedCategories.includes(category.id)
                      ? "rounded-[10px] border border-accent-deep bg-accent-soft px-3 py-1.5 text-xs font-medium text-ink shadow-[inset_0_1px_0_var(--color-glint)]"
                      : "rounded-[10px] border border-rule bg-card px-3 py-1.5 text-xs text-ink-2 shadow-[0_2px_0_var(--color-rule)] transition-colors hover:bg-paper"
                  }
                  aria-pressed={selectedCategories.includes(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-medium text-muted-foreground">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => toggleDifficulty(difficulty)}
                  className={
                    selectedDifficulties.includes(difficulty)
                      ? "rounded-[10px] border border-accent-deep bg-accent-soft px-3 py-1.5 text-xs font-medium text-ink shadow-[inset_0_1px_0_var(--color-glint)]"
                      : "rounded-[10px] border border-rule bg-card px-3 py-1.5 text-xs text-ink-2 shadow-[0_2px_0_var(--color-rule)] transition-colors hover:bg-paper"
                  }
                  aria-pressed={selectedDifficulties.includes(difficulty)}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result count */}
      {hasActiveFilters && filteredCourses.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} found
        </p>
      )}

      {/* Course grid */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-[14px] border border-rule bg-card px-6 py-14 text-center">
          <h3 className="text-xl text-foreground">No courses found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your search or filter criteria."
              : "No courses available at the moment."}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-primary btn-sm mt-5">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.name}
              description={course.description}
              difficulty={course.difficulty}
              lang={course.lang || "en"}
              thumbnail_url={course.thumbnail_url}
              moduleCount={course._count.modules}
            />
          ))}
        </section>
      )}
    </div>
  );
}
