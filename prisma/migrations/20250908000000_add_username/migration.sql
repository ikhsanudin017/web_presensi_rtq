-- Add username column
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Populate username from email
UPDATE "User" SET "username" = "email";

-- Add not null constraint
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- Unique constraint for username
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

