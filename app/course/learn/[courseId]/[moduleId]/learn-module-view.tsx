"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Menu,
  PenLine,
  Trophy,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ContentWithRelations } from "./page";
import { completeModule } from "./actions";
import ModuleContent from "@/app/components/course/module-content";
import { toast } from "sonner";

type DeckDocument = {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

// Space advances the deck, except when the learner is typing or operating a
// control: there it must keep its native meaning (a space, a click, a toggle).
const INTERACTIVE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "button",
  "a[href]",
  "summary",
  '[contenteditable="true"]',
  '[role="textbox"]',
  '[role="button"]',
  '[role="link"]',
  '[role="radio"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="tab"]',
].join(", ");

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest(INTERACTIVE_SELECTOR))
  );
}

function contentMeta(content: ContentWithRelations): {
  label: string;
  icon: LucideIcon;
} {
  switch (content.type) {
    case "SLIDE":
      return { label: "Slide", icon: FileText };
    case "QUESTION":
      return { label: "Question", icon: HelpCircle };
    case "WRITTEN":
      return { label: "Written", icon: PenLine };
    case null:
      return { label: "Item", icon: FileText };
    default: {
      const exhaustive: never = content.type;
      return exhaustive;
    }
  }
}

export default function LearnModuleView({
  moduleContent,
  moduleId,
  courseId,
  courseName,
  moduleTitle,
  moduleNumber,
  moduleCount,
  isCompleted: initialIsCompleted,
  nextModuleId,
  isCreator,
  isSignedIn,
}: {
  moduleContent: ContentWithRelations[];
  moduleId: string;
  courseId: string;
  courseName: string;
  moduleTitle: string;
  moduleNumber: number;
  moduleCount: number;
  isCompleted: boolean;
  nextModuleId: string | null;
  isCreator: boolean;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  // A completed module means every item was opened, so seed the checklist honestly.
  // Written items also carry a persisted submission, which counts as done.
  const [completedItemIds, setCompletedItemIds] = useState<Set<string>>(() => {
    if (initialIsCompleted) {
      return new Set(moduleContent.map((item) => item.id));
    }
    return new Set(
      moduleContent
        .filter(
          (item) => item.type === "WRITTEN" && item.written?.submissions.length
        )
        .map((item) => item.id)
    );
  });

  const totalItems = moduleContent.length;
  const currentContent = moduleContent[currentIndex];
  const currentMeta = currentContent ? contentMeta(currentContent) : null;
  const CurrentIcon = currentMeta?.icon;
  const isCurrentItemCompleted =
    currentContent && completedItemIds.has(currentContent.id);
  const isOnLastItem = currentIndex === totalItems - 1;
  const allItemsCompleted = moduleContent.every((item) =>
    completedItemIds.has(item.id)
  );
  const completedCount = moduleContent.filter((item) =>
    completedItemIds.has(item.id)
  ).length;
  const progressPercent =
    totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const firstUnfinishedIndex = moduleContent.findIndex(
    (item) => !completedItemIds.has(item.id)
  );

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const wasSidebarOpen = useRef(false);
  const focusContentOnChange = useRef(false);
  const isDeckTransitioning = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      closeButtonRef.current?.focus();
    } else if (wasSidebarOpen.current) {
      menuButtonRef.current?.focus();
    }
    wasSidebarOpen.current = isSidebarOpen;
  }, [isSidebarOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (focusContentOnChange.current) {
      focusContentOnChange.current = false;
      contentRef.current?.focus({ preventScroll: true });
    }
  }, [currentIndex]);

  const handleMarkAsCompleted = (id: string) => {
    setCompletedItemIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (currentContent && currentContent.type === "SLIDE") {
      handleMarkAsCompleted(currentContent.id);
    }
  }, [currentContent]);

  const goToIndex = (index: number) => {
    if (index < 0 || index >= totalItems || index === currentIndex) {
      setIsSidebarOpen(false);
      return;
    }

    const direction = index > currentIndex ? "next" : "prev";
    setIsSidebarOpen(false);
    focusContentOnChange.current = true;

    const deckDocument = document as unknown as DeckDocument;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reduceMotion && typeof deckDocument.startViewTransition === "function") {
      if (isDeckTransitioning.current) return;
      isDeckTransitioning.current = true;

      const root = document.documentElement;
      root.dataset.deckDirection = direction;
      deckRef.current?.style.setProperty("view-transition-name", "learn-card");

      const cleanup = () => {
        root.removeAttribute("data-deck-direction");
        deckRef.current?.style.removeProperty("view-transition-name");
        isDeckTransitioning.current = false;
      };

      const transition = deckDocument.startViewTransition(() => {
        flushSync(() => setCurrentIndex(index));
      });

      transition.finished.then(cleanup, cleanup);
      return;
    }

    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < totalItems - 1) goToIndex(currentIndex + 1);
  };

  const goToPrev = () => {
    if (currentIndex > 0) goToIndex(currentIndex - 1);
  };

  // Space is the deck's next gesture. No dependency array on purpose: the
  // listener re-subscribes after each render so it always sees the latest
  // item and completion state, and the sweep goes through the same
  // view-transition path as the Next button.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " " || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isSidebarOpen || isOnLastItem || !isCurrentItemCompleted) return;
      if (isInteractiveTarget(event.target)) return;

      event.preventDefault();
      goToNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const handleCompleteModule = async () => {
    setIsCompleting(true);
    try {
      const result = await completeModule(moduleId, courseId);
      if (result.success) {
        setIsCompleted(true);
        setCompletedItemIds(
          new Set(moduleContent.map((item) => item.id))
        );
        if (result.xpEarned && result.xpEarned > 0) {
          toast.success(`Module complete. You earned ${result.xpEarned} XP.`, {
            duration: 4000,
          });
        } else {
          toast.info("This module is already complete.", { duration: 3000 });
        }
      } else {
        toast.error(result.error || "Could not complete the module.", {
          duration: 3000,
        });
      }
    } catch {
      toast.error("Could not complete the module. Please try again.", {
        duration: 3000,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const goToNextModule = () => {
    router.push(
      nextModuleId
        ? `/course/learn/${courseId}/${nextModuleId}`
        : `/course/learn/${courseId}`
    );
  };

  if (totalItems === 0) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[46rem] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href={`/course/learn/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent-deep"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {courseName}
        </Link>
        <p className="dose mt-8 text-[11px] text-muted-foreground">
          Module {moduleNumber} of {moduleCount}
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.3rem)] leading-tight text-ink">
          {moduleTitle}
        </h1>
        <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">
          This module has no content yet. The creator is still writing it.
        </p>
        <Link
          href={`/course/learn/${courseId}`}
          className="btn btn-outline mt-6 w-fit gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to learning path
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-shade/40 transition-opacity duration-200 md:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Module contents */}
      <aside
        id="module-contents"
        aria-label="Module contents"
        inert={!isDesktop && !isSidebarOpen ? true : undefined}
        className={`fixed inset-y-0 left-0 z-[60] flex w-[19rem] max-w-[85vw] flex-col border-r border-rule bg-paper transition-transform duration-300 ease-out md:sticky md:top-0 md:z-20 md:h-dvh md:w-[19rem] md:max-w-none md:translate-x-0 md:self-start ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-rule px-4 pb-4 pt-3 md:pt-5">
          <div className="mb-3 flex items-center justify-between md:hidden">
            <span className="dose text-[11px] text-muted-foreground">
              Contents
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              className="btn btn-ghost h-9 w-9 shrink-0 px-0"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close contents"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <Link
            href={`/course/learn/${courseId}`}
            className="flex max-w-full items-start gap-1.5 text-xs text-muted-foreground transition-colors hover:text-accent-deep"
          >
            <ArrowLeft className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-2 leading-snug">{courseName}</span>
          </Link>

          <p className="dose mt-3 text-[11px] text-muted-foreground">
            Module {moduleNumber} of {moduleCount}
          </p>
          <h2 className="mt-1 font-display text-[1.15rem] leading-tight text-ink">
            {moduleTitle}
          </h2>
        </div>

        <div className="border-b border-rule px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="dose text-[11px] text-muted-foreground">
              {completedCount} of {totalItems} done
            </span>
            <span className="dose text-[11px] text-ink">
              {progressPercent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Module progress"
            aria-valuemin={0}
            aria-valuemax={totalItems}
            aria-valuenow={completedCount}
            aria-valuetext={`${completedCount} of ${totalItems} items done`}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-3"
          >
            <div
              className="h-full origin-left rounded-full bg-accent transition-transform duration-500"
              style={{ transform: `scaleX(${progressPercent / 100})` }}
            />
          </div>
        </div>

        <nav
          aria-label="Module contents"
          className="flex-1 overflow-y-auto px-2 py-2"
        >
          <ol className="space-y-0.5">
            {moduleContent.map((content, index) => {
              const meta = contentMeta(content);
              const Icon = meta.icon;
              const title =
                content.slide?.title ||
                content.question?.content ||
                content.written?.title ||
                content.written?.prompt ||
                "Untitled";
              const isActive = currentIndex === index;
              const isDone = completedItemIds.has(content.id);

              return (
                <li key={content.id}>
                  <button
                    type="button"
                    onClick={() => goToIndex(index)}
                    aria-current={isActive ? "step" : undefined}
                    className={`flex w-full items-start gap-3 rounded-[10px] px-2.5 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-accent-soft"
                        : "hover:bg-paper-2"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                        isDone
                          ? "border-accent bg-accent text-accent-ink"
                          : isActive
                            ? "border-accent bg-paper text-accent-deep"
                            : "border-rule bg-paper-2 text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        <span className="dose">{index + 1}</span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm leading-snug ${
                          isActive ? "font-medium text-ink" : "text-ink-2"
                        }`}
                      >
                        {title}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Icon className="h-3 w-3" aria-hidden />
                        {meta.label}
                        {isDone && (
                          <span className="text-accent-deep">Done</span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="border-t border-rule px-4 py-3">
          {isCompleted ? (
            <p className="flex items-center gap-2 text-sm text-accent-deep">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              <span className="font-medium">Module completed</span>
            </p>
          ) : (
            <Link
              href={`/course/learn/${courseId}`}
              className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors hover:text-accent-deep"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Learning path
            </Link>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Desktop keeps course, module and progress in the sidebar; this bar
            would only repeat them. It stays for the drawer layout, where the
            sidebar is off-screen. */}
        <div className="learn-module-header sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-sm md:hidden">
          <div className="mx-auto flex w-full max-w-[76rem] items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <button
              ref={menuButtonRef}
              type="button"
              className="btn btn-outline btn-sm h-9 shrink-0 gap-1.5 px-3 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-expanded={isSidebarOpen}
              aria-controls="module-contents"
            >
              <Menu className="h-4 w-4" aria-hidden />
              Contents
            </button>

            <Link
              href={`/course/learn/${courseId}`}
              className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent-deep md:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span className="max-w-[18rem] truncate">{courseName}</span>
            </Link>
            <span
              className="hidden h-4 w-px shrink-0 bg-rule md:block"
              aria-hidden
            />

            <div className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
              {moduleTitle}
            </div>
            {isCompleted && (
              <span className="dose-stamp hidden shrink-0 px-1.5 py-0.5 text-[10px] sm:inline-block">
                Completed
              </span>
            )}
          </div>
          <div
            className="h-0.5 bg-paper-3 md:hidden"
            role="progressbar"
            aria-label="Module progress"
            aria-valuemin={0}
            aria-valuemax={totalItems}
            aria-valuenow={completedCount}
            aria-valuetext={`${completedCount} of ${totalItems} items done`}
          >
            <div
              className="h-full origin-left bg-accent transition-transform duration-500"
              style={{ transform: `scaleX(${progressPercent / 100})` }}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="learn-stage mx-auto flex w-full max-w-[60rem] flex-1 flex-col px-4 pb-14 pt-7 sm:px-6 sm:pb-16 sm:pt-9 lg:px-8">
            <div ref={deckRef} className="learn-deck my-auto">
              <div className="learn-card">
                <div className="learn-card-label">
                  <span className="dose inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1 text-[10px] text-ink-2">
                    {CurrentIcon && (
                      <CurrentIcon className="h-3 w-3" aria-hidden />
                    )}
                    {currentMeta?.label ?? "Item"} {currentIndex + 1} of{" "}
                    {totalItems}
                  </span>
                  {isCurrentItemCompleted && (
                    <span className="dose inline-flex items-center gap-1 text-[10px] text-accent-deep">
                      <Check className="h-3 w-3" aria-hidden />
                      Done
                    </span>
                  )}
                </div>

                <div
                  ref={contentRef}
                  tabIndex={-1}
                  role="region"
                  aria-label={`${currentMeta?.label ?? "Item"} ${
                    currentIndex + 1
                  } of ${totalItems}`}
                  className="learn-card-body"
                  style={{ outline: "none" }}
                >
                  {currentContent && (
                    <ModuleContent
                      key={currentContent.id}
                      content={currentContent}
                      isCreator={isCreator}
                      courseId={courseId}
                      moduleId={moduleId}
                      isSignedIn={isSignedIn}
                      onComplete={() =>
                        handleMarkAsCompleted(currentContent.id)
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-30 border-t border-rule bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
          <div className="learn-nav mx-auto flex w-full max-w-[76rem] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              className="btn btn-ghost btn-sm h-10 gap-1"
              onClick={goToPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="dose text-[11px] text-muted-foreground">
                {currentIndex + 1} of {totalItems}
              </span>
              <span
                className="hidden h-1 w-24 overflow-hidden rounded-full bg-paper-3 sm:block"
                aria-hidden
              >
                <span
                  className="block h-full origin-left bg-accent transition-transform duration-500"
                  style={{ transform: `scaleX(${progressPercent / 100})` }}
                />
              </span>
            </div>

            {isCompleted ? (
              isOnLastItem ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm h-10 gap-1.5"
                  onClick={goToNextModule}
                >
                  <span>{nextModuleId ? "Next module" : "Back to course"}</span>
                  {nextModuleId ? (
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  ) : (
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm h-10 gap-1.5"
                  onClick={goToNext}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              )
            ) : allItemsCompleted ? (
              <button
                type="button"
                className="btn btn-primary btn-sm h-10 gap-1.5"
                onClick={handleCompleteModule}
                disabled={isCompleting}
              >
                <Trophy className="h-4 w-4" aria-hidden />
                <span>
                  {isCompleting ? "Completing…" : "Complete module"}
                </span>
              </button>
            ) : isOnLastItem ? (
              firstUnfinishedIndex === currentIndex ? (
                <span className="dose text-right text-[11px] leading-tight text-muted-foreground">
                  Finish this item to complete the module
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm h-10 gap-1.5"
                  onClick={() => goToIndex(firstUnfinishedIndex)}
                >
                  <span>Finish remaining</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm h-10 gap-1.5"
                onClick={goToNext}
                disabled={!isCurrentItemCompleted}
                title={
                  isCurrentItemCompleted
                    ? undefined
                    : "Finish this item to continue"
                }
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
