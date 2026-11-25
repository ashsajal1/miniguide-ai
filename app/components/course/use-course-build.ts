"use client";

import { useCallback, useRef, useState } from "react";
import { CourseOutline } from "@/lib/course-ai-service";
import {
  createCourseSkeleton,
  generateModuleContent,
  type CourseSkeleton,
} from "@/lib/course-creation-service";
import { describeGenerationError } from "@/lib/course-generation-error";

export type ModuleBuildStatus = "pending" | "active" | "done" | "failed";

export interface ModuleBuildState {
  title: string;
  status: ModuleBuildStatus;
  slides: number;
  questions: number;
  written: boolean;
}

export type BuildPhase = "idle" | "saving-outline" | "writing-modules";

/**
 * Drives the two-step build: save the course + module skeleton, then write each
 * module's content one at a time so the UI can report progress and a failure
 * can resume where it stopped instead of rebuilding from nothing.
 */
export function useCourseBuild() {
  const [modules, setModules] = useState<ModuleBuildState[]>([]);
  const [phase, setPhase] = useState<BuildPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const modulesRef = useRef<ModuleBuildState[]>([]);
  const saved = useRef<{ signature: string; skeleton: CourseSkeleton } | null>(
    null
  );

  const updateModules = useCallback(
    (next: (list: ModuleBuildState[]) => ModuleBuildState[]) => {
      modulesRef.current = next(modulesRef.current);
      setModules(modulesRef.current);
    },
    []
  );

  const start = useCallback(
    async (
      outline: CourseOutline
    ): Promise<{ courseId: string | null; error?: string }> => {
      setIsBuilding(true);
      setError(null);

      const signature = JSON.stringify(outline);
      let skeleton =
        saved.current?.signature === signature ? saved.current.skeleton : null;

      if (skeleton) {
        // Resuming: modules finished in an earlier attempt stay finished.
        updateModules((list) =>
          list.map((module) =>
            module.status === "done" ? module : { ...module, status: "pending" }
          )
        );
      } else {
        setPhase("saving-outline");
        updateModules(() => []);
        const created = await createCourseSkeleton(outline);
        if (!created.success || !created.course) {
          setPhase("idle");
          setIsBuilding(false);
          const message = describeGenerationError(created.error);
          setError(message);
          return { courseId: null, error: message };
        }
        skeleton = created.course;
        saved.current = { signature, skeleton };
        updateModules(() =>
          skeleton!.modules.map((module) => ({
            title: module.title,
            status: "pending" as const,
            slides: 0,
            questions: 0,
            written: false,
          }))
        );
      }

      setPhase("writing-modules");

      for (let i = 0; i < skeleton.modules.length; i++) {
        if (modulesRef.current[i]?.status === "done") continue;

        updateModules((list) =>
          list.map((module, index) =>
            index === i ? { ...module, status: "active" } : module
          )
        );

        const result = await generateModuleContent(
          skeleton.id,
          skeleton.modules[i].id,
          outline.modules[i]
        );

        if (!result.success || !result.module) {
          updateModules((list) =>
            list.map((module, index) =>
              index === i ? { ...module, status: "failed" } : module
            )
          );
          setPhase("idle");
          setIsBuilding(false);
          const message = describeGenerationError(result.error);
          setError(message);
          return { courseId: skeleton.id, error: message };
        }

        const written = result.module;
        updateModules((list) =>
          list.map((module, index) =>
            index === i
              ? {
                  ...module,
                  status: "done",
                  slides: written.slides,
                  questions: written.questions,
                  written: written.written,
                }
              : module
          )
        );
      }

      setPhase("idle");
      setIsBuilding(false);
      return { courseId: skeleton.id };
    },
    [updateModules]
  );

  return { start, modules, phase, error, isBuilding };
}
