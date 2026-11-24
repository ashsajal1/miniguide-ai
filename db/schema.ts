import {
  boolean,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Table and column names mirror the existing Prisma/Postgres database exactly,
// so no data migration is needed. Property names keep the snake_case the app
// already uses.

const id = () =>
  text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  timestamp("created_at", { precision: 3 }).defaultNow().notNull();

// Prisma's @updatedAt had no database default, so the client fills it in.
const updatedAt = () =>
  timestamp("updated_at", { precision: 3 })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

export const contentType = pgEnum("ContentType", [
  "SLIDE",
  "QUESTION",
  "WRITTEN",
]);
export const role = pgEnum("Role", ["USER", "ADMIN"]);
export const userLevel = pgEnum("UserLevel", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "MASTER",
]);
export const writtenVerdict = pgEnum("WrittenVerdict", [
  "STRONG",
  "PARTIAL",
  "NEEDS_WORK",
]);

export type ContentType = (typeof contentType.enumValues)[number];
export type UserLevel = (typeof userLevel.enumValues)[number];

export const category = pgTable(
  "Category",
  {
    id: id(),
    name: text("name").notNull(),
    description: text("description"),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp("deleted_at", { precision: 3 }),
  },
  (table) => [uniqueIndex("Category_name_key").on(table.name)],
);

export const course = pgTable(
  "Course",
  {
    id: id(),
    creator: text("creator").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    difficulty: text("difficulty").notNull(),
    thumbnail_url: text("thumbnail_url").notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp("deleted_at", { precision: 3 }),
    isPublic: boolean("isPublic"),
    category_id: text("category_id"),
    lang: text("lang").default("en").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.category_id],
      foreignColumns: [category.id],
      name: "Course_category_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const content = pgTable(
  "Content",
  {
    id: id(),
    type: contentType("type"),
    order: integer("order").default(0).notNull(),
    module_id: text("module_id").notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    foreignKey({
      columns: [table.module_id],
      foreignColumns: [module.id],
      name: "Content_module_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const module = pgTable(
  "Module",
  {
    id: id(),
    title: text("title").notNull(),
    order: integer("order").default(0),
    course_id: text("course_id").notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp("deleted_at", { precision: 3 }),
  },
  (table) => [
    foreignKey({
      columns: [table.course_id],
      foreignColumns: [course.id],
      name: "Module_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const option = pgTable(
  "Option",
  {
    id: id(),
    text: text("text").notNull(),
    explanation: text("explanation"),
    isCorrect: boolean("isCorrect").default(false).notNull(),
    questionId: text("questionId").notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    index("Option_questionId_idx").on(table.questionId),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [question.id],
      name: "Option_questionId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const question = pgTable(
  "Question",
  {
    id: id(),
    title: text("title"),
    content: text("content").notNull(),
    module_id: text("module_id").notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp("deleted_at", { precision: 3 }),
    content_item_id: text("content_item_id"),
  },
  (table) => [
    uniqueIndex("Question_content_item_id_key").on(table.content_item_id),
    foreignKey({
      columns: [table.module_id],
      foreignColumns: [module.id],
      name: "Question_module_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.content_item_id],
      foreignColumns: [content.id],
      name: "Question_content_item_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const slide = pgTable(
  "Slide",
  {
    id: id(),
    title: text("title"),
    content: text("content").notNull(),
    module_id: text("module_id").notNull(),
    references: text("references").array(),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp("deleted_at", { precision: 3 }),
    content_item_id: text("content_item_id").notNull(),
  },
  (table) => [
    uniqueIndex("Slide_content_item_id_key").on(table.content_item_id),
    foreignKey({
      columns: [table.module_id],
      foreignColumns: [module.id],
      name: "Slide_module_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.content_item_id],
      foreignColumns: [content.id],
      name: "Slide_content_item_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const userModuleProgress = pgTable(
  "UserModuleProgress",
  {
    id: id(),
    user_id: text("user_id").notNull(),
    module_id: text("module_id").notNull(),
    is_completed: boolean("is_completed").default(false).notNull(),
    completed_at: timestamp("completed_at", { precision: 3 }),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    uniqueIndex("UserModuleProgress_user_id_module_id_key").on(
      table.user_id,
      table.module_id,
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [user.id],
      name: "UserModuleProgress_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.module_id],
      foreignColumns: [module.id],
      name: "UserModuleProgress_module_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const user = pgTable(
  "User",
  {
    id: id(),
    clerk_id: text("clerk_id").notNull(),
    role: role("role").default("USER").notNull(),
    level: userLevel("level").default("BEGINNER").notNull(),
    xp: integer("xp").default(0).notNull(),
    profile_context: text("profile_context"),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp("deleted_at", { precision: 3 }),
  },
  (table) => [uniqueIndex("User_clerk_id_key").on(table.clerk_id)],
);

export const enrollment = pgTable(
  "Enrollment",
  {
    id: id(),
    user_id: text("user_id").notNull(),
    course_id: text("course_id").notNull(),
    enrolled_at: timestamp("enrolled_at", { precision: 3 })
      .defaultNow()
      .notNull(),
    completed_at: timestamp("completed_at", { precision: 3 }),
    is_completed: boolean("is_completed").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("Enrollment_user_id_course_id_key").on(
      table.user_id,
      table.course_id,
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [user.id],
      name: "Enrollment_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.course_id],
      foreignColumns: [course.id],
      name: "Enrollment_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const rating = pgTable(
  "Rating",
  {
    id: id(),
    user_id: text("user_id").notNull(),
    course_id: text("course_id").notNull(),
    rating: integer("rating").notNull(),
    review: text("review"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    uniqueIndex("Rating_user_id_course_id_key").on(
      table.user_id,
      table.course_id,
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [user.id],
      name: "Rating_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.course_id],
      foreignColumns: [course.id],
      name: "Rating_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const written = pgTable(
  "Written",
  {
    id: id(),
    title: text("title"),
    prompt: text("prompt").notNull(),
    guidance: text("guidance"),
    module_id: text("module_id").notNull(),
    content_item_id: text("content_item_id").notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: timestamp("deleted_at", { precision: 3 }),
  },
  (table) => [
    uniqueIndex("Written_content_item_id_key").on(table.content_item_id),
    foreignKey({
      columns: [table.module_id],
      foreignColumns: [module.id],
      name: "Written_module_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.content_item_id],
      foreignColumns: [content.id],
      name: "Written_content_item_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const writtenSubmission = pgTable(
  "WrittenSubmission",
  {
    id: id(),
    answer: text("answer").notNull(),
    verdict: writtenVerdict("verdict").notNull(),
    score: integer("score").notNull(),
    summary: text("summary").notNull(),
    strengths: text("strengths").array(),
    gaps: text("gaps").array(),
    model_answer: text("model_answer").notNull(),
    user_id: text("user_id").notNull(),
    written_id: text("written_id").notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    uniqueIndex("WrittenSubmission_user_id_written_id_key").on(
      table.user_id,
      table.written_id,
    ),
    index("WrittenSubmission_written_id_idx").on(table.written_id),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [user.id],
      name: "WrittenSubmission_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.written_id],
      foreignColumns: [written.id],
      name: "WrittenSubmission_written_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);
