"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

function withoutNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest;
}

// Inline-only markdown: question prompts, answers and written briefs live
// inside headings, labels and paragraphs, so block elements would break the
// surrounding markup. Everything not listed here is unwrapped to its text.
const components: Components = {
  p: ({ children }) => <>{children}</>,
  strong: (props) => (
    <strong className="font-semibold text-ink" {...withoutNode(props)} />
  ),
  em: (props) => <em {...withoutNode(props)} />,
  del: (props) => <del {...withoutNode(props)} />,
  code: (props) => (
    <code
      className="rounded-[5px] bg-paper-3 px-1 py-px font-mono text-[0.9em] text-ink"
      {...withoutNode(props)}
    />
  ),
  a: (props) => (
    <a
      className="text-accent-deep underline decoration-accent-soft underline-offset-2 transition-colors hover:decoration-accent-deep"
      target="_blank"
      rel="noopener noreferrer"
      {...withoutNode(props)}
    />
  ),
};

export default function InlineMarkdown({ children }: { children: string }) {
  if (!children) return null;

  return (
    <ReactMarkdown
      allowedElements={["p", "strong", "em", "del", "code", "a", "br"]}
      unwrapDisallowed
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
