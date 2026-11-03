import { describe, expect, it } from "vitest";
import { parseWrittenFeedback } from "@/lib/written-ai";

const valid = {
  verdict: "PARTIAL",
  score: 3,
  summary: "Right idea, missing the example.",
  strengths: ["Names the core idea"],
  gaps: ["No concrete example"],
  model_answer: "A strong answer names the idea and applies it once.",
};

describe("parseWrittenFeedback", () => {
  it("parses fenced JSON", () => {
    const raw = "```json\n" + JSON.stringify(valid) + "\n```";
    expect(parseWrittenFeedback(raw)).toEqual({
      verdict: "PARTIAL",
      score: 3,
      summary: valid.summary,
      strengths: valid.strengths,
      gaps: valid.gaps,
      modelAnswer: valid.model_answer,
    });
  });

  it("accepts plain JSON and camelCase modelAnswer", () => {
    const { model_answer, ...rest } = valid;
    const parsed = parseWrittenFeedback(
      JSON.stringify({ ...rest, modelAnswer: model_answer })
    );
    expect(parsed?.modelAnswer).toBe(model_answer);
  });

  it("rejects an unknown verdict", () => {
    expect(
      parseWrittenFeedback(JSON.stringify({ ...valid, verdict: "GREAT" }))
    ).toBeNull();
  });

  it("rejects a score outside 1-5", () => {
    expect(
      parseWrittenFeedback(JSON.stringify({ ...valid, score: 6 }))
    ).toBeNull();
    expect(
      parseWrittenFeedback(JSON.stringify({ ...valid, score: 0 }))
    ).toBeNull();
  });

  it("coerces a numeric string score", () => {
    expect(
      parseWrittenFeedback(JSON.stringify({ ...valid, score: "4" }))?.score
    ).toBe(4);
  });

  it("accepts an empty strengths list for a weak answer", () => {
    const parsed = parseWrittenFeedback(
      JSON.stringify({ ...valid, strengths: [] })
    );
    expect(parsed?.strengths).toEqual([]);
  });

  it("clamps strengths and gaps to three items", () => {
    const parsed = parseWrittenFeedback(
      JSON.stringify({
        ...valid,
        strengths: ["one", "two", "three", "four"],
        gaps: ["a", "b", "c", "d"],
      })
    );
    expect(parsed?.strengths).toEqual(["one", "two", "three"]);
    expect(parsed?.gaps).toEqual(["a", "b", "c"]);
  });

  it("clamps long text", () => {
    const parsed = parseWrittenFeedback(
      JSON.stringify({
        ...valid,
        summary: "x".repeat(600),
        model_answer: "y".repeat(1200),
      })
    );
    expect(parsed?.summary.length).toBeLessThanOrEqual(400);
    expect(parsed?.modelAnswer.length).toBeLessThanOrEqual(800);
  });

  it("rejects missing required fields", () => {
    const withoutModel = Object.fromEntries(
      Object.entries(valid).filter(([key]) => key !== "model_answer")
    );
    expect(parseWrittenFeedback(JSON.stringify(withoutModel))).toBeNull();
    expect(parseWrittenFeedback("not json")).toBeNull();
  });
});
