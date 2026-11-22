"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import {
  saveProfileContext,
  type ProfileContextState,
} from "@/app/profile/actions";

export function ProfileContextForm({ initialValue }: { initialValue: string }) {
  const [state, formAction, pending] = useActionState<
    ProfileContextState,
    FormData
  >(saveProfileContext, null);

  return (
    <form action={formAction} className="rounded-[14px] border border-rule bg-card p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl text-foreground">
          <Sparkles className="h-4 w-4 text-accent-deep" aria-hidden />
          Your context
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          Used only for your guides
        </span>
      </div>

      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
        Anything about you that would make a guide click: your course and year,
        what you already know, what you are learning, how you like examples.
        Optional, and only used when it is relevant to the document.
      </p>

      <label htmlFor="profileContext" className="sr-only">
        Your context
      </label>
      <textarea
        id="profileContext"
        name="profileContext"
        defaultValue={initialValue}
        rows={5}
        maxLength={4000}
        placeholder={
          "e.g. First-year mechanical engineering undergraduate. I know some Python and the basics of AI. I prefer green diagrams and short examples. New to thermodynamics."
        }
        className="input mt-4 min-h-[120px] resize-y"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Never forced into a guide. If it does not help explain the document,
          it stays out.
        </p>
        <div className="flex items-center gap-3">
          {state?.ok && (
            <span role="status" className="text-xs font-medium text-success">
              Saved
            </span>
          )}
          {state?.error && (
            <span role="alert" className="text-xs font-medium text-error">
              {state.error}
            </span>
          )}
          <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
            {pending ? "Saving…" : "Save context"}
          </button>
        </div>
      </div>
    </form>
  );
}
