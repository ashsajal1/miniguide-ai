import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarCheck,
  Gauge,
  Lightbulb,
  PenLine,
  Repeat,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Use MiniGuide AI Wisely",
  description:
    "Practical tips to learn smarter on MiniGuide AI: build habits, use progress tracking, and get the most from every mini course.",
};

const tips = [
  {
    icon: Target,
    title: "Start with a clear goal",
    body: "Before browsing, decide what you actually want to learn this month. Then filter by that topic and difficulty instead of enrolling in whatever looks shiny. One focused course finished beats five abandoned ones.",
  },
  {
    icon: Gauge,
    title: "Match the course to your level",
    body: "Every card shows its difficulty badge: Beginner (green), Intermediate (amber), Advanced (blue). If you're new to a subject, start at Beginner even if it feels slow; gaps in fundamentals are the #1 reason people stall halfway.",
  },
  {
    icon: Bookmark,
    title: "Build a queue with Save for later",
    body: "See an interesting course but can't start it now? Hit the bookmark icon to save it. Your saved list lives on your profile, so you always have a ready-made 'next up' queue instead of re-searching every time.",
  },
  {
    icon: CalendarCheck,
    title: "Learn small, but daily",
    body: "Mini courses are designed for short sessions. Ten focused minutes a day beats a two-hour binge once a week. Consistency is what moves your progress bar. Tie it to an existing habit, like one module with your morning coffee.",
  },
  {
    icon: Repeat,
    title: "Don't skip the practice questions",
    body: "Quizzes feel optional; they're not. Testing yourself is one of the most effective ways to make knowledge stick. Get a question wrong? That's exactly what to review before moving on.",
  },
  {
    icon: TrendingUp,
    title: "Check My Learning weekly",
    body: "Your profile's My Learning section shows a live progress bar per course. Make it a weekly ritual: finish anything close to 100% first. Completed courses give you momentum (and full XP) rather than a graveyard of half-done modules.",
  },
  {
    icon: Star,
    title: "Rate what you finish",
    body: "Leaving an honest star rating takes ten seconds and sharpens the whole catalog. Good courses rise, weak ones become visible. It also forces you to reflect on what you just learned.",
  },
  {
    icon: PenLine,
    title: "Teach it to keep it",
    body: "The fastest way to lock in a skill is to explain it. Once you've completed a few courses, create a mini course yourself. Writing modules for others will expose exactly which parts you haven't truly mastered yet.",
  },
];

export default function BlogPostPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="window-light" aria-hidden>
          <span />
          <span />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 pt-10 pb-14 lg:pb-20">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to blog
          </Link>
          <div className="max-w-[760px]">
            <p className="text-xs font-medium text-accent-deep">Guide</p>
            <h1 className="mt-3 text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.02] text-foreground">
              How to use MiniGuide AI wisely
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-2">
              Eight practical habits to learn more in less time, using the features you already have.
            </p>
            <p className="mt-5 font-mono text-[11px] text-muted-foreground">Aug 24, 2026, 6 min read</p>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="mx-auto max-w-[1240px] px-5 sm:px-8 py-12 lg:py-16">
        <div className="max-w-[760px]">
          <p className="mb-10 text-[16px] leading-relaxed text-muted-foreground">
            MiniGuide AI gives you short courses, progress tracking, and quizzes, but tools only work if you use them well. Here are eight habits that will help you actually finish what you start and remember what you learn.
          </p>

          <ol className="divide-y divide-rule border-y border-rule">
            {tips.map((tip, index) => (
              <li key={tip.title} className="grid gap-3 py-6 sm:grid-cols-[52px_1fr] sm:gap-5">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h2 className="mb-1.5 flex items-center gap-2 text-[19px] leading-tight text-foreground">
                    <tip.icon className="h-4 w-4 text-accent-deep" aria-hidden />
                    {tip.title}
                  </h2>
                  <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                    {tip.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* CTA */}
          <div className="mt-12 rounded-[14px] border border-rule bg-paper-2 p-7 sm:p-8">
            <h2 className="mb-2 text-xl text-foreground">Put it into practice</h2>
            <p className="mb-5 max-w-[44ch] text-sm text-muted-foreground">
              Pick one course, set a daily slot, and watch your progress bar move.
            </p>
            <Link href="/course" className="btn btn-primary gap-2">
              Explore courses
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
