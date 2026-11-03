"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { updateCourseStatus } from "./actions";
import { useRouter } from "next/navigation";

interface CourseStatusToggleProps {
  courseId: string;
  isPublic: boolean | null;
}

export default function CourseStatusToggle({
  courseId,
  isPublic: initialIsPublic,
}: CourseStatusToggleProps) {
  const [isPublic, setIsPublic] = useState(
    initialIsPublic === true || initialIsPublic === null
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    const newState = !isPublic;

    // Optimistic update
    setIsPublic(newState);

    const result = await updateCourseStatus(courseId, newState);

    if (!result.success) {
      // Revert on failure
      setIsPublic(!newState);
      // Ideally show toast here
      alert("Failed to update status");
    } else {
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <div className="card bg-card">
      <div className="card-body">
        <h3 className="font-bold text-sm text-muted-foreground  mb-3">
          Course Visibility
        </h3>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isPublic
                  ? "bg-accent-soft text-accent-deep"
                  : "bg-paper-3 text-muted-foreground"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPublic ? (
                <Eye className="w-4 h-4" aria-hidden />
              ) : (
                <EyeOff className="w-4 h-4" aria-hidden />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {isPublic ? "Public" : "Private"}
              </span>
              <span className="text-xs text-muted-foreground">
                {isPublic ? "Visible to everyone" : "Only visible to you"}
              </span>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label={isPublic ? "Make course private" : "Make course public"}
            onClick={handleToggle}
            disabled={isLoading}
            className={`relative h-[30px] w-[54px] shrink-0 rounded-full transition-colors disabled:opacity-60 ${
              isPublic ? "bg-primary" : "bg-paper-3 ring-1 ring-rule"
            }`}
          >
            <span
              aria-hidden
              className={`absolute left-[3px] top-[3px] h-6 w-6 rounded-full bg-card ring-1 ring-rule transition-transform duration-200 ${
                isPublic ? "translate-x-[24px]" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
