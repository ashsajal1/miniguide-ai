"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <aside
      aria-label="Announcement"
      className="band-ink relative border-b border-paper/10"
    >
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-10 py-2.5 text-center sm:px-8">
        <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-accent sm:block" aria-hidden />
        <p className="label-mono text-[9.5px] uppercase tracking-[0.12em] text-paper/75">
          Free during beta
          <span className="hidden sm:inline"> — no card required</span>
        </p>
        <Link
          href="/sign-up"
          className="label-mono inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.12em] text-paper underline decoration-paper/35 underline-offset-4 transition-colors hover:decoration-paper"
        >
          Start free
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[6px] text-paper/50 transition-colors hover:text-paper focus-visible:outline-paper sm:right-4"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </aside>
  );
}
