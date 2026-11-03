"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import WrittenForm, {
  WrittenFormData,
} from "@/app/components/course/written-form";
import { createWritten } from "../actions";

export default function CreateWrittenPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const courseId = params.id as string;
  const moduleId = searchParams.get("moduleId");

  const handleSave = async (data: WrittenFormData) => {
    if (!moduleId) return;

    startTransition(async () => {
      try {
        const response = await createWritten(
          moduleId,
          data.title,
          data.prompt,
          data.guidance
        );
        if (response.success) {
          router.push(`/course/edit/${courseId}`);
        } else {
          console.error(response.error);
        }
      } catch (error) {
        console.error("Failed to create written task:", error);
      }
    });
  };

  if (!moduleId) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg bg-card p-6">
          <h3 className="text-xl font-semibold">Choose a module first</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Written tasks are added from inside a module.
          </p>
          <Link
            href={`/course/edit/${courseId}`}
            className="btn btn-outline btn-sm mt-4 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to the course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-lg bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Create written task</h3>
        </div>
        <WrittenForm
          onSave={handleSave}
          isSubmitting={isPending}
          onCancel={() => router.back()}
          submitButtonText="Create task"
        />
      </div>
    </div>
  );
}
