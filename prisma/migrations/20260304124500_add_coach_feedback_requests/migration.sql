-- CreateEnum
CREATE TYPE "CoachFeedbackStatus" AS ENUM ('REQUESTED', 'IN_REVIEW', 'RESPONDED', 'CLOSED');

-- CreateTable
CREATE TABLE "CoachFeedbackRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "purchaseId" UUID,
    "topic" TEXT NOT NULL,
    "context" TEXT,
    "preferredOutcome" TEXT,
    "status" "CoachFeedbackStatus" NOT NULL DEFAULT 'REQUESTED',
    "coachReply" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachFeedbackRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachFeedbackRequest_userId_createdAt_idx" ON "CoachFeedbackRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CoachFeedbackRequest_status_createdAt_idx" ON "CoachFeedbackRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "CoachFeedbackRequest" ADD CONSTRAINT "CoachFeedbackRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachFeedbackRequest" ADD CONSTRAINT "CoachFeedbackRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachFeedbackRequest" ADD CONSTRAINT "CoachFeedbackRequest_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

