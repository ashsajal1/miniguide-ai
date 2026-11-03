import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, tips, and updates from the MiniGuide AI team to help you learn smarter.",
};

const posts = [
  {
    slug: "how-to-use-minicourse",
    tag: "Guide",
    icon: Lightbulb,
    title: "How to use MiniGuide AI wisely",
    excerpt:
      "Eight practical habits to learn more in less time, from picking the right difficulty to building a daily learning routine with the features you already have.",
    readTime: "6 min read",
    date: "Aug 24, 2026",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="window-light" aria-hidden>
          <span />
          <span />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-14 lg:py-20">
          <h1 className="max-w-[16ch] text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1.02] text-foreground">
            Notes on learning in short sessions.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">
            Guides and tips for getting more from every short session.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-12 lg:py-16">
        <div className="max-w-[760px] space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-[14px] border border-rule bg-card p-6 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:p-8"
            >
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 font-medium text-ink">
                  <post.icon className="h-3 w-3" aria-hidden />
                  {post.tag}
                </span>
                <span className="font-mono text-[11px]">{post.date}</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="h-3 w-3" aria-hidden />
                  {post.readTime}
                </span>
              </div>
              <h2 className="mb-2 text-[clamp(1.5rem,2.4vw,1.9rem)] text-foreground transition-colors group-hover:text-accent-deep">
                {post.title}
              </h2>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-deep">
                Read the article
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
