import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  Cpu,
  HeartPulse,
  Plus,
  Scale,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CatalogueTour from "@/app/components/landing/catalogue-tour";
import HeroPreview from "@/app/components/landing/hero-preview";

export const metadata: Metadata = {
  title: "Learn it this afternoon",
  description:
    "Paste a document or a link and get a short course you can finish before the day ends. Browsing, enrolling, and learning are free during beta.",
};

const stats = [
  { value: "100+", label: "courses" },
  { value: "50+", label: "instructors" },
  { value: "98%", label: "satisfaction" },
  { value: "1000+", label: "learners" },
];

const subjects: { label: string; icon: LucideIcon }[] = [
  { label: "Business", icon: Briefcase },
  { label: "Finance", icon: BarChart3 },
  { label: "Architecture", icon: Building2 },
  { label: "Health", icon: HeartPulse },
  { label: "Technology", icon: Cpu },
  { label: "Law", icon: Scale },
];

const featured: {
  no: string;
  field: string;
  title: string;
  body: string;
  modules: number;
  minutes: number;
  tint: string;
  icon: LucideIcon;
}[] = [
  {
    no: "No. 001",
    field: "Finance",
    title: "Reading a P&L",
    body: "The three statements, gross profit, and the one ratio to watch.",
    modules: 6,
    minutes: 38,
    tint: "plastic--tue",
    icon: BarChart3,
  },
  {
    no: "No. 002",
    field: "Architecture",
    title: "How a building works",
    body: "Structure, services, and the finished room.",
    modules: 6,
    minutes: 29,
    tint: "plastic--wed",
    icon: Building2,
  },
  {
    no: "No. 003",
    field: "Business",
    title: "Writing a one-page brief",
    body: "The ask, the evidence, and the decision.",
    modules: 5,
    minutes: 21,
    tint: "plastic--thu",
    icon: Briefcase,
  },
  {
    no: "No. 004",
    field: "Health",
    title: "The body's energy systems",
    body: "Three ways the body makes fuel, plainly.",
    modules: 5,
    minutes: 24,
    tint: "plastic--fri",
    icon: HeartPulse,
  },
  {
    no: "No. 005",
    field: "Technology",
    title: "Reading a technical brief",
    body: "Scope, constraints, and the questions to ask.",
    modules: 6,
    minutes: 27,
    tint: "plastic--sat",
    icon: Cpu,
  },
  {
    no: "No. 006",
    field: "Law",
    title: "Reading a contract",
    body: "The clauses that matter and the ones that do not.",
    modules: 7,
    minutes: 32,
    tint: "plastic--sun",
    icon: Scale,
  },
];

const comparison = [
  {
    long: "Saved to a tab you never reopen",
    short: "A course that prints its own ending",
  },
  {
    long: "No place to check what stuck",
    short: "One question at the end of every module",
  },
  {
    long: "Progress lives in your memory",
    short: "Progress and XP saved after each module",
  },
  {
    long: "Another item on the reading list",
    short: "Something you actually finished",
  },
];

const features = [
  {
    title: "Short by design",
    body: "Modules are built to finish in one sitting. A whole course fits inside an afternoon.",
  },
  {
    title: "Practice, not just reading",
    body: "Each module ends with a question, so you find the gaps before they reach the meeting.",
  },
  {
    title: "Progress and XP",
    body: "Your place is saved after every module. Pick up on another device without re-reading.",
  },
  {
    title: "A next-up queue",
    body: "Save a course when you spot it and return to it when the window opens.",
  },
  {
    title: "An editable draft",
    body: "AI proposes the outline. You keep, cut, rename, and reorder before publishing.",
  },
  {
    title: "Public or private",
    body: "Courses made from your own material stay yours. Publish them or keep them to yourself.",
  },
];

const included = [
  "Browse every course without an account",
  "Enrol, complete modules, and earn XP",
  "Save courses and rate the ones you finish",
  "Create and publish your own courses",
];

