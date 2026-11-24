CREATE TYPE "public"."ContentType" AS ENUM('SLIDE', 'QUESTION', 'WRITTEN');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."UserLevel" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MASTER');--> statement-breakpoint
CREATE TYPE "public"."WrittenVerdict" AS ENUM('STRONG', 'PARTIAL', 'NEEDS_WORK');--> statement-breakpoint
CREATE TABLE "Category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "Content" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "ContentType",
	"order" integer DEFAULT 0 NOT NULL,
	"module_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Course" (
	"id" text PRIMARY KEY NOT NULL,
	"creator" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3),
	"isPublic" boolean,
	"category_id" text,
	"lang" text DEFAULT 'en' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"enrolled_at" timestamp (3) DEFAULT now() NOT NULL,
	"completed_at" timestamp (3),
	"is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Module" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"order" integer DEFAULT 0,
	"course_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "Option" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"explanation" text,
	"isCorrect" boolean DEFAULT false NOT NULL,
	"questionId" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Question" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"module_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3),
	"content_item_id" text
);
--> statement-breakpoint
CREATE TABLE "Rating" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Slide" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"module_id" text NOT NULL,
	"references" text[],
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3),
	"content_item_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"role" "Role" DEFAULT 'USER' NOT NULL,
	"level" "UserLevel" DEFAULT 'BEGINNER' NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"profile_context" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "UserModuleProgress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"module_id" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Written" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"prompt" text NOT NULL,
	"guidance" text,
	"module_id" text NOT NULL,
	"content_item_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "WrittenSubmission" (
	"id" text PRIMARY KEY NOT NULL,
	"answer" text NOT NULL,
	"verdict" "WrittenVerdict" NOT NULL,
	"score" integer NOT NULL,
	"summary" text NOT NULL,
	"strengths" text[],
	"gaps" text[],
	"model_answer" text NOT NULL,
	"user_id" text NOT NULL,
	"written_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Content" ADD CONSTRAINT "Content_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."Module"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Course" ADD CONSTRAINT "Course_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Category"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Module" ADD CONSTRAINT "Module_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Question" ADD CONSTRAINT "Question_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."Module"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Question" ADD CONSTRAINT "Question_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."Content"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."Module"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."Content"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserModuleProgress" ADD CONSTRAINT "UserModuleProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserModuleProgress" ADD CONSTRAINT "UserModuleProgress_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."Module"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Written" ADD CONSTRAINT "Written_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."Module"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Written" ADD CONSTRAINT "Written_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."Content"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "WrittenSubmission" ADD CONSTRAINT "WrittenSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "WrittenSubmission" ADD CONSTRAINT "WrittenSubmission_written_id_fkey" FOREIGN KEY ("written_id") REFERENCES "public"."Written"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Category_name_key" ON "Category" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "Enrollment_user_id_course_id_key" ON "Enrollment" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "Option_questionId_idx" ON "Option" USING btree ("questionId");--> statement-breakpoint
CREATE UNIQUE INDEX "Question_content_item_id_key" ON "Question" USING btree ("content_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "Rating_user_id_course_id_key" ON "Rating" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "Slide_content_item_id_key" ON "Slide" USING btree ("content_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "User_clerk_id_key" ON "User" USING btree ("clerk_id");--> statement-breakpoint
CREATE UNIQUE INDEX "UserModuleProgress_user_id_module_id_key" ON "UserModuleProgress" USING btree ("user_id","module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "Written_content_item_id_key" ON "Written" USING btree ("content_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "WrittenSubmission_user_id_written_id_key" ON "WrittenSubmission" USING btree ("user_id","written_id");--> statement-breakpoint
CREATE INDEX "WrittenSubmission_written_id_idx" ON "WrittenSubmission" USING btree ("written_id");