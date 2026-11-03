import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Question from "@/app/components/course/question";
import { Prisma } from "@/generated/prisma";

type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: {
    options: true;
    content_item: true;
  };
}>;

type Option = Prisma.OptionGetPayload<{
  select: {
    id: true;
    text: true;
    isCorrect: true;
    questionId: true;
    explanation: true;
    created_at: true;
    updated_at: true;
  };
}>;

const mockDate = new Date("2024-01-01T00:00:00.000Z");

describe("Question Component", () => {
  const mockOptions: Option[] = [
    {
      id: "opt1",
      text: "Option A",
      isCorrect: true,
      questionId: "q1",
      explanation: "General explanation for the question.",
      created_at: mockDate,
      updated_at: mockDate,
    },
    {
      id: "opt2",
      text: "Option B",
      isCorrect: false,
      questionId: "q1",
      explanation: "General explanation for the question.",
      created_at: mockDate,
      updated_at: mockDate,
    },
    {
      id: "opt3",
      text: "Option C",
      isCorrect: false,
      questionId: "q1",
      explanation: "General explanation for the question.",
      created_at: mockDate,
      updated_at: mockDate,
    },
  ];

  const mockQuestion: QuestionWithOptions = {
    id: "q1",
    title: "Test Question",
    content: "What is the correct answer?",
    module_id: "mod1",
    created_at: mockDate,
    updated_at: mockDate,
    deleted_at: null,
    content_item_id: "ci1",
    options: mockOptions,
    content_item: {
      id: "ci1",
      type: "QUESTION",
      order: 0,
      module_id: "mod1",
      created_at: mockDate,
      updated_at: mockDate,
    },
  };

  it("renders question and options correctly", () => {
    render(<Question question={mockQuestion} />);

    expect(screen.getByText("What is the correct answer?")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();

    // Submit button should be disabled initially
    const submitBtn = screen.getByRole("button", { name: /submit answer/i });
    expect(submitBtn).toBeDisabled();
  });

  it("allows selecting an option", () => {
    render(<Question question={mockQuestion} />);

    fireEvent.click(screen.getByRole("radio", { name: /option a/i }));

    const submitBtn = screen.getByRole("button", { name: /submit answer/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it("keeps a single selection", () => {
    render(<Question question={mockQuestion} />);

    const optionA = screen.getByRole("radio", { name: /option a/i });
    const optionB = screen.getByRole("radio", { name: /option b/i });

    fireEvent.click(optionA);
    expect(optionA).toBeChecked();

    fireEvent.click(optionB);
    expect(optionB).toBeChecked();
    expect(optionA).not.toBeChecked();
  });

  it("shows correct feedback when submitting correct answer", () => {
    render(<Question question={mockQuestion} />);

    fireEvent.click(screen.getByRole("radio", { name: /option a/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

    expect(screen.getByText("Correct.")).toBeInTheDocument();
    expect(screen.getByText("Explanation")).toBeInTheDocument();
    expect(
      screen.getByText("General explanation for the question.")
    ).toBeInTheDocument();
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit answer/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /try again/i })
    ).not.toBeInTheDocument();
  });

  it("shows incorrect feedback and allows another attempt", () => {
    render(<Question question={mockQuestion} />);

    fireEvent.click(screen.getByRole("radio", { name: /option b/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

    expect(screen.getByText("Not quite.")).toBeInTheDocument();
    expect(
      screen.getByText("General explanation for the question.")
    ).toBeInTheDocument();
    expect(screen.getByText("Your answer")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.queryByText("Not quite.")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit answer/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("radio", { name: /option a/i })
    ).toBeEnabled();
  });

  it("renders inline markdown in the prompt and options", () => {
    const markdownQuestion: QuestionWithOptions = {
      ...mockQuestion,
      content: "Which hook runs **side effects**?",
      options: [
        {
          ...mockOptions[0],
          text: "It runs `useEffect` after render.",
        },
        ...mockOptions.slice(1),
      ],
    };

    render(<Question question={markdownQuestion} />);

    const code = screen.getByText("useEffect");
    expect(code.tagName).toBe("CODE");
    expect(screen.getByText("side effects").tagName).toBe("STRONG");
    expect(screen.queryByText(/`/)).not.toBeInTheDocument();
  });
});
