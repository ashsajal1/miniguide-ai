import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import db from "@/db/client";
import {
  content as contentTable,
  course as courseTable,
  module as moduleTable,
  option as optionTable,
  question as questionTable,
  slide as slideTable,
  user as userTable,
  userModuleProgress as progressTable,
  written as writtenTable,
  writtenSubmission as submissionTable,
} from "@/db/schema";
import type { Metadata } from "next";
import LearnModuleView from "./learn-module-view";
import { getUserModuleProgress } from "./actions";
import { markCourseAsCompleted } from "@/lib/enrollment-service";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}): Promise<Metadata> {
  const { courseId, moduleId } = await params;

  const { userId } = await auth();
  const [course, module] = await Promise.all([
    db.query.course.findFirst({
      where: eq(courseTable.id, courseId),
      columns: { name: true, creator: true },
    }),
    db.query.module.findFirst({
      where: eq(moduleTable.id, moduleId),
      columns: { title: true },
    }),
  ]);

  if (!course || course.creator !== userId || !module) {
    return {
      title: "Module Not Found",
    };
  }

  return {
    title: `${module.title} - ${course.name}`,
    description: `Learn ${module.title} as part of the ${course.name} course.`,
  };
}

type ContentRow = InferSelectModel<typeof contentTable>;
type SlideRow = InferSelectModel<typeof slideTable>;
type QuestionRow = InferSelectModel<typeof questionTable>;
type OptionRow = InferSelectModel<typeof optionTable>;
type WrittenRow = InferSelectModel<typeof writtenTable>;
type SubmissionRow = InferSelectModel<typeof submissionTable>;

// This is the shape the learning view consumes, with the relations loaded.
export type ContentWithRelations = ContentRow & {
  slide: (SlideRow & { content_item: ContentRow | null }) | null;
  question:
    | (QuestionRow & {
        options: OptionRow[];
        content_item: ContentRow | null;
      })
    | null;
  written: (WrittenRow & { submissions: SubmissionRow[] }) | null;
};

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { moduleId, courseId } = await params;

  const { userId } = await auth();

  // Guides are private: only the creator can open their modules.
  const courseOwner = await db.query.course.findFirst({
    where: eq(courseTable.id, courseId),
    columns: { creator: true },
  });
  if (!courseOwner || courseOwner.creator !== userId) {
    notFound();
  }

  const viewer = userId
    ? await db.query.user.findFirst({
        where: eq(userTable.clerk_id, userId),
        columns: { id: true },
      })
    : null;

  const moduleContent = (await db.query.content.findMany({
    where: eq(contentTable.module_id, moduleId),
    with: {
      slide: {
        with: { content_item: true },
      },
      question: {
        with: { options: true, content_item: true },
      },
      written: {
        with: {
          submissions: {
            where: eq(submissionTable.user_id, viewer?.id ?? "__none__"),
            orderBy: desc(submissionTable.updated_at),
            limit: 1,
          },
        },
      },
    },
    orderBy: asc(contentTable.order),
  })) as ContentWithRelations[];

  const [course, currentModule] = await Promise.all([
    db.query.course.findFirst({
      where: eq(courseTable.id, courseId),
      columns: { creator: true, name: true },
    }),
    db.query.module.findFirst({
      where: eq(moduleTable.id, moduleId),
      columns: { title: true },
    }),
  ]);

  const isCreator = course?.creator === userId;

  // Fetch all modules to determine the next module
  const courseModules = await db.query.module.findMany({
    where: and(
      eq(moduleTable.course_id, courseId),
      isNull(moduleTable.deleted_at),
    ),
    columns: { id: true },
    orderBy: asc(moduleTable.created_at),
  });

  const currentModuleIndex = courseModules.findIndex((m) => m.id === moduleId);
  const nextModuleId =
    currentModuleIndex !== -1 && currentModuleIndex < courseModules.length - 1
      ? courseModules[currentModuleIndex + 1].id
      : null;

  const progress = await getUserModuleProgress(moduleId);

  // Check if all modules in the course are completed, and mark course as completed if so
  if (progress.isCompleted) {
    const allCourseModules = await db.query.module.findMany({
      where: eq(moduleTable.course_id, courseId),
      columns: { id: true },
    });

    const { userId: clerkId } = await auth();
    if (clerkId && allCourseModules.length > 0) {
      const user = await db.query.user.findFirst({
        where: eq(userTable.clerk_id, clerkId),
      });

      if (user) {
        const userProgress = await db.query.userModuleProgress.findMany({
          where: and(
            eq(progressTable.user_id, user.id),
            inArray(
              progressTable.module_id,
              allCourseModules.map((m) => m.id),
            ),
          ),
        });

        // If all modules are completed, mark the course as completed
        if (
          userProgress.length === allCourseModules.length &&
          userProgress.every((p) => p.is_completed)
        ) {
          try {
            await markCourseAsCompleted(courseId);
          } catch (error) {
            console.error("Error marking course as completed:", error);
          }
        }
      }
    }
  }

  return (
    <div>
      <LearnModuleView
        moduleContent={moduleContent}
        moduleId={moduleId}
        courseId={courseId}
        courseName={course?.name ?? "Course"}
        moduleTitle={currentModule?.title ?? "Module"}
        moduleNumber={currentModuleIndex === -1 ? 1 : currentModuleIndex + 1}
        moduleCount={courseModules.length}
        isCompleted={progress.isCompleted}
        nextModuleId={nextModuleId}
        isCreator={isCreator}
        isSignedIn={Boolean(userId)}
      />
    </div>
  );
}
