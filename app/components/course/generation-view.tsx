"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import type { BuildPhase, ModuleBuildState } from "./use-course-build";

interface GenerationViewProps {
  error: string | null;
  onRetry: () => void;
  retryLabel?: string;
  workingCopy?: string;
  modules?: ModuleBuildState[];
  phase?: BuildPhase;
}

export default function GenerationView({
  error,
  onRetry,
  retryLabel = "Resume the build",
  workingCopy = "We are writing modules, slide cards, questions, and a written task from your outline.",
  modules = [],
  phase = "idle",
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
              Any modules already written are saved. Resume to finish the rest.
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

  const done = modules.filter((module) => module.status === "done").length;

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
        {phase === "saving-outline"
          ? "Saving the course and its module list first, then writing the content."
          : `${workingCopy} This can take up to a minute.`}
      </p>
      <div className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-warning/40 bg-warning/5 px-3.5 py-3">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-warning"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-ink-2">
          <span className="font-medium text-ink">Keep this tab open.</span>{" "}
          Modules are saved as they finish, but closing the tab stops the build
          before the rest is written.
        </p>
      </div>

      {modules.length > 0 && (
        <ol className="mt-5 space-y-2.5 border-t border-rule pt-4">
          {modules.map((module, index) => (
            <li
              key={`${index}-${module.title}`}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-start gap-2.5">
                {module.status === "done" ? (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-success"
                    aria-hidden
                  />
                ) : module.status === "active" ? (
                  <Loader2
                    className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-accent"
                    aria-hidden
                  />
                ) : module.status === "failed" ? (
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-error"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50"
                    aria-hidden
                  />
                )}
                <span
                  className={
                    module.status === "pending"
                      ? "truncate text-muted-foreground"
                      : "truncate text-ink"
                  }
                >
                  {module.title}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {module.status === "done"
                  ? [
                      `${module.slides} ${
                        module.slides === 1 ? "card" : "cards"
                      }`,
                      `${module.questions} ${
                        module.questions === 1 ? "question" : "questions"
                      }`,
                      ...(module.written ? ["written task"] : []),
                    ].join(" · ")
                  : module.status === "active"
                    ? "Writing…"
                    : module.status === "failed"
                      ? "Stopped"
                      : "Queued"}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-5 flex items-center gap-2.5 border-t border-rule pt-4 text-sm text-ink-2">
        <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
        {modules.length === 0
          ? "Saving the course outline and modules…"
          : done === modules.length
            ? "All modules written. Opening the editor…"
            : `${done} of ${modules.length} modules written…`}
      </div>
    </section>
  );
}
