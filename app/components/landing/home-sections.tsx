import { Check, HelpCircle, MessageSquareQuote, ShieldCheck, Sparkles, Users } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    title: "Fill in your context",
    body: "Tell MiniGuide who you are and what you already know. Keeps guides truly yours.",
  },
  {
    icon: Sparkles,
    title: "Bring any document",
    body: "Paste a link or copy the text out of a PDF, Word file, or notes and paste it here.",
  },
  {
    icon: Sparkles,
    title: "Read a guide built for you",
    body: "Your profile context shapes the examples and depth. It is never quoted back.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Guides stay private",
    body: "Only you see what you make. Nothing is built for anyone else's account.",
  },
  {
    icon: ShieldCheck,
    title: "Guided to the source",
    body: "AI reads your document and the guide still matches it. Personalisation never invents facts.",
  },
  {
    icon: HelpCircle,
    title: "Tailored depth",
    body: "Your background and prior knowledge shape the analogies and the difficulty of each guide.",
  },
  {
    icon: HelpCircle,
    title: "Paste, not upload",
    body: "No install. Copy text from a PDF or a link — MiniGuide digests it and gives you the guide.",
  },
  {
    icon: Users,
    title: "Editable by you",
    body: "Every guide is a draft. Review, reorder, and remove what doesn't fit you.",
  },
  {
    icon: Users,
    title: "Practice is part of the work",
    body: "One question per module tests the material where you need to know it. Read it. Answer it. Done.",
  },
];

const testimonials = [
  {
    name: "Maya, Year 1student, Mechanical Engineering",
    body: "I'm getting nervous about thermodynamics. For once, every example landed for a first-year — confidence rebuilt.",
  },
  {
    name: "Viktor, Tutorial-used",
    body: "I never finish reading papers. This pulled the handful that mattered into something I could finish before the meeting.",
  },
  {
    name: "Priya, Prepping",
    body: "Usually I nod along in a document and forget it. This guide kept me honest about what I actually understood — by the end, I could explain it myself.",
  },
];

const trustLines = [
  "Your guides belong to you. They are never built for, or shown to, another account.",
  "Your context is optional: it tells the AI what fits you, and it never overrides the document.",
  "The AI only reads your document and your profile context; nothing else from your account changes the result.",
  "You read the draft. Review, edit, and delete anything. It is yours before and after.",
];

