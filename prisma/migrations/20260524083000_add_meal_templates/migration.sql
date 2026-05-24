-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "MealTemplateSource" AS ENUM ('CURATED', 'USER_CREATED', 'EXTERNAL');

-- CreateTable
CREATE TABLE "MealTemplate" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mealType" "MealType" NOT NULL,
    "calories" INTEGER NOT NULL,
    "proteinG" DECIMAL(8,2),
    "carbsG" DECIMAL(8,2),
    "fatG" DECIMAL(8,2),
    "fiberG" DECIMAL(8,2),
    "prepTimeMin" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "goalTags" TEXT[],
    "dietTags" TEXT[],
    "cuisineTags" TEXT[],
    "ingredients" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "imageUrl" TEXT,
    "source" "MealTemplateSource" NOT NULL DEFAULT 'CURATED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealTemplate_slug_key" ON "MealTemplate"("slug");

-- CreateIndex
CREATE INDEX "MealTemplate_mealType_isActive_idx" ON "MealTemplate"("mealType", "isActive");

-- CreateIndex
CREATE INDEX "MealTemplate_calories_idx" ON "MealTemplate"("calories");

-- CreateIndex
CREATE INDEX "MealTemplate_proteinG_idx" ON "MealTemplate"("proteinG");

-- CreateIndex
CREATE INDEX "MealTemplate_isActive_source_idx" ON "MealTemplate"("isActive", "source");
