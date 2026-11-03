"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UrlCourseGenerator from "../url-course-generator";
import CourseOutlineEditor from "../course-outline-editor";
import CreationSteps from "@/app/components/course/creation-steps";
import GenerationView from "@/app/components/course/generation-view";
import { CourseOutline } from "@/lib/course-ai-service";
import { createCourseFromOutline } from "@/lib/course-creation-service";
import { describeGenerationError } from "@/lib/course-generation-error";
import { ArrowLeft, Loader2 } from "lucide-react";

const STEPS = ["Source", "Outline", "Create"] as const;

type Step = "url-input" | "outline-edit" | "course-generation";

const STEP_INDEX: Record<Step, number> = {
  "url-input": 0,
  "outline-edit": 1,
  "course-generation": 2,
};

export default function UrlCourseCreationPage() {
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
          <UrlCourseCreationFlow />
        </Suspense>
      </div>
    </div>
  );
}

function UrlCourseCreationFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("url-input");
  const [generatedOutline, setGeneratedOutline] =
    useState<CourseOutline | null>(null);
  const [finalOutline, setFinalOutline] = useState<CourseOutline | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const stepIndex = STEP_INDEX[step];
  const outline = finalOutline ?? generatedOutline;
  const isGenerating = step === "course-generation";

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

  const handleOutlineGenerated = (nextOutline: CourseOutline) => {
    setGeneratedOutline(nextOutline);
    setFinalOutline(nextOutline);
    setStep("outline-edit");
  };

  const handleOutlineChanged = useCallback((nextOutline: CourseOutline) => {
    setFinalOutline(nextOutline);
  }, []);

  const handleProceedToGeneration = async () => {
    if (!outline) return;

    setGenerationError(null);
    setStep("course-generation");
    setIsBuilding(true);

    try {
      const result = await createCourseFromOutline(outline);
      if (result.success && result.course) {
        router.push(`/course/edit/${result.course.id}`);
        return;
      }
      setGenerationError(describeGenerationError(result.error));
    } catch {
      setGenerationError(
        "The build stopped unexpectedly. Your outline is unchanged, so you can try again."
      );
    } finally {
      setIsBuilding(false);
    }
  };

  const handleBack = () => {
    setGenerationError(null);
    if (step === "course-generation") {
      setStep("outline-edit");
      return;
    }
    setGeneratedOutline(null);
    setFinalOutline(null);
    setStep("url-input");
  };

  return (
    <div>
      {isGenerating ? (
        <h1 className="sr-only">Create a course from a URL</h1>
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
              Create a course from a URL
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Paste a document or article. We read it, draft an outline with AI,
              and you decide what goes into the course.
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
        {step === "url-input" && (
          <UrlCourseGenerator onOutlineGenerated={handleOutlineGenerated} />
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
            error={generationError}
            onRetry={() => {
              setGenerationError(null);
              setStep("outline-edit");
            }}
          />
        )}
      </div>
    </div>
  );
}
