import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Eye,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Quality content",
      description:
        "Handpicked courses from industry experts to ensure a top-notch learning experience.",
    },
    {
      icon: Users,
      title: "Community driven",
      description:
        "Join a growing community of learners and instructors passionate about sharing knowledge.",
    },
    {
      icon: Award,
      title: "Skill certification",
      description:
        "Earn certificates upon course completion to showcase your new skills.",
    },
    {
      icon: Lightbulb,
      title: "Practical learning",
      description:
        "Learn by doing with hands-on projects and real-world applications.",
    },
  ];

  const stats = [
    { value: "1000+", label: "Active Students" },
    { value: "50+", label: "Expert Instructors" },
    { value: "100+", label: "Courses Available" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  const whyChooseUs = [
    "Flexible learning schedule",
    "Beginner to advanced levels",
    "Lifetime access to course materials",
    "Interactive learning experience",
    "Regular content updates",
    "Mobile-friendly platform",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="window-light" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 pt-16 pb-14 lg:pt-20 lg:pb-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <h1 className="max-w-[15ch] text-[clamp(2.6rem,5vw,4.2rem)] leading-[1.02] text-foreground">
                A shorter path to something new.
              </h1>
              <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-ink-2">
                MiniGuide AI turns long sources into short courses you can finish.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/course" className="btn btn-primary btn-lg">
                  Explore courses
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden />
                </Link>
                <Link href="/contact" className="btn btn-outline btn-lg">
                  Contact us
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pl-6">
              <div className="dose-label max-w-[360px] p-5 pb-12">
                <div className="flex items-baseline justify-between border-b border-rule pb-3 text-[11px] text-muted-foreground">
                  <span>About MiniGuide AI</span>
                  <span>Est. 2026</span>
                </div>
                <p className="mt-4 font-display text-[22px] leading-tight font-bold tracking-[-0.03em]">
                  Long source in. Short course out. Progress kept.
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-ink-2">
                  Built for the half hour between other things.
                </p>
                <span className="dose-stamp absolute bottom-4 left-5 text-[11px]">
                  Made to finish
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features: a numbered ledger, not a tile wall */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="max-w-[14ch] text-[clamp(1.9rem,3.4vw,2.8rem)] text-foreground">
              What we offer
            </h2>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
              Committed to a good learning experience, with technology and instructors that stay out of the way.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="divide-y divide-rule border-y border-rule">
              {features.map((feature, index) => (
                <div key={feature.title} className="grid gap-3 py-6 sm:grid-cols-[52px_1fr_1.35fr] sm:items-baseline sm:gap-6">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="flex items-center gap-2 text-[19px] leading-tight text-foreground">
                    <feature.icon className="h-4 w-4 text-accent-deep" aria-hidden />
                    {feature.title}
                  </h3>
                  <p className="max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats on the ink band */}
      <section className="band-ink">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-14 lg:py-16">
          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-none font-bold tracking-[-0.03em] text-paper">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-xs text-paper/65">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Why learn with us */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="max-w-[15ch] text-[clamp(1.9rem,3.4vw,2.8rem)] text-foreground">
              Why learn with us?
            </h2>
            <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
              Whether you are starting a new career or upgrading a skill, the platform is built to help you reach the goal with ease.
            </p>
            <Link href="/course" className="btn btn-primary mt-7">
              Start learning today
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-2 sm:grid-cols-2">
              {whyChooseUs.map((item, index) => (
                <li
                  key={item}
                  className={`flex items-start gap-3 rounded-[10px] border border-rule px-4 py-3.5 ${
                    index % 3 === 0 ? "bg-accent-soft/60" : "bg-card"
                  }`}
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="text-sm text-ink-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mission and vision as labels */}
      <section className="border-t border-rule bg-paper-2/60">
        <div className="mx-auto grid max-w-[1240px] gap-4 px-5 py-14 sm:px-8 md:grid-cols-2 lg:py-20">
          <div className="rounded-[14px] border border-rule bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-accent-soft text-accent-deep">
                <Target className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-xl text-foreground">Our mission</h2>
            </div>
            <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
              To democratize education by making high-quality learning resources accessible to people from all walks of life, regardless of their location or financial status.
            </p>
          </div>
          <div className="plastic plastic--thu p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-card/70 text-ink">
                <Eye className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-xl text-ink">Our vision</h2>
            </div>
            <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-ink/75">
              A world where anyone, anywhere can transform their life through accessible education and skill development, creating opportunities for personal and professional growth.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 lg:py-24">
        <div className="relative overflow-hidden rounded-[14px] border border-rule bg-card px-6 py-14 text-center sm:px-10">
          <div className="window-light" aria-hidden>
            <span />
            <span />
          </div>
          <div className="relative">
            <h2 className="mx-auto max-w-[18ch] text-[clamp(1.9rem,3.6vw,3rem)] text-foreground">
              Ready to start learning?
            </h2>
            <p className="mx-auto mt-4 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
              Join the students already advancing their careers with our courses.
            </p>
            <Link href="/course" className="btn btn-primary btn-lg mt-7">
              Browse all courses
              <ArrowRight className="h-4.5 w-4.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
