import { Check } from "lucide-react";

interface CreationStepsProps {
  steps: readonly string[];
  currentIndex: number;
}

export default function CreationSteps({
  steps,
  currentIndex,
}: CreationStepsProps) {
  return (
    <ol
      aria-label="Creation progress"
      className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm"
    >
      {steps.map((label, index) => {
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <li
            key={label}
            aria-current={isCurrent ? "step" : undefined}
            className="flex items-center gap-2"
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] font-medium tabular-nums ${
                isCurrent
                  ? "border-accent bg-accent text-accent-ink"
                  : isDone
                    ? "border-accent/35 bg-accent-soft text-accent-deep"
                    : "border-rule bg-card text-muted-foreground"
              }`}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={
                isCurrent
                  ? "font-medium text-foreground"
                  : isDone
                    ? "text-ink-2"
                    : "text-muted-foreground"
              }
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className="ml-1.5 h-px w-5 bg-rule sm:w-8"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
