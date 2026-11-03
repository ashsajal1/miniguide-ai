-- CreateEnum
CREATE TYPE "WrittenVerdict" AS ENUM ('STRONG', 'PARTIAL', 'NEEDS_WORK');

-- CreateTable
CREATE TABLE "Written" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "prompt" TEXT NOT NULL,
    "guidance" TEXT,
    "module_id" TEXT NOT NULL,
    "content_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Written_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrittenSubmission" (
    "id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "verdict" "WrittenVerdict" NOT NULL,
    "score" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[],
    "gaps" TEXT[],
    "model_answer" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "written_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WrittenSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Written_content_item_id_key" ON "Written"("content_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "WrittenSubmission_user_id_written_id_key" ON "WrittenSubmission"("user_id", "written_id");

-- CreateIndex
CREATE INDEX "WrittenSubmission_written_id_idx" ON "WrittenSubmission"("written_id");

-- AddForeignKey
ALTER TABLE "Written" ADD CONSTRAINT "Written_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Written" ADD CONSTRAINT "Written_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrittenSubmission" ADD CONSTRAINT "WrittenSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrittenSubmission" ADD CONSTRAINT "WrittenSubmission_written_id_fkey" FOREIGN KEY ("written_id") REFERENCES "Written"("id") ON DELETE CASCADE ON UPDATE CASCADE;