const faqs = [
  {
    q: "How does it use my background?",
    a: "You add your context in your profile — your year, field, what you already know, how you like examples. That goes into the AI prompt when your guide is being written, so the language, analogies, and depth fit you.",
  },
  {
    q: "I have a PDF. Can I upload it?",
    a: "Not an upload button, yet. Copy the text out of the PDF and paste it into the document box. That works for most documents, and you can paste parts of it too.",
  },
  {
    q: "Do I need an account?",
    a: "Yes to create a guide and see it. Signed-in users see their own guides in one list and each guide is private to them. You can sign up and come back anytime.",
  },
  {
    q: "Can you make my guides public?",
    a: "Not from the product today. Your guides stay yours by design.",
  },
  {
    q: "Is it free?",
    a: "Free for now. The AI use is yours — during beta there is no card and no trial countdown.",
  },
  {
    q: "What if the AI example doesn't fit me?",
    a: "Every guide is editable. Change the example, depth, or framing as you want.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t-2 border-ink bg-paper-2">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        <header className="max-w-[70ch]">
          <h2 className="text-[clamp(2rem,3.4vw,3rem)] font-display font-bold tracking-[-0.03em] text-foreground">
            From a document to a guide. Three steps.
          </h2>
          <p className="mt-3 max-w-[50ch] text-base leading-relaxed text-ink-2">
            No app installs, no exports. Paste a link or copy text, and
            MiniGuide gives you a short guide it built just for you.
          </p>
        </header>

        <div className="mx-auto mt-9 grid max-w-[1240px] gap-5 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-[14px] border border-rule bg-card p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent-deep">
                  <step.icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="font-display text-lg font-bold leading-tight text-foreground">
                  {step.title}
                </p>
              </div>
              <p className="mt-2.5 max-w-[40ch] text-[14px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-[1240px] gap-px border-y-2 border-ink bg-rule sm:grid-cols-2">
          <div className="bg-paper p-6">
            <p className="label-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              Reading it
            </p>
            <ul className="mt-4 space-y-3">
              {steps.slice(2).map((step) => (
                <li key={step.title} className="flex items-start gap-2.5 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
                  <span aria-hidden className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft">
                    <Check className="h-2.5 w-2.5 text-accent-deep" strokeWidth={3} />
                  </span>
                  {step.body}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-6">
            <p className="label-mono text-[9px] uppercase tracking-[0.14em] text-accent-deep">
              The result
            </p>
            <ul className="mt-4 space-y-3">
              {[
                "Short modules that finish in an afternoon",
                "Examples that feel like they were made for you",
                "Practice questions at the end of every module",
                "A draft you edit before it&apos;s yours",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 border-t border-rule pt-3 text-[13px] leading-relaxed text-ink">
                  <span aria-hidden className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft">
                    <Check className="h-2.5 w-2.5 text-accent-deep" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-rule bg-paper-2/50">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        <header className="max-w-[40ch]">
          <h2 className="text-[clamp(2rem,3.4vw,3rem)] font-display font-bold tracking-[-0.03em] text-foreground">
            What changes between people — and nothing for the document itself.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            The same document is useful to more than one reader.
          </p>
        </header>

        <div className="mt-8 grid gap-px border-y-2 border-ink bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="border-t border-rule bg-card p-6 sm:p-8">
              <p className="label-mono text-[9px] uppercase tracking-[0.14em] text-accent-deep">
                {feature.title}
              </p>
              <p className="mt-2.5 max-w-[40ch] text-[14px] leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="border-t border-rule bg-card">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        <header className="text-center">
          <p className="label-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
            Picks
          </p>
          <h2 className="mt-3 max-w-[20ch] text-[clamp(2rem,3.4vw,3rem)] font-display font-bold tracking-[-0.03em] text-foreground">
            Read what people say.
          </h2>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {testimonials.map((review) => (
            <blockquote key={review.name} className="rounded-[14px] border border-rule bg-paper-2 p-6 sm:p-8">
              <p className="text-[14px] leading-relaxed text-ink-2">
                {review.body}
              </p>
              <p className="mt-4 text-[12px] font-medium text-foreground">
                {review.name}
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="border-t border-rule bg-paper-2/50">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        <header className="flex max-w-[70ch] items-center gap-3 border-b border-rule pb-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-accent-deep" aria-hidden />
          <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-display font-bold tracking-[-0.03em] text-foreground">
            Private by design
          </h2>
        </header>
        <ul className="mt-8 space-y-3">
          {trustLines.map((line) => (
            <li key={line} className="flex gap-3 border-t border-rule pt-3 text-[14px] text-muted-foreground first:border-t-0">
              <span aria-hidden className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft">
                <Check className="h-2.5 w-2.5 text-accent-deep" strokeWidth={3} />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="border-t-2 border-ink">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
        <header className="max-w-[50ch]">
          <p className="label-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
            Questions
          </p>
          <h2 className="mt-3 max-w-[16ch] text-[clamp(2rem,3.4vw,3rem)] font-display font-bold tracking-[-0.03em] text-foreground">
            Questions, answered plainly.
          </h2>
        </header>

        <div className="mt-8 border-y border-rule sm:max-w-[860px]">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group border-b border-rule last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span
                  aria-hidden
                  className="label-mono text-[14px] text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                >
                  <MessageSquareQuote className="h-4 w-4" />
                </span>
              </summary>
              <p className="max-w-[62ch] pb-5 text-[13.5px] leading-relaxed text-ink-2">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
