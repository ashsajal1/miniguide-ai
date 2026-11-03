"use client";

import { useRef, useState } from "react";
import { generateCourseOutline, CourseOutline } from "@/lib/course-ai-service";
import {
  AlertCircle,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

interface UrlCourseGeneratorProps {
  onOutlineGenerated: (outline: CourseOutline) => void;
}

function validateUrl(value: string) {
  if (!value) {
    return "Paste a link to the document you want to teach from.";
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
  } catch {
    return "That doesn't look like a web address. Links start with http:// or https://.";
  }
  return "";
}

export default function UrlCourseGenerator({
  onOutlineGenerated,
}: UrlCourseGeneratorProps) {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGenerating) return;

    const value = url.trim();
    const validationError = validateUrl(value);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const result = await generateCourseOutline(value);
      if (result.success && result.outline) {
        onOutlineGenerated(result.outline);
        return;
      }
      setError(
        result.error ||
          "We couldn't draft an outline from that page. Try a different link."
      );
    } catch {
      setError(
        "We couldn't reach that page. Check the link and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const describedBy = error
    ? "source-url-hint source-url-error"
    : "source-url-hint";

  return (
    <div className="space-y-3">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="rounded-[14px] border border-rule bg-card shadow-[var(--shadow-card)]"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="source-url"
              className="text-sm font-medium text-ink"
            >
              Document URL
            </label>
            <span className="dose-stamp text-[10px]" aria-hidden>
              AI draft
            </span>
          </div>
          <p
            id="source-url-hint"
            className="mt-1 text-xs text-muted-foreground"
          >
            Google Docs, Notion, GitHub, Medium, or any public page.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <LinkIcon
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                ref={inputRef}
                id="source-url"
                name="url"
                type="url"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                placeholder="https://docs.google.com/document/…"
                value={url}
                disabled={isGenerating}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                onChange={(event) => {
                  setUrl(event.target.value);
                  if (error) setError("");
                }}
                className={`input pl-10 pr-11 ${
                  error ? "border-error" : ""
                }`}
              />
              {url && !isGenerating && (
                <button
                  type="button"
                  aria-label="Clear the URL"
                  onClick={() => {
                    setUrl("");
                    setError("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[8px] text-muted-foreground transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-primary h-[3.25rem] shrink-0 gap-2 disabled:opacity-100"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              {isGenerating ? "Drafting outline…" : "Draft the outline"}
            </button>
          </div>

          <div>
            {isGenerating && (
              <p
                role="status"
                className="mt-4 flex items-start gap-2 rounded-[10px] bg-paper-2 px-3.5 py-3 text-sm leading-relaxed text-ink-2"
              >
                <Loader2
                  className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-accent"
                  aria-hidden
                />
                Reading the page and drafting an outline. This can take up to
                a minute.
              </p>
            )}
            {error && !isGenerating && (
              <p
                id="source-url-error"
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-[10px] border border-error/30 bg-error/5 px-3.5 py-3 text-sm leading-relaxed text-error"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden
                />
                {error}
              </p>
            )}
          </div>
        </div>
      </form>

      <p className="px-1 text-xs text-muted-foreground">
        The outline is a draft. You review and edit it before the course is
        built.
      </p>
    </div>
  );
}
