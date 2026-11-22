import Link from "next/link";
import {
  ArrowRight,
  Link as LinkIcon,
  Sparkles,
  Pencil,
  CheckCircle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Course",
};

export default async function CreateCoursePage() {
  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-[1080px] px-5 py-12 sm:px-8">
        {/* Header */}
        <div className="mb-12 max-w-[540px]">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-ink">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Course builder
          </p>
          <h1 className="mt-4 text-[clamp(2.2rem,4.4vw,3.4rem)] text-foreground">
            Create a guide.
          </h1>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
            Bring a document and let AI draft a guide shaped by your profile
            context, or build one yourself. You can edit everything either way.
          </p>
        </div>

        {/* Choices */}
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {/* Manual */}
          <Link href="/course/create/manual" className="group block">
            <div className="flex h-full flex-col rounded-[14px] border border-rule bg-card p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-[10px] bg-paper-2 text-ink">
                  <Pencil className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h2 className="text-xl text-foreground">Manual creation</h2>
                  <p className="text-sm text-muted-foreground">Full control</p>
                </div>
              </div>

              <p className="mb-7 text-sm leading-relaxed text-muted-foreground">
                Start from scratch and build every detail yourself. Define modules, write short slide cards, craft questions, and add written practice exactly how you want them.
              </p>

              <ul className="mb-8 space-y-2.5">
                {[
                  "Custom module structure",
                  "Hand-crafted slide cards and content",
                  "Custom quiz questions",
                  "Written practice with AI feedback",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-ink-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <span className="btn btn-outline w-full">
                  Create manually
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </div>
          </Link>

          {/* URL */}
          <Link href="/course/create/url" className="group block">
            <div className="plastic plastic--thu flex h-full flex-col rounded-[14px] p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-[10px] bg-card/70 text-ink">
                  <LinkIcon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl text-ink">Generate from a document</h2>
                    <span className="rounded-full bg-card/70 px-2 py-0.5 text-[10px] font-medium text-ink">
                      AI
                    </span>
                  </div>
                  <p className="text-sm text-ink/65">AI-powered</p>
                </div>
              </div>

              <p className="mb-7 text-sm leading-relaxed text-ink/75">
                Paste a link or the text of any document and let AI generate a
                complete guide shaped by your profile context: modules, cards,
                questions, and a written task.
              </p>

              <ul className="mb-8 space-y-2.5">
                {[
                  "Web articles, Google Docs, PDFs (paste text)",
                  "Personalised examples and depth",
                  "AI-generated cards and questions",
                  "Fully editable after generation",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-ink/80">
                    <CheckCircle className="h-4 w-4 shrink-0 text-accent-deep" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <span className="btn btn-primary w-full">
                  Generate from a document
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer hint */}
        <p className="mt-10 max-w-[52ch] text-sm text-muted-foreground">
          Not sure? Try the AI option for a quick start. You can always edit everything afterward.
        </p>
      </div>
    </div>
  );
}
