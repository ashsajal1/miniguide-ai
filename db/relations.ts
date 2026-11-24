import { relations } from "drizzle-orm";
import {
  category,
  content,
  course,
  enrollment,
  module,
  option,
  question,
  rating,
  slide,
  user,
  userModuleProgress,
  written,
  writtenSubmission,
} from "./schema";

// Relation field names match the Prisma include keys the app already uses.
export const categoryRelations = relations(category, ({ many }) => ({
  courses: many(course),
}));

export const courseRelations = relations(course, ({ one, many }) => ({
  category: one(category, {
    fields: [course.category_id],
    references: [category.id],
  }),
  modules: many(module),
  enrollments: many(enrollment),
  ratings: many(rating),
}));

export const moduleRelations = relations(module, ({ one, many }) => ({
  course: one(course, {
    fields: [module.course_id],
    references: [course.id],
  }),
  slides: many(slide),
  questions: many(question),
  written: many(written),
  content: many(content),
  userModuleProgress: many(userModuleProgress),
}));

export const contentRelations = relations(content, ({ one }) => ({
  module: one(module, {
    fields: [content.module_id],
    references: [module.id],
  }),
  slide: one(slide, {
    fields: [content.id],
    references: [slide.content_item_id],
  }),
  question: one(question, {
    fields: [content.id],
    references: [question.content_item_id],
  }),
  written: one(written, {
    fields: [content.id],
    references: [written.content_item_id],
  }),
}));

export const slideRelations = relations(slide, ({ one }) => ({
  module: one(module, {
    fields: [slide.module_id],
    references: [module.id],
  }),
  content_item: one(content, {
    fields: [slide.content_item_id],
    references: [content.id],
  }),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  module: one(module, {
    fields: [question.module_id],
    references: [module.id],
  }),
  content_item: one(content, {
    fields: [question.content_item_id],
    references: [content.id],
  }),
  options: many(option),
}));

export const optionRelations = relations(option, ({ one }) => ({
  question: one(question, {
    fields: [option.questionId],
    references: [question.id],
  }),
}));

export const writtenRelations = relations(written, ({ one, many }) => ({
  module: one(module, {
    fields: [written.module_id],
    references: [module.id],
  }),
  content_item: one(content, {
    fields: [written.content_item_id],
    references: [content.id],
  }),
  submissions: many(writtenSubmission),
}));

export const writtenSubmissionRelations = relations(
  writtenSubmission,
  ({ one }) => ({
    user: one(user, {
      fields: [writtenSubmission.user_id],
      references: [user.id],
    }),
    written: one(written, {
      fields: [writtenSubmission.written_id],
      references: [written.id],
    }),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  modules_progress: many(userModuleProgress),
  enrollments: many(enrollment),
  ratings: many(rating),
  writtenSubmissions: many(writtenSubmission),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, {
    fields: [enrollment.user_id],
    references: [user.id],
  }),
  course: one(course, {
    fields: [enrollment.course_id],
    references: [course.id],
  }),
}));

export const userModuleProgressRelations = relations(
  userModuleProgress,
  ({ one }) => ({
    user: one(user, {
      fields: [userModuleProgress.user_id],
      references: [user.id],
    }),
    module: one(module, {
      fields: [userModuleProgress.module_id],
      references: [module.id],
    }),
  }),
);

export const ratingRelations = relations(rating, ({ one }) => ({
  user: one(user, {
    fields: [rating.user_id],
    references: [user.id],
  }),
  course: one(course, {
    fields: [rating.course_id],
    references: [course.id],
  }),
}));
