"use client";

import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

interface GenerationViewProps {
  error: string | null;
  onRetry: () => void;
  retryLabel?: string;
  workingCopy?: string;
}

export default function GenerationView({
  error,
  onRetry,
  retryLabel = "Back to the outline",
  workingCopy = "We are writing modules, slide cards, questions, and a written task from your outline.",
}: GenerationViewProps) {
  if (error) {
    return (
      <section
        role="alert"
        className="rounded-[14px] border border-rule bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-error/10 text-error">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-foreground">
              The course didn&apos;t finish
            </h2>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ink-2">
              {error}
            </p>
            <p className="mt-1 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
              Your outline is safe. Go back, check it, and start the build
              again.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="btn btn-primary mt-5 gap-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {retryLabel}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      role="status"
      className="rounded-[14px] border border-rule bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <span className="dose-stamp text-[10px]">Building</span>
      <h2 className="mt-5 font-display text-xl font-bold tracking-[-0.02em] text-foreground">
        Building your course
      </h2>
      <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
        {workingCopy} This can take up to a minute.
      </p>
      <div className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-warning/40 bg-warning/5 px-3.5 py-3">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-warning"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-ink-2">
          <span className="font-medium text-ink">Keep this tab open.</span>{" "}
          Closing or refreshing it stops the build before the course is saved.
        </p>
      </div>
      <div className="mt-5 flex items-center gap-2.5 border-t border-rule pt-4 text-sm text-ink-2">
        <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
        Writing modules, slide cards, questions, and written practice…
      </div>
    </section>
  );
}
