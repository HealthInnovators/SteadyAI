import type { FastifyInstance } from 'fastify';

import { getPrismaClient } from '../db/prisma';
import { authenticateRequest } from '../middleware/auth';

interface ReportsOverviewQuery {
  days?: number;
}

function toUtcDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatShortLabel(dateKey: string): string {
  return dateKey.slice(5);
}

function buildRecentDateKeys(now: Date, days: number): string[] {
  const keys: string[] = [];
  const cursor = new Date(now);
  cursor.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const point = new Date(cursor);
    point.setUTCDate(point.getUTCDate() - i);
    keys.push(toUtcDateKey(point));
  }
  return keys;
}

function calculateCurrentCompletedStreak(dateKeys: Set<string>, today: Date): number {
  let streak = 0;
  const cursor = new Date(today);
  cursor.setUTCHours(0, 0, 0, 0);

  for (;;) {
    const key = toUtcDateKey(cursor);
    if (!dateKeys.has(key)) {
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export async function reportsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Querystring: ReportsOverviewQuery }>(
    '/reports/overview',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const rawDays = request.query.days;
      const days = typeof rawDays === 'number' && Number.isFinite(rawDays) ? Math.floor(rawDays) : 7;
      const clampedDays = Math.max(1, Math.min(30, days));

      const now = new Date();
      const windowStart = new Date(now);
      windowStart.setUTCDate(windowStart.getUTCDate() - clampedDays);

      try {
        const prisma = getPrismaClient();

        const [
          challengeRows,
          activeParticipation,
          nutritionRows,
          workoutRows,
          authoredPosts,
          reactionsGivenCount,
          reactionsReceivedCount,
          repliesReceivedCount
        ] = await Promise.all([
          prisma.challengeCheckIn.findMany({
            where: {
              checkInDate: { gte: windowStart },
              participation: { userId }
            },
            select: {
              participationStatus: true,
              checkInDate: true
            }
          }),
          prisma.challengeParticipation.findFirst({
            where: {
              userId,
              status: 'JOINED',
              challenge: { status: 'ACTIVE' }
            },
            select: { id: true }
          }),
          prisma.nutritionEntry.findMany({
            where: {
              userId,
              consumedAt: { gte: windowStart }
            },
            select: {
              consumedAt: true,
              totalCalories: true,
              totalProteinG: true,
              totalCarbsG: true,
              totalFatG: true
            }
          }),
          prisma.healthRecord.findMany({
            where: {
              userId,
              type: 'WORKOUT',
              endTime: { gte: windowStart },
              sourceApp: { in: ['steadyai-mcp-workout-widget', 'steadyai-workout-widget'] }
            },
            select: {
              endTime: true,
              value: true,
              metadata: true
            }
          }),
          prisma.post.findMany({
            where: {
              authorId: userId,
              createdAt: { gte: windowStart }
            },
            select: {
              id: true,
              createdAt: true,
              type: true
            }
          }),
          prisma.reaction.count({
            where: {
              userId,
              createdAt: { gte: windowStart }
            }
          }),
          prisma.reaction.count({
            where: {
              createdAt: { gte: windowStart },
              post: { authorId: userId }
            }
          }),
          prisma.post.count({
            where: {
              createdAt: { gte: windowStart },
              parentPostId: { not: null },
              parentPost: { authorId: userId }
            }
          })
        ]);

        const challenge = {
          totalCheckIns: challengeRows.length,
          completed: challengeRows.filter((x) => x.participationStatus === 'COMPLETED').length,
          partial: challengeRows.filter((x) => x.participationStatus === 'PARTIAL').length,
          skipped: challengeRows.filter((x) => x.participationStatus === 'SKIPPED').length
        };
        const completedDateKeys = new Set(
          challengeRows
            .filter((x) => x.participationStatus === 'COMPLETED')
            .map((x) => toUtcDateKey(x.checkInDate))
        );
        const currentStreakDays = calculateCurrentCompletedStreak(completedDateKeys, now);

        const nutritionTotals = nutritionRows.reduce(
          (acc, row) => {
            acc.calories += row.totalCalories ?? 0;
            acc.proteinG += Number(row.totalProteinG ?? 0);
            acc.carbsG += Number(row.totalCarbsG ?? 0);
            acc.fatG += Number(row.totalFatG ?? 0);
            return acc;
          },
          { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
        );

        const workout = workoutRows.reduce(
          (acc, row) => {
            acc.sessions += 1;
            acc.totalMinutes += Number(row.value ?? 0);
            const metadata =
              row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
                ? (row.metadata as Record<string, unknown>)
                : null;
            const completedExercises = typeof metadata?.completedExercises === 'number' ? metadata.completedExercises : null;
            const totalExercises = typeof metadata?.totalExercises === 'number' ? metadata.totalExercises : null;
            if (completedExercises !== null && totalExercises && totalExercises > 0) {
              acc.completionRateTotal += completedExercises / totalExercises;
              acc.completionRateCount += 1;
            }
            const feedback = metadata?.feedback;
            if (feedback === 'TOO_EASY' || feedback === 'JUST_RIGHT' || feedback === 'TOO_HARD') {
              acc.feedback[feedback] += 1;
            }
            return acc;
          },
          {
            sessions: 0,
            totalMinutes: 0,
            completionRateTotal: 0,
            completionRateCount: 0,
            feedback: { TOO_EASY: 0, JUST_RIGHT: 0, TOO_HARD: 0 }
          }
        );

        const postTypeCounts = {
          WIN: authoredPosts.filter((x) => x.type === 'WIN').length,
          QUESTION: authoredPosts.filter((x) => x.type === 'QUESTION').length,
          CHECK_IN: authoredPosts.filter((x) => x.type === 'CHECK_IN').length
        };

        const trendWindowDays = Math.min(7, clampedDays);
        const trendKeys = buildRecentDateKeys(now, trendWindowDays);
        const checkInTrendMap = new Map<string, number>();
        const caloriesTrendMap = new Map<string, number>();
        const workoutMinutesTrendMap = new Map<string, number>();
        const postsTrendMap = new Map<string, number>();

        for (const row of challengeRows) {
          if (row.participationStatus !== 'COMPLETED') {
            continue;
          }
          const key = toUtcDateKey(row.checkInDate);
          checkInTrendMap.set(key, (checkInTrendMap.get(key) ?? 0) + 1);
        }
        for (const row of nutritionRows) {
          const key = toUtcDateKey(row.consumedAt);
          caloriesTrendMap.set(key, (caloriesTrendMap.get(key) ?? 0) + (row.totalCalories ?? 0));
        }
        for (const row of workoutRows) {
          if (!row.endTime) {
            continue;
          }
          const key = toUtcDateKey(row.endTime);
          workoutMinutesTrendMap.set(key, (workoutMinutesTrendMap.get(key) ?? 0) + Number(row.value ?? 0));
        }
        for (const row of authoredPosts) {
          const key = toUtcDateKey(row.createdAt);
          postsTrendMap.set(key, (postsTrendMap.get(key) ?? 0) + 1);
        }

        const response = {
          period: {
            days: clampedDays,
            from: windowStart.toISOString(),
            to: now.toISOString()
          },
          challenge: {
            activeParticipation: Boolean(activeParticipation),
            totalCheckIns: challenge.totalCheckIns,
            completed: challenge.completed,
            partial: challenge.partial,
            skipped: challenge.skipped,
            completionRate: challenge.totalCheckIns > 0 ? Number((challenge.completed / challenge.totalCheckIns).toFixed(3)) : 0,
            currentStreakDays
          },
          nutrition: {
            entries: nutritionRows.length,
            calories: nutritionTotals.calories,
            proteinG: Number(nutritionTotals.proteinG.toFixed(1)),
            carbsG: Number(nutritionTotals.carbsG.toFixed(1)),
            fatG: Number(nutritionTotals.fatG.toFixed(1)),
            avgCaloriesPerEntry:
              nutritionRows.length > 0 ? Math.round(nutritionTotals.calories / nutritionRows.length) : 0
          },
          workout: {
            sessions: workout.sessions,
            totalMinutes: Math.round(workout.totalMinutes),
            avgMinutesPerSession: workout.sessions > 0 ? Math.round(workout.totalMinutes / workout.sessions) : 0,
            avgCompletionRate:
              workout.completionRateCount > 0
                ? Number((workout.completionRateTotal / workout.completionRateCount).toFixed(3))
                : null,
            feedback: workout.feedback
          },
          community: {
            posts: authoredPosts.length,
            postTypes: postTypeCounts,
            reactionsGiven: reactionsGivenCount,
            reactionsReceived: reactionsReceivedCount,
            repliesReceived: repliesReceivedCount
          },
          trends: {
            days: trendWindowDays,
            checkInsCompleted: trendKeys.map((key) => ({
              date: key,
              label: formatShortLabel(key),
              value: checkInTrendMap.get(key) ?? 0
            })),
            calories: trendKeys.map((key) => ({
              date: key,
              label: formatShortLabel(key),
              value: Math.round(caloriesTrendMap.get(key) ?? 0)
            })),
            workoutMinutes: trendKeys.map((key) => ({
              date: key,
              label: formatShortLabel(key),
              value: Math.round(workoutMinutesTrendMap.get(key) ?? 0)
            })),
            communityPosts: trendKeys.map((key) => ({
              date: key,
              label: formatShortLabel(key),
              value: postsTrendMap.get(key) ?? 0
            }))
          }
        };

        return reply.status(200).send(response);
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to build reports overview' });
      }
    }
  );
}
