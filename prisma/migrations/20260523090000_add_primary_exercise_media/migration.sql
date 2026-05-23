-- CreateEnum
CREATE TYPE "ExerciseMediaType" AS ENUM ('GIF', 'MP4', 'IMAGE', 'NONE');

-- AlterTable
ALTER TABLE "ExerciseMedia"
ADD COLUMN "mediaUrl" TEXT,
ADD COLUMN "mediaType" "ExerciseMediaType" NOT NULL DEFAULT 'NONE';

-- Backfill primary media from existing legacy columns.
UPDATE "ExerciseMedia"
SET
  "mediaUrl" = COALESCE("videoUrl", "gifUrl"),
  "mediaType" = CASE
    WHEN "videoUrl" IS NOT NULL THEN 'MP4'::"ExerciseMediaType"
    WHEN "gifUrl" IS NOT NULL THEN 'GIF'::"ExerciseMediaType"
    ELSE 'NONE'::"ExerciseMediaType"
  END;
