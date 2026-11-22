-- Learner-provided context for personalized guides.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profile_context" TEXT;
