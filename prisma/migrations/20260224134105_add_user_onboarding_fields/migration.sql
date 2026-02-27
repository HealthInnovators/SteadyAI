-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dietaryPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryGoal" TEXT,
ADD COLUMN     "timeAvailability" TEXT;
