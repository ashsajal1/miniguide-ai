import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique, auth } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  auth: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: () => auth() }));
vi.mock("@/prisma/client", () => ({ default: { user: { findUnique } } }));

import {
  buildLearnerPromptContext,
  loadLearnerProfile,
} from "@/lib/ai-context";

describe("learner profile context", () => {
  beforeEach(() => {
    findUnique.mockReset();
    auth.mockReset();
  });

  it("adds nothing when the learner has no profile", () => {
    expect(buildLearnerPromptContext("")).toBe("");
    expect(buildLearnerPromptContext(undefined)).toBe("");
    expect(buildLearnerPromptContext("   ")).toBe("");
  });

  it("wraps the profile in non-forcing personalisation rules", () => {
    const block = buildLearnerPromptContext(
      "First-year mechanical engineering student. Knows some Python."
    );
    expect(block).toContain("First-year mechanical engineering student");
    expect(block).toContain("Never force a mention");
    expect(block).toContain("never overrides the source");
  });

  it("loads the signed-in learner's saved context", async () => {
    auth.mockResolvedValue({ userId: "user_1" });
    findUnique.mockResolvedValue({ profile_context: "  Likes green.  " });

    await expect(loadLearnerProfile()).resolves.toBe("Likes green.");
    expect(findUnique).toHaveBeenCalledWith({
      where: { clerk_id: "user_1" },
      select: { profile_context: true },
    });
  });

  it("returns an empty context when signed out or on failure", async () => {
    auth.mockResolvedValue({ userId: null });
    await expect(loadLearnerProfile()).resolves.toBe("");

    auth.mockRejectedValue(new Error("no request context"));
    await expect(loadLearnerProfile()).resolves.toBe("");
  });
});
