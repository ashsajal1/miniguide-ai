import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ComponentProps } from "react";
import Written from "@/app/components/course/written";

const { submitMock } = vi.hoisted(() => ({ submitMock: vi.fn() }));

vi.mock("@/app/course/learn/[courseId]/[moduleId]/actions", () => ({
  submitWrittenResponse: submitMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/course/learn/c1/m1",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

type WrittenProp = ComponentProps<typeof Written>["written"];

const date = new Date("2024-01-01T00:00:00.000Z");

const submission = {
  id: "sub1",
  answer: "Docker packages an app with its dependencies so it runs the same everywhere.",
  verdict: "STRONG" as const,
  score: 4,
  summary: "You explain the core idea and connect it to portability.",
  strengths: ["Names isolation", "Mentions portability"],
  gaps: ["Could add an example of an image and a container"],
  model_answer: "An image is the recipe; a container is a running instance of it.",
  user_id: "u1",
  written_id: "w1",
  created_at: date,
  updated_at: date,
};

function buildWritten(
  submissions: (typeof submission)[] = []
): WrittenProp {
  return {
    id: "w1",
    title: "Explain containers",
    prompt: "Explain how Docker containers keep an app consistent across machines.",
    guidance: "Cover isolation and portability in a sentence each.",
    module_id: "m1",
    content_item_id: "ci1",
    created_at: date,
    updated_at: date,
    deleted_at: null,
    submissions,
  } as WrittenProp;
}

const validAnswer =
  "A container bundles the app with its dependencies, so it behaves the same on every machine.";

function renderWritten(options?: {
  isSignedIn?: boolean;
  submissions?: (typeof submission)[];
  onComplete?: () => void;
}) {
  return render(
    <Written
      written={buildWritten(options?.submissions ?? [])}
      courseId="c1"
      moduleId="m1"
      isSignedIn={options?.isSignedIn ?? true}
      onComplete={options?.onComplete}
    />
  );
}

describe("Written component", () => {
  beforeEach(() => {
    submitMock.mockReset();
  });

  it("shows the prompt and a sign-in path when signed out", () => {
    renderWritten({ isSignedIn: false });

    expect(
      screen.getByText(/explain how docker containers keep an app consistent/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/cover isolation and portability/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();

    const link = screen.getByRole("link", { name: /sign in to get feedback/i });
    expect(link).toHaveAttribute(
      "href",
      "/sign-in?redirect_url=%2Fcourse%2Flearn%2Fc1%2Fm1"
    );
  });

  it("gates submission on the character minimum", () => {
    renderWritten();

    const textarea = screen.getByLabelText("Your answer");
    const submit = screen.getByRole("button", { name: /submit for feedback/i });

    expect(submit).toBeDisabled();
    expect(screen.getByText("40 characters minimum.")).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: "Too short." } });
    expect(submit).toBeDisabled();

    fireEvent.change(textarea, { target: { value: validAnswer } });
    expect(submit).not.toBeDisabled();
  });

  it("submits and renders AI feedback", async () => {
    const onComplete = vi.fn();
    submitMock.mockResolvedValue({ success: true, submission });

    renderWritten({ onComplete });

    fireEvent.change(screen.getByLabelText("Your answer"), {
      target: { value: validAnswer },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /submit for feedback/i })
    );

    expect(await screen.findByText("Strong")).toBeInTheDocument();
    expect(screen.getByText("4 of 5")).toBeInTheDocument();
    expect(screen.getByText(submission.summary)).toBeInTheDocument();
    expect(screen.getByText("Names isolation")).toBeInTheDocument();
    expect(
      screen.getByText("Could add an example of an image and a container")
    ).toBeInTheDocument();
    expect(screen.getByText(submission.model_answer)).toBeInTheDocument();

    expect(submitMock).toHaveBeenCalledWith({
      courseId: "c1",
      moduleId: "m1",
      writtenId: "w1",
      answer: validAnswer,
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("shows a retryable error and recovers", async () => {
    submitMock.mockResolvedValueOnce({
      success: false,
      code: "AI_FAILED",
      error: "We could not read that answer. Try again.",
    });

    renderWritten();

    fireEvent.change(screen.getByLabelText("Your answer"), {
      target: { value: validAnswer },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /submit for feedback/i })
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We could not read that answer. Try again.");

    submitMock.mockResolvedValueOnce({ success: true, submission });
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByText("Strong")).toBeInTheDocument();
    expect(submitMock).toHaveBeenCalledTimes(2);
  });

  it("refills the answer when revising", async () => {
    submitMock.mockResolvedValue({ success: true, submission });

    renderWritten();

    fireEvent.change(screen.getByLabelText("Your answer"), {
      target: { value: validAnswer },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /submit for feedback/i })
    );

    await screen.findByText("Strong");
    fireEvent.click(screen.getByRole("button", { name: /revise answer/i }));

    expect(screen.getByLabelText("Your answer")).toHaveValue(
      submission.answer
    );
  });

  it("renders a persisted submission on load and allows revision", () => {
    renderWritten({ submissions: [submission] });

    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /revise answer/i }));
    expect(screen.getByLabelText("Your answer")).toHaveValue(
      submission.answer
    );
  });
});
