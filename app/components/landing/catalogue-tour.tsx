"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  FileText,
  Link2,
  ListChecks,
  PencilLine,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "source" | "draft" | "course";

const ORDER: TabKey[] = ["source", "draft", "course"];

const TABS: { key: TabKey; label: string; icon: typeof Link2 }[] = [
  { key: "source", label: "Bring the source", icon: Link2 },
  { key: "draft", label: "Edit the draft", icon: PencilLine },
  { key: "course", label: "Finish it", icon: ListChecks },
];

const MODULES = [
  { title: "The three statements", minutes: 6 },
  { title: "Revenue to gross profit", minutes: 5 },
  { title: "Where costs hide", minutes: 7 },
  { title: "The one ratio to watch", minutes: 8 },
];

export default function CatalogueTour() {
  const [active, setActive] = useState<TabKey>("source");

  const move = (direction: 1 | -1) => {
    const next = ORDER[(ORDER.indexOf(active) + direction + ORDER.length) % ORDER.length];
    setActive(next);
    document.getElementById(`tour-tab-${next}`)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="How a course is made"
        className="grid gap-2 sm:grid-cols-3"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {TABS.map((tab, index) => {
          const selected = active === tab.key;
          return (
            <button
              key={tab.key}
              id={`tour-tab-${tab.key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`tour-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
              className={cn(
                "flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-colors",
                selected
                  ? "border-accent-deep bg-card shadow-[0_2px_0_var(--color-accent-deep)]"
                  : "border-rule bg-paper-2/70 hover:border-ink/30 hover:bg-card"
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px]",
                  selected
                    ? "bg-accent text-accent-ink"
                    : "bg-paper-3 text-ink-2"
                )}
              >
                {index + 1}
              </span>
              <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                <tab.icon className="h-4 w-4 text-accent-deep" aria-hidden />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-[14px] border border-rule bg-card shadow-[var(--shadow-card)]">
        {active === "source" && (
          <Panel
            key="source"
            id="source"
            title="Bring the source"
            body="Paste a URL or upload a document. An annual report, a client brief, a policy, an article, or your own notes all work."
            bullets={["A link or a file", "No outline to write first", "Edit before publishing"]}
          >
            <div className="rounded-[10px] border border-rule bg-paper-2 p-4">
              <div className="flex items-center gap-2 border-b border-rule pb-3">
                <FileText className="h-4 w-4 shrink-0 text-accent-deep" aria-hidden />
                <p className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink-2">
                  annual-report-2026.pdf
                </p>
                <span className="rounded-[6px] bg-card px-2 py-1 font-mono text-[9px] text-muted-foreground">
                  28 PAGES
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Report", "Brief", "Article", "PDF", "Notes"].map((kind) => (
                  <span
                    key={kind}
                    className="rounded-full border border-rule bg-card px-2.5 py-1 text-[10px] text-ink-2"
                  >
                    {kind}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-rule pt-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] text-muted-foreground">
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                  OR PASTE A LINK
                </span>
                <button
                  type="button"
                  onClick={() => setActive("draft")}
                  className="btn btn-primary btn-sm"
                >
                  Draft the course
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Sample source. Your own document stays yours.
            </p>
          </Panel>
        )}

        {active === "draft" && (
          <Panel
            key="draft"
            id="draft"
            title="Edit the draft"
            body="AI proposes a short outline with modules, lessons, and practice questions. Keep what works and cut what does not."
            bullets={["Modules and lessons", "One question per module", "Fully editable"]}
          >
            <div className="rounded-[10px] border border-rule bg-paper-2 p-4">
              <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-3">
                <p className="text-[13px] font-medium text-ink">Reading a P&amp;L</p>
                <span className="font-mono text-[9px] text-muted-foreground">
                  AI DRAFT · 4 OF 6 MODULES
                </span>
              </div>
              <ul>
                {MODULES.map((module, index) => (
                  <li
                    key={module.title}
                    className="flex items-center gap-2 border-b border-rule/70 py-2 last:border-b-0"
                  >
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 text-[12px] text-ink-2">{module.title}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                      <Clock3 className="h-3 w-3" aria-hidden />
                      {module.minutes} MIN
                    </span>
                    <PencilLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-rule pt-3">
                <span className="text-[10px] text-muted-foreground">
                  Reorder, rename, or remove anything.
                </span>
                <button
                  type="button"
                  onClick={() => setActive("course")}
                  className="btn btn-primary btn-sm"
                >
                  Looks right
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </Panel>
        )}

        {active === "course" && (
          <Panel
            key="course"
            id="course"
            title="Finish it"
            body="Work through one module at a time. Questions check recall, and your progress and XP are saved as you go."
            bullets={["Short modules", "Progress and XP saved", "Pick up on any device"]}
          >
            <div className="rounded-[10px] border border-rule bg-paper-2 p-4">
              <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-3">
                <p className="text-[13px] font-medium text-ink">Reading a P&amp;L</p>
                <span className="dose-stamp text-[9px]">In progress</span>
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
                <span>MODULE 3 OF 6</span>
                <span>50% COMPLETE</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rule">
                <span className="block h-full w-1/2 rounded-full bg-accent" />
              </div>
              <div className="mt-4 border-t border-rule pt-3">
                <p className="text-[12px] leading-relaxed text-ink">
                  Where does a cost sit if it is not in the cost of goods sold?
                </p>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  <span className="rounded-[6px] border border-rule bg-card px-2.5 py-1.5 text-[10px] text-ink-2">
                    In revenue
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-accent bg-accent-soft px-2.5 py-1.5 text-[10px] font-medium text-ink">
                    <Check className="h-3 w-3" aria-hidden />
                    In operating expenses
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-rule pt-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  PROGRESS SAVED
                </span>
                <Link href="/sign-up" className="btn btn-primary btn-sm">
                  Start free
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Panel({
  id,
  title,
  body,
  bullets,
  children,
}: {
  id: TabKey;
  title: string;
  body: string;
  bullets: string[];
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`tour-panel-${id}`}
      aria-labelledby={`tour-tab-${id}`}
      className="animate-fade-in grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10"
    >
      <div>
        <h3 className="text-[clamp(1.35rem,2.2vw,1.8rem)] leading-tight text-foreground">
          {title}
        </h3>
        <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">{body}</p>
        <ul className="mt-5 space-y-2">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-[13px] text-ink-2">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft">
                <Check className="h-2.5 w-2.5 text-accent-deep" strokeWidth={3} aria-hidden />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>
      <div>{children}</div>
    </div>
  );
}
