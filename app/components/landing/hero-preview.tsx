import Link from "next/link";
import { Maximize2, Play, Volume2 } from "lucide-react";

const OPTIONS = ["Revenue", "Operating expenses", "Gross profit"];

export default function HeroPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-[14px] border border-rule bg-[var(--color-tue)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[14px] border border-rule bg-[var(--color-wed)]"
      />

      <Link
        href="/course"
        aria-label="Preview the sample course, Reading a P&L"
        className="dose-label group relative block overflow-hidden p-2.5 sm:p-3"
      >
        <div className="flex items-baseline justify-between gap-3 px-1 pb-2.5 label-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>Sample lesson</span>
          <span>No. 001 · 2 min preview</span>
        </div>

        <div className="relative overflow-hidden rounded-[10px] border border-rule">
          <div className="plastic plastic--thu relative aspect-[16/10]">
            <div
              aria-hidden
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, var(--color-ink) 0 1px, transparent 1px 22px)",
              }}
            />

            <div className="absolute inset-0 grid place-items-center p-5 sm:p-7">
              <div className="w-full max-w-[340px] -rotate-1 rounded-[10px] border border-rule bg-card p-4 shadow-[var(--shadow-card)] transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                <div className="flex items-baseline justify-between gap-3 label-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span>Module 03</span>
                  <span>7 min</span>
                </div>
                <p className="mt-2 font-display text-[22px] font-bold leading-[1.04] tracking-[-0.03em] text-foreground">
                  Where costs hide
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-2">
                  If a cost is not in the cost of goods sold, where does it sit?
                </p>
                <ul className="mt-3 space-y-1 border-t border-rule pt-2">
                  {OPTIONS.map((option, index) => (
                    <li
                      key={option}
                      className={
                        index === 1
                          ? "flex items-center gap-2 rounded-[6px] bg-accent-soft px-2 py-1 text-[10px] font-medium text-ink"
                          : "flex items-center gap-2 px-2 py-1 text-[10px] text-ink-2"
                      }
                    >
                      <span
                        aria-hidden
                        className={
                          index === 1
                            ? "h-1.5 w-1.5 rounded-full bg-accent"
                            : "h-1.5 w-1.5 rounded-full bg-rule"
                        }
                      />
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <span className="absolute left-3 top-3 rounded-full border border-ink/15 bg-card/85 px-2.5 py-1 label-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-2 backdrop-blur-sm">
              Preview
            </span>
          </div>

          <div className="flex items-center gap-3 border-t border-rule bg-card px-3 py-2.5 text-muted-foreground">
            <Play className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden />
            <span className="label-mono shrink-0 text-[9px] tabular-nums">
              0:00 / 2:16
            </span>
            <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-rule">
              <span className="absolute inset-y-0 left-0 w-[8%] rounded-full bg-accent" />
              <span className="absolute left-[8%] top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
            </span>
            <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <Maximize2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </div>
        </div>
      </Link>
    </div>
  );
}
