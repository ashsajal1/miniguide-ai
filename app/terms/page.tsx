import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for MiniGuide AI: how you may use our platform.",
};

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Our Service",
    body: [
      "MiniGuide AI provides online courses and learning resources through this platform.",
      "You may access the service for personal, non-commercial use.",
    ],
  },
  {
    title: "2. Accounts",
    body: [
      "You must create an account to enroll in or create courses. You are responsible for the account you create.",
      "Accounts may only be used by one person. Sharing accounts is not permitted.",
    ],
  },
  {
    title: "3. What You May Use",
    body: [
      "You may view courses, enroll, track your progress, and use the learning tools provided by the platform.",
      "You may not copy, modify, redistribute, or resell course content you do not own.",
    ],
  },
  {
    title: "4. Prohibited Activities",
    body: [
      "You must not use the service for illegal activities, spam, or to interfere with the service for other users.",
      "We reserve the right to remove content or terminate accounts that violate these terms.",
    ],
  },
  {
    title: "5. Changes to These Terms",
    body: [
      "We may update these terms at any time. Continued use of the service after an update means you accept the revised terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="window-light" aria-hidden>
          <span />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-14 lg:py-20">
          <p className="text-[11px] text-accent-deep">Legal</p>
          <h1 className="mt-3 max-w-[14ch] text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1.02] text-foreground">
            Terms of Service
          </h1>
          <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-ink-2">
            The rules for using MiniGuide AI and our services.
          </p>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Last updated: November 24, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="dose-label p-5">
              <p className="text-[11px] text-muted-foreground">In short</p>
              <p className="mt-3 text-[12px] leading-relaxed text-ink-2">
                You may use the platform for personal, non-commercial learning. Your account is for one person, and you must not use the service for anything illegal or to harm other users.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-rule pt-4">
                <span className="dose-stamp text-[10px]">Questions?</span>
                <Link href="/contact" className="text-[11px] text-accent-deep underline underline-offset-4">
                  Ask us
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-[720px] space-y-9 lg:col-span-8">
            <p className="text-muted-foreground leading-relaxed">
              These terms apply to your use of MiniGuide AI. By using the service, you agree to the terms below.
            </p>

            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 text-xl text-foreground">{section.title}</h2>
                <ul className="space-y-2.5">
                  {section.body.map((paragraph, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="rounded-[14px] border border-rule bg-paper-2 p-6 sm:p-7">
              <h2 className="mb-2 text-lg text-foreground">Questions about these terms?</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Get in touch and we&apos;ll be happy to help.
              </p>
              <Link href="/contact" className="btn btn-primary btn-sm">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