const faqs = [
  {
    q: "What is MiniGuide AI?",
    a: "A learning platform that turns a document, article, or link into a short course with modules, lessons, and practice questions. You can edit the draft before anything is published.",
  },
  {
    q: "Do I need an account to learn?",
    a: "You can browse courses without one. An account is needed to enrol, keep progress, earn XP, save courses, and leave ratings.",
  },
  {
    q: "How is my progress tracked?",
    a: "Completing a module updates the course progress on your profile, alongside modules completed and total XP earned.",
  },
  {
    q: "Can I save courses for later?",
    a: "Yes. Save any course from its card or page. Saved courses sit in your profile as a next-up queue.",
  },
  {
    q: "Is it really free?",
    a: "Browsing, enrolling, and learning are free while the product is in beta. No card is required.",
  },
  {
    q: "Who owns what I create?",
    a: "Courses generated from your own materials belong to you. You choose whether they are public or private.",
  },
];

const pledges = [
  {
    title: "Built to finish",
    body: "Every entry prints its modules and minutes up front, so you know the size before you open it.",
  },
  {
    title: "Your source stays yours",
    body: "Upload a document, edit the draft, then publish it or keep it private.",
  },
  {
    title: "Free while it is in beta",
    body: "Browsing, enrolling, and learning cost nothing. No card and no trial countdown.",
  },
];

const sources = [
  "Annual report",
  "Client brief",
  "Policy",
  "Article",
  "Your own notes",
];

