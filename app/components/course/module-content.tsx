import Slide from "./slide";
import Question from "./question";
import Written from "./written";
import { ContentWithRelations } from "@/app/course/learn/[courseId]/[moduleId]/page";

export default function ModuleContent({
  content,
  isCreator,
  courseId,
  moduleId,
  isSignedIn,
  onComplete,
}: {
  content: ContentWithRelations;
  isCreator: boolean;
  courseId: string;
  moduleId: string;
  isSignedIn: boolean;
  onComplete?: () => void;
}) {
  switch (content.type) {
    case "SLIDE":
      return content.slide ? (
        <Slide
          slide={content.slide}
          isCreator={isCreator}
          courseId={courseId}
        />
      ) : null;

    case "QUESTION":
      return content.question ? (
        <Question
          question={content.question}
          isCreator={isCreator}
          courseId={courseId}
          onComplete={onComplete}
        />
      ) : null;

    case "WRITTEN":
      return content.written ? (
        <Written
          written={content.written}
          courseId={courseId}
          moduleId={moduleId}
          isSignedIn={isSignedIn}
          onComplete={onComplete}
        />
      ) : null;

    case null:
      return null;

    default: {
      const exhaustive: never = content.type;
      return exhaustive;
    }
  }
}
