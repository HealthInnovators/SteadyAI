import { HealthProvider, SyncBatchStatus } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

export interface AggregatedHealthMetricsInput {
  userId: string;
  date: string;
  steps: number;
  activityMinutes: number;
  sourceApp?: string;
  deviceInstallId?: string;
}

export interface AggregatedHealthMetricsResult {
  connectionId: string;
  syncBatchId: string;
  date: string;
  recordsUpserted: number;
  summary: {
    steps: number;
    activityMinutes: number;
  };
}

export interface HealthMetricsIngestionService {
  ingestAggregatedMetrics(input: AggregatedHealthMetricsInput): Promise<AggregatedHealthMetricsResult>;
}

function normalizeNonNegativeInt(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
  return Math.floor(value);
}

function startOfUtcDay(inputDate: string): Date {
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error('date must be a valid ISO-8601 date string');
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export class HealthConnectStubService implements HealthMetricsIngestionService {
  async ingestAggregatedMetrics(input: AggregatedHealthMetricsInput): Promise<AggregatedHealthMetricsResult> {
    const prisma = getPrismaClient();

    const steps = normalizeNonNegativeInt(input.steps, 'steps');
    const activityMinutes = normalizeNonNegativeInt(input.activityMinutes, 'activityMinutes');
    const dayStart = startOfUtcDay(input.date);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const connection = await prisma.userHealthConnection.upsert({
      where: {
        userId_provider_deviceInstallId: {
          userId: input.userId,
          provider: HealthProvider.HEALTH_CONNECT,
          deviceInstallId: input.deviceInstallId ?? 'health-connect-stub-device'
        }
      },
      create: {
        userId: input.userId,
        provider: HealthProvider.HEALTH_CONNECT,
        status: 'ACTIVE',
        grantedScopes: ['read_steps', 'read_activity'],
        deviceInstallId: input.deviceInstallId ?? 'health-connect-stub-device',
        lastSyncedAt: new Date()
      },
      update: {
        status: 'ACTIVE',
        lastSyncedAt: new Date()
      }
    });

    const syncBatch = await prisma.healthSyncBatch.create({
      data: {
        connectionId: connection.id,
        status: SyncBatchStatus.COMPLETED,
        recordsReceived: 2,
        completedAt: new Date()
      }
    });

    const externalStepsId = `agg:${dayStart.toISOString().slice(0, 10)}:steps`;
    const externalActivityId = `agg:${dayStart.toISOString().slice(0, 10)}:activity_minutes`;

    await Promise.all([
      prisma.healthRecord.upsert({
        where: {
          connectionId_externalRecordId_type: {
            connectionId: connection.id,
            externalRecordId: externalStepsId,
            type: 'STEPS'
          }
        },
        create: {
          userId: input.userId,
          connectionId: connection.id,
          syncBatchId: syncBatch.id,
          externalRecordId: externalStepsId,
          type: 'STEPS',
          startTime: dayStart,
          endTime: dayEnd,
          value: steps,
          unit: 'count',
          sourceApp: input.sourceApp,
          metadata: {
            summaryOnly: true,
            rawHealthDataIncluded: false,
            metric: 'steps',
            source: 'health-connect-stub'
          },
          sourceUpdatedAt: new Date()
        },
        update: {
          syncBatchId: syncBatch.id,
          startTime: dayStart,
          endTime: dayEnd,
          value: steps,
          unit: 'count',
          sourceApp: input.sourceApp,
          metadata: {
            summaryOnly: true,
            rawHealthDataIncluded: false,
            metric: 'steps',
            source: 'health-connect-stub'
          },
          sourceUpdatedAt: new Date()
        }
      }),
      prisma.healthRecord.upsert({
        where: {
          connectionId_externalRecordId_type: {
            connectionId: connection.id,
            externalRecordId: externalActivityId,
            type: 'WORKOUT'
          }
        },
        create: {
          userId: input.userId,
          connectionId: connection.id,
          syncBatchId: syncBatch.id,
          externalRecordId: externalActivityId,
          type: 'WORKOUT',
          startTime: dayStart,
          endTime: dayEnd,
          value: activityMinutes,
          unit: 'minute',
          sourceApp: input.sourceApp,
          metadata: {
            summaryOnly: true,
            rawHealthDataIncluded: false,
            metric: 'activity_minutes',
            source: 'health-connect-stub'
          },
          sourceUpdatedAt: new Date()
        },
        update: {
          syncBatchId: syncBatch.id,
          startTime: dayStart,
          endTime: dayEnd,
          value: activityMinutes,
          unit: 'minute',
          sourceApp: input.sourceApp,
          metadata: {
            summaryOnly: true,
            rawHealthDataIncluded: false,
            metric: 'activity_minutes',
            source: 'health-connect-stub'
          },
          sourceUpdatedAt: new Date()
        }
      })
    ]);

    return {
      connectionId: connection.id,
      syncBatchId: syncBatch.id,
      date: dayStart.toISOString().slice(0, 10),
      recordsUpserted: 2,
      summary: {
        steps,
        activityMinutes
      }
    };
  }
}

export function createHealthMetricsIngestionService(): HealthMetricsIngestionService {
  return new HealthConnectStubService();
}