export default function Home() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden">
        <div className="window-light" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="relative mx-auto max-w-[1240px] px-5 pt-10 sm:px-8 lg:pt-14">
          <div className="grid gap-12 pb-16 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:gap-14 lg:pb-24 lg:pt-8 xl:gap-20">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-card px-3 py-1.5 label-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-2 shadow-[inset_0_1px_0_var(--color-glint)]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                100+ courses · Built to finish
              </span>

              <h1 className="mt-6 max-w-[20ch] text-[clamp(2.9rem,6vw,4.6rem)] leading-[0.94] tracking-[-0.04em] text-foreground">
                <span className="text-accent-deep">MiniGuide</span> turns complex docs
                into mini guided lessons.
              </h1>

              <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-ink-2">
                Paste a document, an article, or a link. MiniGuide drafts the modules and
                questions, and keeps your progress from the first module to the last.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/course" className="btn btn-primary btn-lg">
                  Browse the library
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/sign-up" className="btn btn-outline btn-lg">
                  Get started free
                </Link>
              </div>

              <p className="label-mono mt-5 text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
                Browse · Enrol · Finish in an afternoon
              </p>

              <div className="mt-10 border-t border-rule pt-5">
                <p className="label-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  Used by 1000+ learners
                </p>
                <ul className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                  {subjects.map((subject) => (
                    <li
                      key={subject.label}
                      className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-2"
                    >
                      <subject.icon className="h-4 w-4 text-accent-deep" aria-hidden />
                      {subject.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="min-w-0">
              <HeroPreview />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Catalogue figures" className="border-y border-rule bg-card">
        <div className="mx-auto max-w-[1240px]">
          <dl className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "bg-card px-5 py-5 sm:px-6",
                  index % 2 === 1 && "border-l border-rule",
                  index >= 2 && "border-t border-rule sm:border-t-0",
                  index > 0 && "sm:border-l sm:border-rule"
                )}
              >
                <dt className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-none tracking-[-0.03em] text-foreground">
                  {stat.value}
                </dt>
                <dd className="mt-1.5 label-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="courses" className="scroll-mt-28 border-t-2 border-ink bg-paper-2">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.03em] text-foreground">
                On the shelf
              </h2>
              <p className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">
                Six sample entries from the format. The live shelf holds 100+ published
                courses, each with its modules and minutes printed up front.
              </p>
            </div>
            <Link href="/course" className="btn btn-outline btn-sm w-fit">
              Browse all 100+ courses
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </header>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <article
                key={course.title}
                className="group flex flex-col overflow-hidden rounded-[14px] border border-rule bg-card shadow-[var(--shadow-card)]"
              >
                <div className="p-2.5">
                  <div
                    className={`plastic ${course.tint} relative flex aspect-[16/10] flex-col justify-between rounded-[10px] p-4`}
                  >
                    <div className="flex items-baseline justify-between gap-3 label-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-2">
                      <span>{course.field}</span>
                      <span>{course.no}</span>
                    </div>

                    <div className="grid place-items-center">
                      <course.icon
                        className="h-9 w-9 text-ink/40"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>

                    <div className="flex items-baseline justify-between gap-3 label-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-2">
                      <span>{course.modules} modules</span>
                      <span>{course.minutes} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-[19px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {course.body}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-rule pt-4">
                    <span className="dose-stamp text-[9px]">Sample entry</span>
                    <Link
                      href="/course"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-deep transition-colors hover:text-foreground"
                    >
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-28 border-t border-rule bg-paper-2/50"
      >
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="max-w-[18ch] text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.03em] text-foreground">
                See it. Draft it. Finish it.
              </h2>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
                Three steps, in the order they happen. The draft stays editable until
                you publish it.
              </p>
            </div>
            <p className="label-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              Source in · Course out
            </p>
          </div>

          <CatalogueTour />
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <h2 className="max-w-[16ch] text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.03em] text-foreground">
                The difference is the ending.
              </h2>
              <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-ink-2">
                A long read can be useful. A short course is finished. The catalogue is
                built around the second one.
              </p>
              <Link href="/course" className="btn btn-primary mt-7">
                Browse the library
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="grid gap-px border-y-2 border-ink bg-rule sm:grid-cols-2">
              <div className="bg-paper p-6">
                <p className="label-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  A long read
                </p>
                <ul className="mt-4 space-y-3">
                  {comparison.map((row) => (
                    <li
                      key={row.long}
                      className="flex items-start gap-2.5 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground"
                    >
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      {row.long}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card p-6">
                <p className="label-mono text-[9px] uppercase tracking-[0.14em] text-accent-deep">
                  A MiniGuide course
                </p>
                <ul className="mt-4 space-y-3">
                  {comparison.map((row) => (
                    <li
                      key={row.short}
                      className="flex items-start gap-2.5 border-t border-rule pt-3 text-[13px] leading-relaxed text-ink"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft">
                        <Check
                          className="h-2.5 w-2.5 text-accent-deep"
                          strokeWidth={3}
                          aria-hidden
                        />
                      </span>
                      {row.short}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-28 border-t border-rule bg-paper-2/50">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="max-w-[10ch] text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.03em] text-foreground">
                What you keep.
              </h2>
              <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-ink-2">
                One account holds every course, question, and saved pick. No separate
                notes app, no exported outline to maintain.
              </p>
            </div>

            <div className="grid gap-x-10 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="border-t border-rule py-5">
                  <h3 className="font-display text-[16px] font-bold tracking-[-0.02em] text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 max-w-[40ch] text-[13px] leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="use-cases"
        className="scroll-mt-28 border-t border-rule bg-paper-2/50"
      >
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <header className="mb-9 max-w-[62ch]">
            <h2 className="max-w-[16ch] text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.03em] text-foreground">
              For the work you already do.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
              The source is usually already on your desk. These are three ways people use
              the catalogue in a working week.
            </p>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <article className="plastic plastic--tue flex flex-col gap-8 rounded-[14px] p-7 lg:p-9">
              <div>
                <h3 className="max-w-[17ch] text-[clamp(1.5rem,2.2vw,2rem)] leading-tight text-ink">
                  A brief lands at nine. You are ready by lunch.
                </h3>
                <p className="mt-3 max-w-[40ch] text-[13.5px] leading-relaxed text-ink-2">
                  Draft the course from the brief, cut it to five modules, and work
                  through the two that matter before the meeting.
                </p>
              </div>

              <ol className="border-t border-ink/15">
                {[
                  { time: "09:04", event: "Brief uploaded" },
                  { time: "09:19", event: "Draft edited" },
                  { time: "12:31", event: "Course finished" },
                ].map((step) => (
                  <li
                    key={step.time}
                    className="flex items-baseline justify-between gap-3 border-b border-ink/15 py-2.5 last:border-b-0"
                  >
                    <span className="label-mono text-[10px] text-ink-2">{step.time}</span>
                    <span className="text-[12.5px] font-medium text-ink">{step.event}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                <p className="label-mono text-[9px] uppercase tracking-[0.12em] text-ink-2">
                  Business · Sample scenario
                </p>
                <Link
                  href="/sign-up"
                  className="label-mono text-[9.5px] text-ink-2 underline underline-offset-4 hover:text-ink"
                >
                  Start with your own brief
                </Link>
              </div>
            </article>

            <div className="grid gap-4">
              <article className="flex flex-col justify-between gap-6 rounded-[14px] border border-rule bg-card p-6">
                <div>
                  <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-foreground">
                    Reading a building
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    A planning document becomes a walkthrough of structure, services, and
                    finishes, ready before a site visit.
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="label-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    Architecture · Sample scenario
                  </p>
                  <p className="label-mono text-[9px] text-muted-foreground">
                    4 modules · 18 min
                  </p>
                </div>
              </article>

              <article className="flex flex-col justify-between gap-6 rounded-[14px] border border-rule bg-card p-6">
                <div>
                  <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-foreground">
                    The team playbook
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    Turn the internal wiki into a course new hires finish in their first
                    week, with one question per module.
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="label-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    Creator · Sample scenario
                  </p>
                  <p className="label-mono text-[9px] text-muted-foreground">
                    5 modules · 22 min
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="band-ink">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="max-w-[22ch] text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] tracking-[-0.03em] text-paper">
            Every course has an end.
          </h2>

          <div className="mt-10 grid gap-6 border-t border-paper/15 pt-8 sm:grid-cols-3 sm:gap-10">
            {pledges.map((pledge) => (
              <div key={pledge.title}>
                <h3 className="font-display text-[16px] font-bold tracking-[-0.02em] text-paper">
                  {pledge.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-paper/70">
                  {pledge.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 border-t border-rule">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-16">
            <div>
              <h2 className="max-w-[13ch] text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.03em] text-foreground">
                Free while we are in beta.
              </h2>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink-2">
                Browsing, enrolling, and learning are free. Create an account when you
                want progress, XP, saved courses, and ratings.
              </p>

              <ul className="mt-8 grid gap-x-8 sm:grid-cols-2">
                {included.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 border-t border-rule py-3 text-[13.5px] leading-relaxed text-ink-2"
                  >
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft">
                      <Check className="h-2.5 w-2.5 text-accent-deep" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[12px] text-muted-foreground">
                Pricing is simple: no card is collected during beta.
              </p>
            </div>

            <aside className="dose-label flex flex-col p-6">
              <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-3 label-mono text-[9px] text-muted-foreground">
                <span>Beta access</span>
                <span>All learners</span>
              </div>
              <p className="mt-6 font-display text-[64px] font-bold leading-none tracking-[-0.04em] text-foreground">
                Free
              </p>
              <p className="mt-2 text-[12px] text-ink-2">during beta</p>

              <ul className="mt-6 space-y-2 border-t border-rule pt-4 text-[12px] text-ink-2">
                {[
                  "No card required",
                  "All 100+ courses",
                  "Create and publish",
                  "Progress, XP, and saves",
                ].map((item) => (
                  <li key={item} className="flex items-center justify-between gap-3">
                    <span>{item}</span>
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent-deep" aria-hidden />
                  </li>
                ))}
              </ul>

              <Link href="/sign-up" className="btn btn-primary mt-7 w-full">
                Start free
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-28 border-t border-rule bg-paper-2/50">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-16">
            <div>
              <h2 className="max-w-[10ch] text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.03em] text-foreground">
                Questions, answered plainly.
              </h2>
              <p className="mt-4 max-w-[32ch] text-[14px] leading-relaxed text-ink-2">
                Short answers about accounts, progress, and what happens to what you make.
              </p>
              <Link
                href="/faq"
                className="mt-5 inline-block text-[14px] font-medium text-accent-deep underline decoration-accent-deep/40 underline-offset-[6px] transition-colors hover:decoration-accent-deep"
              >
                Read all questions
              </Link>
            </div>

            <div className="border-t border-rule">
              {faqs.map((faq) => (
                <details key={faq.q} className="group border-b border-rule">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span
                      aria-hidden
                      className="label-mono text-[14px] text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="max-w-[62ch] pb-5 pr-8 text-[13.5px] leading-relaxed text-ink-2">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h2 className="max-w-[14ch] text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.0] tracking-[-0.04em] text-foreground">
                Your next course is one link away.
              </h2>
              <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-ink-2">
                An annual report, a client brief, a policy, an article, or your own notes.
                Bring one and leave with a course.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/sign-up" className="btn btn-primary btn-lg">
                  Start free
                </Link>
                <Link
                  href="/course"
                  className="text-[15px] font-medium text-accent-deep underline decoration-accent-deep/40 underline-offset-[6px] transition-colors hover:decoration-accent-deep"
                >
                  Browse the catalogue
                </Link>
              </div>
            </div>

            <div className="border-t border-rule pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="label-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                Accepted sources
              </p>
              <ul className="mt-3 text-[13px] text-ink-2">
                {sources.map((source) => (
                  <li key={source} className="border-b border-rule/70 py-2 last:border-b-0">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
