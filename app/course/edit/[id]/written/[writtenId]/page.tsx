"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import WrittenForm, {
  WrittenFormData,
} from "@/app/components/course/written-form";
import { getWritten, updateWritten } from "./actions";

type Written = {
  id: string;
  title: string | null;
  prompt: string;
  guidance: string | null;
};

export default function EditWrittenPage() {
  const [written, setWritten] = useState<Written | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const writtenId = params.writtenId as string;

  useEffect(() => {
    if (!writtenId) return;

    getWritten(writtenId)
      .then((data) => {
        if (!data) {
          notFound();
          return;
        }
        setWritten(data);
      })
      .finally(() => setIsLoading(false));
  }, [writtenId]);

  const handleSave = async (data: WrittenFormData) => {
    startTransition(async () => {
      try {
        const response = await updateWritten(
          writtenId,
          courseId,
          data.title,
          data.prompt,
          data.guidance
        );
        if (response.success) {
          router.push(`/course/edit/${courseId}`);
        }
      } catch (error) {
        console.error("Failed to update written task:", error);
      }
    });
  };

  if (isLoading) {
    return <div>Loading…</div>;
  }

  if (!written) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-lg bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Edit written task</h3>
        </div>
        <WrittenForm
          initialData={{
            title: written.title ?? "",
            prompt: written.prompt,
            guidance: written.guidance ?? "",
          }}
          onSave={handleSave}
          isSubmitting={isPending}
          onCancel={() => router.back()}
          submitButtonText="Update task"
        />
      </div>
    </div>
  );
}
