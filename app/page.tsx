import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/prisma/client";
import {
  ArrowRight,
  BookOpen,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  HowItWorks,
  FeaturesSection,
  Testimonials,
  TrustSection,
  FAQSection,
} from "@/app/components/landing/home-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your personal mini-guides",
  description:
    "Turn any document into a short guide built around what you already know. Your guides stay private to you.",
};

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)]">
        <section className="relative overflow-hidden border-b border-rule">
          <div className="window-light" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="relative mx-auto max-w-[1080px] px-5 py-20 sm:px-8 lg:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-card px-3 py-1.5 label-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              Personal guides
            </span>
            <h1 className="mt-6 max-w-[20ch] text-[clamp(2.9rem,6vw,4.6rem)] leading-[0.94] tracking-[-0.04em] text-foreground">
              <span className="text-accent-deep">MiniGuide</span> turns any doc
              into a guide for you.
            </h1>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-ink-2">
              Paste a link or the text of a document. Your background, interests,
              and what you already know shape the examples and the depth. Each
              guide is private to you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/sign-up" className="btn btn-primary btn-lg">
                Create your first guide
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/sign-in" className="btn btn-outline btn-lg">
                Sign in
              </Link>
            </div>
            <ol className="mt-10 grid gap-4 border-t border-rule pt-6 sm:grid-cols-3">
              {[
                "Add your context once in your profile.",
                "Bring a document by link or paste its text.",
                "Read a short guide written for you.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3 text-[13.5px] leading-relaxed text-ink-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    0{index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <HowItWorks />
        <FeaturesSection />
        <Testimonials />
        <TrustSection />
        <FAQSection />
      </div>
    );
  }

  const [dbUser, guides] = await Promise.all([
    prisma.user.findUnique({
      where: { clerk_id: user.id },
      select: { profile_context: true },
    }),
    prisma.course.findMany({
      where: { creator: user.id, deleted_at: null },
      orderBy: { created_at: "desc" },
      take: 6,
      include: { _count: { select: { modules: true } } },
    }),
  ]);

  const hasContext = Boolean(dbUser?.profile_context?.trim());

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-[1080px] space-y-8 px-5 py-10 sm:px-8">
        <section className="rounded-[14px] border border-rule bg-card p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="label-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Your workspace
              </p>
              <h1 className="mt-2 text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight text-foreground">
                Welcome back{user.firstName ? `, ${user.firstName}` : ""}.
              </h1>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                Bring a document and get a short guide that meets you where you
                are.
              </p>
            </div>
            <Link href="/course/create" className="btn btn-primary shrink-0 gap-1.5">
              <Plus className="h-4 w-4" aria-hidden />
              New guide
            </Link>
          </div>
        </section>

        {!hasContext && (
          <section className="flex flex-col gap-3 rounded-[14px] border border-accent/30 bg-accent-soft/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent-deep" aria-hidden />
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  Add your context for better guides
                </h2>
                <p className="mt-1 max-w-[58ch] text-[13px] leading-relaxed text-ink-2">
                  Your year, field, what you already know, how you like examples.
                  It is optional and only used when relevant.
                </p>
              </div>
            </div>
            <Link href="/profile" className="btn btn-outline btn-sm shrink-0 gap-1.5">
              <UserRound className="h-4 w-4" aria-hidden />
              Add context
            </Link>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl text-foreground">Your guides</h2>
            {guides.length > 0 && (
              <Link
                href="/course"
                className="text-[13px] font-medium text-accent-deep hover:text-foreground"
              >
                View all
              </Link>
            )}
          </div>

          {guides.length === 0 ? (
            <div className="rounded-[14px] border border-rule bg-card px-6 py-14 text-center">
              <BookOpen className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" aria-hidden />
              <h3 className="text-lg text-foreground">No guides yet</h3>
              <p className="mx-auto mt-2 max-w-[42ch] text-sm text-muted-foreground">
                Start with a document you actually need to understand.
              </p>
              <Link href="/course/create" className="btn btn-primary btn-sm mt-5 gap-1.5">
                <Plus className="h-4 w-4" aria-hidden />
                Create a guide
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/course/${guide.id}`}
                  className="group flex flex-col overflow-hidden rounded-[14px] border border-rule bg-card transition-shadow hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex-1 p-5">
                    <h3 className="line-clamp-1 text-[16px] font-medium text-foreground">
                      {guide.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {guide.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="badge badge-outline">{guide.difficulty}</span>
                      <span className="badge border-0 bg-paper-2 text-ink-2">
                        {guide._count.modules} modules
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-rule px-5 py-3 text-[12px] font-medium text-accent-deep">
                    Open guide
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
