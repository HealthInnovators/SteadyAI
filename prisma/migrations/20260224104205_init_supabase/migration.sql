-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('JOINED', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'CELEBRATE', 'SUPPORT');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "HealthProvider" AS ENUM ('HEALTH_CONNECT');

-- CreateEnum
CREATE TYPE "HealthConnectionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "HealthRecordType" AS ENUM ('STEPS', 'HEART_RATE', 'SLEEP_SESSION', 'WORKOUT', 'WEIGHT', 'HEIGHT', 'BLOOD_GLUCOSE');

-- CreateEnum
CREATE TYPE "SyncBatchStatus" AS ENUM ('STARTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "NutritionInputType" AS ENUM ('TEXT', 'IMAGE', 'TEXT_AND_IMAGE');

-- CreateEnum
CREATE TYPE "NutritionEntryStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "creatorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeParticipation" (
    "id" UUID NOT NULL,
    "challengeId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'JOINED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "groupId" UUID,
    "challengeId" UUID,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "ReactionType" NOT NULL DEFAULT 'LIKE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "creatorId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" UUID NOT NULL,
    "buyerId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalCents" INTEGER NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHealthConnection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "HealthProvider" NOT NULL DEFAULT 'HEALTH_CONNECT',
    "status" "HealthConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "grantedScopes" TEXT[],
    "deviceInstallId" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "lastCursor" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHealthConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthSyncBatch" (
    "id" UUID NOT NULL,
    "connectionId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "SyncBatchStatus" NOT NULL DEFAULT 'STARTED',
    "recordsReceived" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthSyncBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "connectionId" UUID NOT NULL,
    "syncBatchId" UUID,
    "externalRecordId" TEXT NOT NULL,
    "type" "HealthRecordType" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "value" DECIMAL(12,4),
    "unit" TEXT,
    "sourceApp" TEXT,
    "metadata" JSONB,
    "sourceUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "inputType" "NutritionInputType" NOT NULL,
    "rawText" TEXT,
    "consumedAt" TIMESTAMP(3) NOT NULL,
    "status" "NutritionEntryStatus" NOT NULL DEFAULT 'PENDING',
    "totalCalories" INTEGER,
    "totalProteinG" DECIMAL(8,2),
    "totalCarbsG" DECIMAL(8,2),
    "totalFatG" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionImage" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionItem" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" TEXT,
    "calories" INTEGER NOT NULL,
    "proteinG" DECIMAL(8,2),
    "carbsG" DECIMAL(8,2),
    "fatG" DECIMAL(8,2),
    "confidence" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionAiAnalysis" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "promptVersion" TEXT,
    "status" "NutritionEntryStatus" NOT NULL DEFAULT 'PROCESSED',
    "confidence" DECIMAL(5,4),
    "rawResponse" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionAiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeParticipation_challengeId_userId_key" ON "ChallengeParticipation"("challengeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_postId_userId_key" ON "Reaction"("postId", "userId");

-- CreateIndex
CREATE INDEX "UserHealthConnection_userId_provider_idx" ON "UserHealthConnection"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "UserHealthConnection_userId_provider_deviceInstallId_key" ON "UserHealthConnection"("userId", "provider", "deviceInstallId");

-- CreateIndex
CREATE INDEX "HealthSyncBatch_connectionId_startedAt_idx" ON "HealthSyncBatch"("connectionId", "startedAt");

-- CreateIndex
CREATE INDEX "HealthRecord_userId_type_startTime_idx" ON "HealthRecord"("userId", "type", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "HealthRecord_connectionId_externalRecordId_type_key" ON "HealthRecord"("connectionId", "externalRecordId", "type");

-- CreateIndex
CREATE INDEX "NutritionEntry_userId_consumedAt_idx" ON "NutritionEntry"("userId", "consumedAt");

-- CreateIndex
CREATE INDEX "NutritionEntry_status_idx" ON "NutritionEntry"("status");

-- CreateIndex
CREATE INDEX "NutritionItem_entryId_idx" ON "NutritionItem"("entryId");

-- CreateIndex
CREATE INDEX "NutritionAiAnalysis_entryId_createdAt_idx" ON "NutritionAiAnalysis"("entryId", "createdAt");

-- AddForeignKey
ALTER TABLE "CommunityGroup" ADD CONSTRAINT "CommunityGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommunityGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommunityGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHealthConnection" ADD CONSTRAINT "UserHealthConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthSyncBatch" ADD CONSTRAINT "HealthSyncBatch_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "UserHealthConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "UserHealthConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_syncBatchId_fkey" FOREIGN KEY ("syncBatchId") REFERENCES "HealthSyncBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionEntry" ADD CONSTRAINT "NutritionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionImage" ADD CONSTRAINT "NutritionImage_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "NutritionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionItem" ADD CONSTRAINT "NutritionItem_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "NutritionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionAiAnalysis" ADD CONSTRAINT "NutritionAiAnalysis_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "NutritionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
