"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CourseForm from "../course-form";
import CourseOutlineEditor from "../course-outline-editor";
import CreationSteps from "@/app/components/course/creation-steps";
import GenerationView from "@/app/components/course/generation-view";
import { CourseOutline } from "@/lib/course-ai-service";
import { CourseFormData } from "../course-validation";
import { useCourseBuild } from "@/app/components/course/use-course-build";
import { ArrowLeft, Loader2 } from "lucide-react";

const STEPS = ["Details", "Outline", "Create"] as const;

type Step = "course-form" | "outline-edit" | "course-generation";

const STEP_INDEX: Record<Step, number> = {
  "course-form": 0,
  "outline-edit": 1,
  "course-generation": 2,
};

export default function ManualCourseCreationPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-[1080px] px-5 py-12 sm:px-8">
        <Suspense
          fallback={
            <div
              role="status"
              aria-label="Loading course builder"
              className="flex items-center justify-center py-32"
            >
              <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
            </div>
          }
        >
          <ManualCourseCreationFlow />
        </Suspense>
      </div>
    </div>
  );
}

function ManualCourseCreationFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("course-form");
  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [savedFormData, setSavedFormData] = useState<CourseFormData | null>(
    null
  );
  const build = useCourseBuild();

  const stepIndex = STEP_INDEX[step];
  const isGenerating = step === "course-generation";
  const isBuilding = build.isBuilding;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  useEffect(() => {
    if (!isBuilding) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isBuilding]);

  const handleCourseFormSubmit = (data: CourseFormData) => {
    setSavedFormData(data);

    const hours = Math.floor(data.estimatedDuration / 60);
    const minutes = data.estimatedDuration % 60;
    const durationStr =
      hours > 0
        ? minutes > 0
          ? `${hours}h ${minutes}m`
          : `${hours}h`
        : `${minutes}m`;

    setOutline({
      title: data.name,
      description: data.description,
      difficulty: data.difficulty as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: durationStr,
      language: data.lang,
      modules: [],
    });
    setStep("outline-edit");
  };

  const handleOutlineChanged = useCallback((nextOutline: CourseOutline) => {
    setOutline(nextOutline);
  }, []);

  const handleProceedToGeneration = async () => {
    if (!outline) return;

    setStep("course-generation");
    const result = await build.start(outline);
    if (result.courseId && !result.error) {
      router.push(`/course/edit/${result.courseId}`);
    }
  };

  const handleBack = () => {
    setStep(step === "course-generation" ? "outline-edit" : "course-form");
  };

  return (
    <div>
      {isGenerating ? (
        <h1 className="sr-only">Create a course manually</h1>
      ) : (
        <>
          <div className="max-w-[560px]">
            <Link
              href="/course/create"
              prefetch={false}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Create course
            </Link>
            <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
              Create a course manually
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Set the details, build the outline, then generate the slide cards,
              questions, and written task.
            </p>
          </div>

          <div className="mt-8 border-y border-rule py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <CreationSteps steps={STEPS} currentIndex={stepIndex} />
              <div className="flex items-center justify-end gap-2">
                <p role="status" className="sr-only">
                  Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex]}
                </p>
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isBuilding}
                    className="btn btn-ghost btn-sm gap-1.5 text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className={isGenerating ? "mx-auto max-w-[560px]" : "mt-6"}>
        {step === "course-form" && (
          <CourseForm
            onSubmit={handleCourseFormSubmit}
            defaultValues={savedFormData ?? undefined}
          />
        )}

        {step === "outline-edit" && outline && (
          <CourseOutlineEditor
            initialOutline={outline}
            onOutlineChanged={handleOutlineChanged}
            onProceed={handleProceedToGeneration}
          />
        )}

        {step === "course-generation" && (
          <GenerationView
            error={build.error}
            modules={build.modules}
            phase={build.phase}
            onRetry={() => {
              void handleProceedToGeneration();
            }}
          />
        )}
      </div>
    </div>
  );
}
