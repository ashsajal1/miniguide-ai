import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how MiniGuide AI collects, uses, and protects your personal information.",
};

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Information We Collect",
    body: [
      "Account information: when you sign up we collect your name, email address, and profile image through our authentication provider (Clerk).",
      "Learning activity: your enrollments, course progress, completed modules, quiz attempts, saved courses, and ratings.",
      "Content you create: if you author courses, we store the course content, thumbnails, and modules you publish.",
      "Technical data: basic usage information such as browser type and pages visited, used to keep the platform running smoothly.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To provide the service: track your progress, show your enrolled and saved courses, and personalize your learning experience.",
      "To communicate with you about your account or important updates to the platform.",
      "To improve MiniGuide AI by understanding which courses and features are most useful.",
    ],
  },
  {
    title: "3. Third-Party Services",
    body: [
      "Authentication is handled by Clerk. When you sign in, Clerk processes your credentials and profile data according to its own privacy policy.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    title: "4. Cookies",
    body: [
      "We use essential cookies and similar technologies to keep you signed in and remember your preferences such as theme selection. We do not use advertising or tracking cookies.",
    ],
  },
  {
    title: "5. Data Retention & Deletion",
    body: [
      "We retain your account and learning data for as long as your account is active.",
      "You may request deletion of your account and associated personal data at any time by contacting us. Course content you have published may be retained in anonymized form where required.",
    ],
  },
  {
    title: "6. Your Rights",
    body: [
      "You may have the right to access, correct, export, or delete the personal data we hold about you.",
      "To exercise any of these rights, reach out through our contact page.",
    ],
  },
  {
    title: "7. Children's Privacy",
    body: [
      "MiniGuide AI is not directed at children under 13, and we do not knowingly collect personal information from children under 13.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this policy from time to time. Material changes will be announced on the platform. Continued use of MiniGuide AI after an update means you accept the revised policy.",
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy policy
          </h1>
          <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-ink-2">
            How we collect, use, and protect your information.
          </p>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Last updated: August 24, 2026
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
                Your personal information is used to run the service. Authentication is handled by Clerk. We do not sell your data.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-rule pt-4">
                <span className="dose-stamp text-[10px]">Readable</span>
                <Link href="/contact" className="text-[11px] text-accent-deep underline underline-offset-4">
                  Ask us
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-[720px] space-y-9 lg:col-span-8">
            <p className="text-muted-foreground leading-relaxed">
              Your privacy matters to us. This policy explains what information
              MiniGuide AI collects when you use our platform, why we collect it,
              and the choices you have.
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
              <h2 className="mb-2 text-lg text-foreground">Questions about this policy?</h2>
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
