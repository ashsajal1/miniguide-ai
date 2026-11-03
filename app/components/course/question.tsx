"use client";

import { useEffect, useRef, useState } from "react";
import type { Prisma } from "@/generated/prisma";
import { Check, Edit, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import InlineMarkdown from "./inline-markdown";

type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: {
    options: true;
    content_item: true;
  };
}>;

interface QuestionProps {
  question: QuestionWithOptions;
  isCreator?: boolean;
  courseId?: string;
  onComplete?: () => void;
}

export default function Question({
  question,
  isCreator,
  courseId,
  onComplete,
}: QuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLInputElement>(null);
  const pendingOptionFocus = useRef(false);

  const promptId = `question-${question.id}-prompt`;
  const helpId = `question-${question.id}-help`;

  useEffect(() => {
    if (isSubmitted) {
      feedbackRef.current?.focus();
    } else if (pendingOptionFocus.current) {
      pendingOptionFocus.current = false;
      firstOptionRef.current?.focus();
    }
  }, [isSubmitted]);

  const handleOptionChange = (optionId: string) => {
    setSelectedOptions([optionId]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitted || selectedOptions.length === 0) return;
    setIsSubmitted(true);
    onComplete?.();
  };

  const handleRetry = () => {
    pendingOptionFocus.current = true;
    setSelectedOptions([]);
    setIsSubmitted(false);
  };

  const correctAnswers = question.options
    .filter((option) => option.isCorrect)
    .map((option) => option.id);

  const isCorrect =
    isSubmitted &&
    selectedOptions.length === correctAnswers.length &&
    selectedOptions.every((option) => correctAnswers.includes(option));

  const explanation =
    question.options.find(
      (option) => option.isCorrect && option.explanation?.trim()
    )?.explanation?.trim() ??
    question.options.find((option) => option.explanation?.trim())?.explanation
      ?.trim() ??
    null;

  const selectedOption = question.options.find((option) =>
    selectedOptions.includes(option.id)
  );
  const correctOption = question.options.find((option) => option.isCorrect);

  return (
    <section aria-labelledby={promptId}>
      <div className="flex items-start justify-between gap-4">
        <h2
          id={promptId}
          className="min-w-0 font-display text-[clamp(1rem,1.2vw,1.125rem)] leading-[1.3] text-ink"
        >
          <InlineMarkdown>
            {question.content || "Untitled question"}
          </InlineMarkdown>
        </h2>
        {isCreator && courseId && (
          <Link
            href={`/course/edit/${courseId}/question/${question.id}`}
            className="btn btn-ghost btn-sm h-8 shrink-0 gap-1.5 px-2 text-muted-foreground"
          >
            <Edit size={14} aria-hidden />
            Edit question
          </Link>
        )}
      </div>

      <p
        id={helpId}
        className="question-help mt-1.5 text-xs text-muted-foreground"
      >
        Select one answer.
      </p>

      {!isSubmitted ? (
        <form className="mt-3" onSubmit={handleSubmit}>
          <fieldset aria-describedby={helpId}>
            <legend className="sr-only">Answer choices</legend>

            <div className="question-options grid gap-2 sm:grid-cols-2">
              {question.options.map((option, index) => {
                const isSelected = selectedOptions.includes(option.id);

                const optionStyle = isSelected
                  ? "border-accent bg-accent-soft/40"
                  : "border-rule bg-card hover:border-accent/50 hover:bg-paper-2";

                const markStyle = isSelected
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-muted-foreground/40 bg-paper";

                return (
                  <label
                    key={option.id}
                    className={`question-option flex cursor-pointer items-start gap-2.5 rounded-[10px] border px-3 py-2.5 transition-[background-color,border-color] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${optionStyle}`}
                  >
                    <input
                      ref={index === 0 ? firstOptionRef : undefined}
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={isSelected}
                      onChange={() => handleOptionChange(option.id)}
                      className="peer sr-only"
                    />

                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${markStyle}`}
                    >
                      {isSelected ? (
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      ) : null}
                    </span>

                    <span
                      className={`min-w-0 flex-1 text-sm leading-snug ${
                        isSelected ? "text-ink" : "text-ink-2"
                      }`}
                    >
                      <InlineMarkdown>{option.text}</InlineMarkdown>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-3">
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto"
              disabled={selectedOptions.length === 0}
            >
              Submit answer
            </button>
          </div>
        </form>
      ) : (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="status"
          style={{ outline: "none" }}
          className={`mt-3 rounded-[10px] border p-3.5 ${
            isCorrect
              ? "border-accent bg-accent-soft/40"
              : "border-rule bg-paper-2"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  isCorrect
                    ? "bg-accent text-accent-ink"
                    : "bg-error text-error-content"
                }`}
              >
                {isCorrect ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <X className="h-3 w-3" strokeWidth={3} />
                )}
              </span>
              <p
                className={`font-display text-base leading-tight ${
                  isCorrect ? "text-accent-deep" : "text-ink"
                }`}
              >
                {isCorrect ? "Correct." : "Not quite."}
              </p>
            </div>
            {!isCorrect && (
              <button
                type="button"
                className="btn btn-outline btn-sm h-8 shrink-0 gap-1.5"
                onClick={handleRetry}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Try again
              </button>
            )}
          </div>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {!isCorrect && selectedOption && (
              <div className="flex items-start gap-2 rounded-[8px] border border-error/40 bg-error/5 px-2.5 py-2">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-error text-error-content"
                >
                  <X className="h-2 w-2" strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="dose text-[10px] text-error">Your answer</p>
                  <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink-2">
                    <InlineMarkdown>{selectedOption.text}</InlineMarkdown>
                  </p>
                </div>
              </div>
            )}

            {correctOption && (
              <div className="flex items-start gap-2 rounded-[8px] border border-accent/50 bg-accent-soft/40 px-2.5 py-2">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink"
                >
                  <Check className="h-2 w-2" strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="dose text-[10px] text-accent-deep">
                    Correct answer
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink-2">
                    <InlineMarkdown>{correctOption.text}</InlineMarkdown>
                  </p>
                </div>
              </div>
            )}
          </div>

          {explanation && (
            <div className="mt-2.5 border-t border-rule pt-2.5">
              <p className="dose text-[10px] text-muted-foreground">
                Explanation
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">
                <InlineMarkdown>{explanation}</InlineMarkdown>
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
