-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DAILY_CHECK_IN_REMINDER', 'WEEKLY_REFLECTION', 'COMMUNITY_REPLIES');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('SENT', 'SKIPPED', 'FAILED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "parentPostId" UUID;

-- AlterTable
ALTER TABLE "ChallengeParticipation" DROP CONSTRAINT IF EXISTS "ChallengeParticipation_userId_key";

-- CreateTable
CREATE TABLE "UserNotificationSettings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dailyCheckInReminder" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReflection" BOOLEAN NOT NULL DEFAULT false,
    "communityReplies" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "dailyReminderHourLocal" INTEGER NOT NULL DEFAULT 9,
    "weeklyReflectionDayLocal" INTEGER NOT NULL DEFAULT 1,
    "weeklyReflectionHourLocal" INTEGER NOT NULL DEFAULT 18,
    "communityReplyCooldownMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDispatchLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'SENT',
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "scheduledAtUtc" TIMESTAMP(3) NOT NULL,
    "dispatchedAtUtc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dedupeKey" TEXT,
    "payload" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDispatchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSettings_userId_key" ON "UserNotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "UserNotificationSettings_timezone_idx" ON "UserNotificationSettings"("timezone");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_userId_idx" ON "ChallengeParticipation"("userId");

-- CreateIndex
CREATE INDEX "Post_parentPostId_idx" ON "Post"("parentPostId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDispatchLog_dedupeKey_key" ON "NotificationDispatchLog"("dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationDispatchLog_userId_type_dispatchedAtUtc_idx" ON "NotificationDispatchLog"("userId", "type", "dispatchedAtUtc");

-- AddCheckConstraint
ALTER TABLE "UserNotificationSettings"
ADD CONSTRAINT "UserNotificationSettings_dailyReminderHourLocal_check"
CHECK ("dailyReminderHourLocal" >= 0 AND "dailyReminderHourLocal" <= 23);

-- AddCheckConstraint
ALTER TABLE "UserNotificationSettings"
ADD CONSTRAINT "UserNotificationSettings_weeklyReflectionHourLocal_check"
CHECK ("weeklyReflectionHourLocal" >= 0 AND "weeklyReflectionHourLocal" <= 23);

-- AddCheckConstraint
ALTER TABLE "UserNotificationSettings"
ADD CONSTRAINT "UserNotificationSettings_weeklyReflectionDayLocal_check"
CHECK ("weeklyReflectionDayLocal" >= 0 AND "weeklyReflectionDayLocal" <= 6);

-- AddCheckConstraint
ALTER TABLE "UserNotificationSettings"
ADD CONSTRAINT "UserNotificationSettings_communityReplyCooldownMinutes_check"
CHECK ("communityReplyCooldownMinutes" > 0 AND "communityReplyCooldownMinutes" <= 1440);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationSettings" ADD CONSTRAINT "UserNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDispatchLog" ADD CONSTRAINT "NotificationDispatchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
