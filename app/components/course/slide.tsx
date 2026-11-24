"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useSyncExternalStore,
  useState,
} from "react";
import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import "highlight.js/styles/github-dark.css";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { InferSelectModel } from "drizzle-orm";
import type { slide as slideTable } from "@/db/schema";
import { BookOpen, Check, Copy, Edit } from "lucide-react";
import Link from "next/link";

type SlideType = InferSelectModel<typeof slideTable>;

interface CodeProps extends HTMLAttributes<HTMLElement> {
  node?: unknown;
  className?: string;
  children?: ReactNode;
}

function withoutNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest;
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const subscribeToNothing = () => () => {};
const readClipboardSupport = () => Boolean(navigator.clipboard);
const readServerClipboardSupport = () => false;

// Code reads as a printed listing: a caption carries the language and a copy
// control, and the listing itself breaks the prose measure to use the card.
function CodeFigure({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const canCopy = useSyncExternalStore(
    subscribeToNothing,
    readClipboardSupport,
    readServerClipboardSupport
  );

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const codeChild = Children.toArray(children).find(
    (child): child is ReactElement<{ className?: string }> =>
      isValidElement(child) &&
      typeof (child.props as { className?: unknown }).className === "string"
  );
  const language = /language-([\w#+.-]+)/.exec(
    codeChild?.props.className ?? ""
  )?.[1];
  const source = textOf(children).replace(/\n$/, "");

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <figure className="band-ink group my-6 overflow-hidden rounded-[10px]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-paper/15 px-4 py-2">
        <span className="dose text-[10px] uppercase tracking-[0.14em] text-paper/55">
          {language ? language.toUpperCase() : "Code"}
        </span>
        {canCopy && (
          <button
            type="button"
            onClick={copyCode}
            aria-label={copied ? "Code copied" : "Copy code"}
            className="inline-flex items-center gap-1.5 rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper"
          >
            {copied ? (
              <Check className="h-3 w-3" aria-hidden />
            ) : (
              <Copy className="h-3 w-3" aria-hidden />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </figcaption>
      <pre className="group overflow-x-auto p-4 text-[0.86rem] leading-relaxed">
        {children}
      </pre>
    </figure>
  );
}

export default function Slide({
  slide,
  isCreator,
  courseId,
}: {
  slide: SlideType;
  isCreator?: boolean;
  courseId?: string;
}) {
  const components: Components = {
    h1: (props) => (
      <h2
        className="mt-8 mb-3 font-display text-[1.65rem] leading-tight tracking-[-0.02em] text-ink"
        {...withoutNode(props)}
      />
    ),
    h2: (props) => (
      <h3
        className="mt-7 mb-2.5 font-display text-[1.35rem] leading-tight tracking-[-0.02em] text-ink"
        {...withoutNode(props)}
      />
    ),
    h3: (props) => (
      <h4
        className="mt-6 mb-2 font-display text-[1.15rem] leading-snug text-ink"
        {...withoutNode(props)}
      />
    ),
    h4: (props) => (
      <h5
        className="mt-5 mb-2 text-base font-semibold text-ink"
        {...withoutNode(props)}
      />
    ),
    p: (props) => (
      <p className="my-4 leading-[1.75]" {...withoutNode(props)} />
    ),
    a: (props) => (
      <a
        className="text-accent-deep underline decoration-accent-soft underline-offset-4 transition-colors hover:decoration-accent-deep"
        target="_blank"
        rel="noopener noreferrer"
        {...withoutNode(props)}
      />
    ),
    pre: ({ children }) => <CodeFigure>{children}</CodeFigure>,
    code: (props: CodeProps) => {
      const { className } = props;
      return (
        <code
          {...withoutNode(props)}
          className={`rounded-[6px] bg-paper-2 px-1.5 py-0.5 font-mono text-[0.88em] text-ink in-[.group]:bg-transparent in-[.group]:p-0 in-[.group]:text-inherit ${
            className || ""
          }`}
        />
      );
    },
    ul: (props) => (
      <ul
        className="my-4 list-disc space-y-1.5 pl-6 marker:text-muted-foreground"
        {...withoutNode(props)}
      />
    ),
    ol: (props) => (
      <ol
        className="my-4 list-decimal space-y-1.5 pl-6 marker:text-muted-foreground"
        {...withoutNode(props)}
      />
    ),
    li: (props) => (
      <li className="pl-1 leading-[1.7]" {...withoutNode(props)} />
    ),
    blockquote: (props) => (
      <blockquote
        className="my-6 rounded-[10px] border border-rule bg-paper-2 px-5 py-4 text-[1.02em] leading-relaxed text-ink-2 [&>p]:my-0 [&>p+p]:mt-3"
        {...withoutNode(props)}
      />
    ),
    hr: (props) => (
      <hr className="my-8 border-t border-rule" {...withoutNode(props)} />
    ),
    strong: (props) => (
      <strong className="font-semibold text-ink" {...withoutNode(props)} />
    ),
    table: (props) => (
      <div className="my-6 overflow-x-auto">
        <table
          className="w-full border-collapse text-left text-sm"
          {...withoutNode(props)}
        />
      </div>
    ),
    th: (props) => (
      <th
        className="border-b border-rule px-3 py-2 font-semibold text-ink"
        {...withoutNode(props)}
      />
    ),
    td: (props) => (
      <td
        className="border-b border-rule px-3 py-2 align-top text-ink-2"
        {...withoutNode(props)}
      />
    ),
    img: ({ alt, ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt ?? ""}
        className="my-6 h-auto w-full rounded-[10px] border border-rule"
        {...withoutNode(props)}
      />
    ),
    input: (props) => (
      <input
        className="mr-2 h-4 w-4 accent-accent"
        {...withoutNode(props)}
      />
    ),
  };

  const title = slide?.title?.trim() ?? "";
  const content = slide?.content?.trim() ?? "";
  const minutes = content ? readingMinutes(content) : 0;
  const references = (slide?.references ?? []).filter(
    (reference) => reference && reference.trim()
  );

  return (
    <article>
      {(title || (isCreator && courseId && slide)) && (
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h1 className="font-display text-[clamp(1.9rem,3vw,2.5rem)] leading-[1.06] tracking-[-0.03em] text-ink">
                {title}
              </h1>
            )}
            {minutes > 0 && (
              <p className="dose mt-3 text-[10px] text-muted-foreground">
                {minutes} min read
              </p>
            )}
          </div>
          {isCreator && courseId && (
            <Link
              href={`/course/edit/${courseId}/slide/${slide.id}`}
              className="btn btn-ghost btn-sm h-9 shrink-0 gap-1.5 px-2 text-muted-foreground"
            >
              <Edit size={14} aria-hidden />
              Edit slide
            </Link>
          )}
        </header>
      )}

      <div className="slide-prose text-[1.0625rem] leading-[1.75] text-ink-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={components}
        >
          {slide?.content || ""}
        </ReactMarkdown>
      </div>

      {references.length > 0 && (
        <section
          className="mt-10 max-w-[72ch] border-t border-rule pt-6"
          aria-labelledby="slide-references"
        >
          <h2
            id="slide-references"
            className="flex items-center gap-2 font-display text-[1.0625rem] text-ink"
          >
            <BookOpen className="h-4 w-4 text-accent-deep" aria-hidden />
            References and resources
          </h2>
          <ol className="mt-2 divide-y divide-rule">
            {references.map((reference, index) => (
              <li
                key={index}
                className="grid grid-cols-[2rem_1fr] gap-3 py-3.5 sm:grid-cols-[2.5rem_1fr]"
              >
                <span
                  aria-hidden
                  className="dose pt-[3px] text-[10px] text-muted-foreground"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 text-[0.9375rem] leading-relaxed text-ink-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      ...components,
                      p: (props) => (
                        <p className="m-0" {...withoutNode(props)} />
                      ),
                    }}
                  >
                    {reference}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
