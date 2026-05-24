-- AlterTable
ALTER TABLE "MealTemplate"
ADD COLUMN "youtubeSearchQuery" TEXT,
ADD COLUMN "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill a deterministic search query for existing curated templates.
UPDATE "MealTemplate"
SET "youtubeSearchQuery" = LOWER("name" || ' healthy recipe video')
WHERE "youtubeSearchQuery" IS NULL;
