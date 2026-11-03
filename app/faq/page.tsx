import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about MiniGuide AI: AI-powered mini courses from docs, blogs, and documents.",
};

const faqs = [
  {
    q: "What is MiniGuide AI?",
    a: "MiniGuide AI is an AI-powered learning platform. Paste a link to any documentation, blog post, or article, or upload your own documents, and AI converts them into short, easy-to-learn concepts organized as courses.",
  },
  {
    q: "How do I create a course?",
    a: "Sign in and click Create Course in the navbar. Provide a source such as a URL to documentation or a blog, or upload a document, and AI drafts modules, lessons, and practice questions for you. You can review and edit everything before publishing.",
  },
  {
    q: "Is MiniGuide AI free?",
    a: "Yes. Browsing, enrolling, and learning are completely free while we're in beta.",
  },
  {
    q: "Do I need an account to learn?",
    a: "You can browse all courses without an account. To enroll, track your progress, earn XP, save courses for later, or rate them, you'll need to sign in.",
  },
  {
    q: "How is my progress tracked?",
    a: "Every time you complete a module, your progress updates on your profile. The My Learning section shows a progress bar per course, plus stats for modules completed and total XP earned.",
  },
  {
    q: "Can I save courses for later?",
    a: "Yes. Click the bookmark icon on any course card or course page. Saved courses appear in your profile so you always have a 'next up' queue ready.",
  },
  {
    q: "Can I rate and review courses?",
    a: "Absolutely. On any course detail page you can leave a star rating and written review. Honest ratings help other learners find the best content.",
  },
  {
    q: "Can I edit or remove a course I created?",
    a: "Yes. Your profile's My Created Courses section lists everything you've published with View and Edit options for each one.",
  },
  {
    q: "Who owns the content generated from my documents?",
    a: "Courses you generate from your own materials belong to you. You control whether they're published publicly or kept private.",
  },
];

export default function FaqPage() {
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
                Questions, answered plainly.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">
                Quick answers about creating and learning on MiniGuide AI.
              </p>
            </div>

            <div className="lg:col-span-4 lg:justify-self-end">
              <div className="dose-label w-full max-w-[280px] p-5 pb-12">
                <div className="flex items-baseline justify-between border-b border-rule pb-3 text-[11px] text-muted-foreground">
                  <span>FAQ</span>
                  <span>{faqs.length} answers</span>
                </div>
                <p className="mt-4 font-display text-[20px] leading-tight font-bold tracking-[-0.03em]">
                  Creating, learning, and owning what you make.
                </p>
                <span className="dose-stamp absolute bottom-4 left-5 text-[11px]">Plain words</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ list */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <div className="dose-label p-5">
              <p className="text-[11px] text-muted-foreground">Reference</p>
              <p className="mt-3 font-display text-[20px] font-bold leading-tight tracking-[-0.03em]">
                The short version is in these answers.
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-ink-2">
                Still stuck? Send a note and a person will reply.
              </p>
              <Link href="/contact" className="mt-4 inline-block text-[12px] text-accent-deep underline underline-offset-4">
                Contact the team
              </Link>
            </div>
          </aside>

          <div className="space-y-2.5 lg:col-span-8">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-[10px] border border-rule bg-card transition-shadow open:shadow-[var(--shadow-card)]"
              >
                <summary className="flex cursor-pointer select-none items-center justify-between gap-4 p-5 text-[15px] font-medium tracking-[-0.01em] text-foreground [&::-webkit-details-marker]:hidden group-open:text-accent-deep">
                  {faq.q}
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="border-t border-rule bg-paper-2 px-5 py-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 rounded-[14px] border border-rule bg-paper-2 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl text-foreground">Didn&apos;t find your answer?</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Our team is happy to help with anything else.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Contact us
              </Link>
              <Link href="/support" className="btn btn-outline">
                Visit support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
