import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseOutline } from "@/lib/course-ai-service";

const { createCourseSkeleton, generateModuleContent } = vi.hoisted(() => ({
  createCourseSkeleton: vi.fn(),
  generateModuleContent: vi.fn(),
}));

vi.mock("@/lib/course-creation-service", () => ({
  createCourseSkeleton,
  generateModuleContent,
}));

import { useCourseBuild } from "@/app/components/course/use-course-build";

const outline = {
  title: "Course",
  description: "About it",
  difficulty: "Beginner",
  estimatedDuration: "30m",
  language: "en",
  modules: [
    {
      title: "One",
      description: "First",
      learningObjectives: ["a"],
      estimatedDuration: "10m",
      order: 1,
    },
    {
      title: "Two",
      description: "Second",
      learningObjectives: ["b"],
      estimatedDuration: "10m",
      order: 2,
    },
  ],
} as CourseOutline;

const skeleton = {
  id: "course-1",
  title: "Course",
  description: "About it",
  modules: [
    { id: "module-1", title: "One", order: 1 },
    { id: "module-2", title: "Two", order: 2 },
  ],
};

describe("useCourseBuild", () => {
  beforeEach(() => {
    createCourseSkeleton.mockReset();
    generateModuleContent.mockReset();
    createCourseSkeleton.mockResolvedValue({ success: true, course: skeleton });
    generateModuleContent.mockResolvedValue({
      success: true,
      module: { slides: 3, questions: 3, written: true },
    });
  });

  it("saves the skeleton first, then writes each module", async () => {
    const { result } = renderHook(() => useCourseBuild());

    await act(async () => {
      expect(await result.current.start(outline)).toEqual({
        courseId: "course-1",
      });
    });

    expect(createCourseSkeleton).toHaveBeenCalledTimes(1);
    expect(generateModuleContent).toHaveBeenCalledTimes(2);
    expect(generateModuleContent).toHaveBeenNthCalledWith(
      1,
      "course-1",
      "module-1",
      outline.modules[0]
    );
    expect(result.current.modules.map((m) => m.status)).toEqual([
      "done",
      "done",
    ]);
    expect(result.current.modules[0]).toMatchObject({
      slides: 3,
      questions: 3,
      written: true,
    });
    expect(result.current.error).toBeNull();
  });

  it("resumes from the failed module instead of rebuilding the course", async () => {
    generateModuleContent
      .mockResolvedValueOnce({
        success: true,
        module: { slides: 2, questions: 2, written: true },
      })
      .mockResolvedValueOnce({ success: false, error: "Provider unavailable" });

    const { result } = renderHook(() => useCourseBuild());

    await act(async () => {
      const first = await result.current.start(outline);
      expect(first.courseId).toBe("course-1");
    });

    expect(result.current.modules.map((m) => m.status)).toEqual([
      "done",
      "failed",
    ]);
    expect(result.current.error).toBe("Provider unavailable");

    await act(async () => {
      expect(await result.current.start(outline)).toEqual({
        courseId: "course-1",
      });
    });

    expect(createCourseSkeleton).toHaveBeenCalledTimes(1);
    expect(generateModuleContent).toHaveBeenCalledTimes(3);
    expect(generateModuleContent).toHaveBeenLastCalledWith(
      "course-1",
      "module-2",
      outline.modules[1]
    );
    expect(result.current.modules.map((m) => m.status)).toEqual([
      "done",
      "done",
    ]);
    expect(result.current.error).toBeNull();
  });
});
