"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";

export type WrittenFormData = {
  title: string;
  prompt: string;
  guidance: string;
};

interface WrittenFormProps {
  initialData?: Partial<WrittenFormData>;
  onSave: (data: WrittenFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  submitButtonText?: string;
}

export default function WrittenForm({
  initialData,
  onSave,
  isSubmitting,
  onCancel,
  submitButtonText = "Save",
}: WrittenFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [guidance, setGuidance] = useState(initialData?.guidance ?? "");

  const initialTitle = initialData?.title ?? "";
  const initialPrompt = initialData?.prompt ?? "";
  const initialGuidance = initialData?.guidance ?? "";

  const isDirty =
    title !== initialTitle ||
    prompt !== initialPrompt ||
    guidance !== initialGuidance;

  const canSubmit =
    title.trim().length > 0 &&
    prompt.trim().length > 0 &&
    isDirty &&
    !isSubmitting;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSave({ title: title.trim(), prompt: prompt.trim(), guidance: guidance.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="written-title"
          className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink"
        >
          <span>Title</span>
          <span className="text-xs font-normal text-muted-foreground">
            Required
          </span>
        </label>
        <input
          id="written-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Name the skill this task practises"
          className="input mt-2 w-full"
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label
          htmlFor="written-prompt"
          className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink"
        >
          <span>Prompt</span>
          <span className="text-xs font-normal text-muted-foreground">
            Required
          </span>
        </label>
        <textarea
          id="written-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the scenario or task the learner responds to."
          className="textarea mt-2 w-full"
          rows={5}
          disabled={isSubmitting}
          required
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          The learner answers this in 3-6 sentences. Keep it answerable from the
          module alone.
        </p>
      </div>

      <div>
        <label
          htmlFor="written-guidance"
          className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink"
        >
          <span>Guidance</span>
          <span className="text-xs font-normal text-muted-foreground">
            Optional
          </span>
        </label>
        <textarea
          id="written-guidance"
          value={guidance}
          onChange={(event) => setGuidance(event.target.value)}
          placeholder="Two or three points a strong answer should cover."
          className="textarea mt-2 w-full"
          rows={3}
          disabled={isSubmitting}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Shown to the learner as a hint. Do not give away the answer.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary gap-2" disabled={!canSubmit}>
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm" aria-hidden />
              Saving…
            </>
          ) : (
            <>
              <PenLine className="h-4 w-4" aria-hidden />
              {submitButtonText}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
