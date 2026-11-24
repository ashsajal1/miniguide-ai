"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { InferSelectModel } from "drizzle-orm";
import type {
  written as writtenTable,
  writtenSubmission as submissionTable,
} from "@/db/schema";
import { Check, PenLine, RotateCcw, Sparkles } from "lucide-react";
import {
  submitWrittenResponse,
  type WrittenSubmissionView,
} from "@/app/course/learn/[courseId]/[moduleId]/actions";
import InlineMarkdown from "./inline-markdown";

type WrittenWithSubmission = InferSelectModel<typeof writtenTable> & {
  submissions: InferSelectModel<typeof submissionTable>[];
};

const MIN_ANSWER = 40;
const MAX_ANSWER = 2000;

const VERDICT_LABEL: Record<string, string> = {
  STRONG: "Strong",
  PARTIAL: "Partly there",
  NEEDS_WORK: "Needs work",
};

export default function Written({
  written,
  courseId,
  moduleId,
  isSignedIn,
  onComplete,
}: {
  written: WrittenWithSubmission;
  courseId: string;
  moduleId: string;
  isSignedIn: boolean;
  onComplete?: () => void;
}) {
  const pathname = usePathname();
  const initial = (written.submissions[0] as WrittenSubmissionView | undefined) ?? null;

  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [submission, setSubmission] = useState<WrittenSubmissionView | null>(initial);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(Boolean(initial));

  const feedbackRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusFeedback = useRef(false);

  useEffect(() => {
    if (showFeedback && focusFeedback.current) {
      focusFeedback.current = false;
      feedbackRef.current?.focus({ preventScroll: true });
    }
  }, [showFeedback]);

  const length = answer.trim().length;
  const tooShort = length < MIN_ANSWER;
  const tooLong = length > MAX_ANSWER;
  const canSubmit = isSignedIn && !tooShort && !tooLong && !isAnalyzing;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await submitWrittenResponse({
        courseId,
        moduleId,
        writtenId: written.id,
        answer,
      });

      if (result.success) {
        setSubmission(result.submission);
        focusFeedback.current = true;
        setShowFeedback(true);
        onComplete?.();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong while checking your answer. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRevise = () => {
    setShowFeedback(false);
    setError(null);
    setAnswer(submission?.answer ?? answer);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const verdictTone =
    submission?.verdict === "STRONG"
      ? "border-accent bg-accent-soft/30"
      : submission?.verdict === "NEEDS_WORK"
        ? "border-error/40 bg-error/5"
        : "border-rule bg-paper-2";

  const guidancePoints = (written.guidance ?? "")
    .split(/\n|•/)
    .map((point) => point.replace(/^[\s\-*•]+/, "").trim())
    .filter(Boolean);

  return (
    <section aria-labelledby="written-title">
      <h2
        id="written-title"
        className="min-w-0 font-display text-[1.35rem] leading-tight text-ink"
      >
        <InlineMarkdown>{written.title || "Written task"}</InlineMarkdown>
      </h2>

      <p className="mt-2 text-[1.0625rem] leading-relaxed text-ink-2">
        <InlineMarkdown>{written.prompt}</InlineMarkdown>
      </p>

      {guidancePoints.length > 0 && (
        <div className="mt-4 rounded-[10px] bg-paper-2 px-4 py-3">
          <p className="dose text-[10px] text-muted-foreground">
            A strong answer covers
          </p>
          <ul className="mt-1.5 space-y-1">
            {guidancePoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground"
                />
                <span><InlineMarkdown>{point}</InlineMarkdown></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isSignedIn ? (
        <div className="mt-6 rounded-[10px] border border-rule bg-paper-2 p-5">
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">
            AI feedback needs an account so your answer and its feedback can be
            saved for you.
          </p>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
            className="btn btn-primary mt-4 gap-2"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            Sign in to get feedback
          </Link>
        </div>
      ) : showFeedback && submission ? (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="region"
          aria-label="Feedback on your answer"
          style={{ outline: "none" }}
          className={`mt-6 rounded-[10px] border p-4 sm:p-5 ${verdictTone}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="dose inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3" aria-hidden />
              AI feedback
            </span>
            <span className="dose text-[10px] text-ink-2">
              {submission.score} of 5
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p
              className={`font-display text-xl leading-tight ${
                submission.verdict === "NEEDS_WORK"
                  ? "text-error"
                  : "text-ink"
              }`}
            >
              {VERDICT_LABEL[submission.verdict] ?? submission.verdict}
            </p>
          </div>

          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
            {submission.summary}
          </p>

          {submission.strengths.length > 0 && (
            <div className="mt-4 border-t border-rule pt-3">
              <p className="dose text-[10px] text-muted-foreground">
                What works
              </p>
              <ul className="mt-2 space-y-1.5">
                {submission.strengths.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm leading-relaxed text-ink-2"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-deep"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {submission.gaps.length > 0 && (
            <div className="mt-3 border-t border-rule pt-3">
              <p className="dose text-[10px] text-muted-foreground">
                What to sharpen
              </p>
              <ul className="mt-2 space-y-1.5">
                {submission.gaps.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm leading-relaxed text-ink-2"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <details className="mt-4 rounded-[10px] border border-rule bg-card p-3.5">
            <summary className="cursor-pointer text-sm font-medium text-ink-2">
              Model answer
            </summary>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-2">
              {submission.model_answer}
            </p>
          </details>

          <button
            type="button"
            className="btn btn-outline btn-sm mt-4 gap-1.5"
            onClick={handleRevise}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Revise answer
          </button>
        </div>
      ) : (
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor="written-answer"
              className="text-sm font-medium text-ink"
            >
              Your answer
            </label>
            <span
              className={`dose text-[10px] ${
                tooLong ? "text-error" : "text-muted-foreground"
              }`}
            >
              {length} / {MAX_ANSWER}
            </span>
          </div>

          <textarea
            id="written-answer"
            ref={textareaRef}
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              if (error) setError(null);
            }}
            rows={6}
            disabled={isAnalyzing}
            aria-describedby="written-answer-help"
            aria-invalid={tooLong || undefined}
            placeholder="Write 3-6 sentences in your own words."
            className="textarea mt-2 w-full"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p
              id="written-answer-help"
              className="text-xs text-muted-foreground"
            >
              {tooShort
                ? `${MIN_ANSWER} characters minimum.`
                : "Use the module's ideas; one concrete example helps."}
            </p>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={!canSubmit}
            >
              {isAnalyzing ? (
                <>
                  <span className="loading loading-spinner loading-sm" aria-hidden />
                  Reading your answer…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Submit for feedback
                </>
              )}
            </button>
          </div>

          {isAnalyzing && (
            <p
              role="status"
              aria-live="polite"
              className="mt-3 text-sm text-muted-foreground"
            >
              Checking your answer against this module&apos;s cards…
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-[10px] border border-error/40 bg-error/5 px-4 py-3"
            >
              <p className="text-sm leading-relaxed text-ink-2">{error}</p>
              <button
                type="submit"
                className="btn btn-outline btn-sm mt-2"
                disabled={isAnalyzing}
              >
                Try again
              </button>
            </div>
          )}
        </form>
      )}
    </section>
  );
}
