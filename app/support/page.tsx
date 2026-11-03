import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Mail, PenLine, UserRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with MiniGuide AI. Browse common topics or contact our support team.",
};

const helpTopics = [
  {
    icon: Compass,
    title: "Getting started",
    description:
      "Create an account, browse the catalog, and enroll in your first mini course.",
    href: "/course",
    linkLabel: "Browse courses",
  },
  {
    icon: PenLine,
    title: "Course creation",
    description:
      "Publish your own bite-sized courses with modules, lessons, and quizzes.",
    href: "/course/create",
    linkLabel: "Create a course",
  },
  {
    icon: UserRound,
    title: "Account & billing",
    description:
      "MiniGuide AI is free to use. Manage your profile, progress, and saved courses.",
    href: "/profile",
    linkLabel: "Go to profile",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="window-light" aria-hidden>
          <span />
          <span />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="max-w-[16ch] text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1.02] text-foreground">
                Three doors, one person.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">
                Getting started, course creation, and account questions: pick a door below, or send a note.
              </p>
            </div>

            <div className="lg:col-span-4 lg:justify-self-end">
              <div className="dose-label w-full max-w-[280px] p-5 pb-12">
                <div className="border-b border-rule pb-3 text-[11px] text-muted-foreground">
                  Support desk
                </div>
                <p className="mt-4 font-display text-[22px] leading-tight font-bold tracking-[-0.03em]">
                  Replies within one business day.
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-ink-2">
                  A person reads every note.
                </p>
                <span className="dose-stamp absolute bottom-4 left-5 text-[11px]">No bot</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {helpTopics.map((topic) => (
            <div
              key={topic.title}
              className="flex flex-col rounded-[14px] border border-rule bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <div className="mb-1.5 flex items-center gap-2.5">
                <topic.icon className="h-5 w-5 shrink-0 text-accent-deep" aria-hidden />
                <h2 className="text-[18px] text-foreground">{topic.title}</h2>
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {topic.description}
              </p>
              <Link
                href={topic.href}
                className="w-fit text-sm font-medium text-accent-deep underline-offset-4 hover:underline"
              >
                {topic.linkLabel}
              </Link>
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div className="mt-8">
          <div className="plastic plastic--thu flex flex-col items-start justify-between gap-6 rounded-[14px] p-7 sm:p-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-[clamp(1.6rem,2.6vw,2.2rem)] text-ink">Send us the details.</h2>
              <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink/75">
                Tell us what broke, or what you&apos;re trying to build.
              </p>
            </div>
            <Link href="/contact" className="btn btn-primary shrink-0">
              <Mail className="h-4 w-4" aria-hidden />
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
