import { HealthProvider, Prisma, SyncBatchStatus } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

export interface WorkoutSessionSummaryInput {
  userId: string;
  sessionId: string;
  startedAt?: string;
  completedAt?: string;
  totalDurationMinutes: number;
  completedExercises: number;
  totalExercises: number;
  workoutPlan?: Record<string, unknown>;
  feedback?: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD' | null;
  sourceApp?: string;
  deviceInstallId?: string;
}

export interface WorkoutSessionSummaryResult {
  recordId: string;
  connectionId: string;
  syncBatchId: string;
  savedAt: string;
  deduplicated?: boolean;
}

export interface WorkoutSessionInsight {
  sessionId: string;
  completedExercises: number;
  totalExercises: number;
  completionRate: number;
  totalDurationMinutes: number;
  feedback: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD' | null;
  completedAt: string;
}

export interface WorkoutHistorySummary {
  windowDays: number;
  sessions: number;
  avgCompletionRate: number;
  avgDurationMinutes: number;
  lastFeedback: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD' | null;
  streakDays: number;
}

export interface WorkoutPreferences {
  preferredDurationMinutes?: number | null;
  preferredImpact?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  equipment?: 'NONE' | 'HOME' | 'GYM' | null;
  autoPostCheckIn?: boolean;
  updatedAt?: string;
}

function toJsonValue(value: Record<string, unknown> | undefined): Prisma.InputJsonValue | null {
  if (!value) {
    return null;
  }
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function parseIsoOrNow(value: string | undefined): Date {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid ISO timestamp');
  }
  return date;
}

function asNonNegativeInt(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
  return Math.floor(value);
}

export async function logWorkoutSessionSummary(
  input: WorkoutSessionSummaryInput
): Promise<WorkoutSessionSummaryResult> {
  const prisma = getPrismaClient();

  const totalDurationMinutes = asNonNegativeInt(input.totalDurationMinutes, 'totalDurationMinutes');
  const completedExercises = asNonNegativeInt(input.completedExercises, 'completedExercises');
  const totalExercises = asNonNegativeInt(input.totalExercises, 'totalExercises');
  if (!input.sessionId.trim()) {
    throw new Error('sessionId is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true }
  });
  if (!user) {
    throw new Error('User not found. Complete onboarding first.');
  }

  const startedAt = parseIsoOrNow(input.startedAt);
  const completedAt = parseIsoOrNow(input.completedAt);
  const hasStartedAt = typeof input.startedAt === 'string' && input.startedAt.trim().length > 0;
  const hasCompletedAt = typeof input.completedAt === 'string' && input.completedAt.trim().length > 0;
  const installId = input.deviceInstallId?.trim() || 'steadyai-workout-widget';
  const externalRecordId = `workout-session:${input.sessionId}`;
  const nextMetadata: Prisma.InputJsonValue = {
    summaryOnly: true,
    metric: 'workout_session',
    completedExercises,
    totalExercises,
    feedback: input.feedback ?? null,
    workoutPlan: toJsonValue(input.workoutPlan)
  };

  const connection = await prisma.userHealthConnection.upsert({
    where: {
      userId_provider_deviceInstallId: {
        userId: input.userId,
        provider: HealthProvider.HEALTH_CONNECT,
        deviceInstallId: installId
      }
    },
    create: {
      userId: input.userId,
      provider: HealthProvider.HEALTH_CONNECT,
      status: 'ACTIVE',
      grantedScopes: ['write_workout_summary'],
      deviceInstallId: installId,
      lastSyncedAt: new Date()
    },
    update: {
      status: 'ACTIVE',
      lastSyncedAt: new Date()
    }
  });

  const existing = await prisma.healthRecord.findUnique({
    where: {
      connectionId_externalRecordId_type: {
        connectionId: connection.id,
        externalRecordId,
        type: 'WORKOUT'
      }
    },
    select: {
      id: true,
      syncBatchId: true,
      value: true,
      startTime: true,
      endTime: true,
      metadata: true
    }
  });

  const existingMeta = JSON.stringify(normalizeForComparison(existing?.metadata ?? null));
  const incomingMeta = JSON.stringify(normalizeForComparison(nextMetadata));
  const isDuplicatePayload =
    Boolean(existing) &&
    Number(existing?.value ?? -1) === totalDurationMinutes &&
    (!hasStartedAt || Number(existing?.startTime?.getTime() ?? 0) === startedAt.getTime()) &&
    (!hasCompletedAt || Number(existing?.endTime?.getTime() ?? 0) === completedAt.getTime()) &&
    existingMeta === incomingMeta;

  if (isDuplicatePayload && existing) {
    return {
      recordId: existing.id,
      connectionId: connection.id,
      syncBatchId: existing.syncBatchId ?? 'deduplicated',
      savedAt: new Date().toISOString(),
      deduplicated: true
    };
  }

  const syncBatch = await prisma.healthSyncBatch.create({
    data: {
      connectionId: connection.id,
      status: SyncBatchStatus.COMPLETED,
      recordsReceived: 1,
      completedAt: new Date()
    }
  });

  const record = await prisma.healthRecord.upsert({
    where: {
      connectionId_externalRecordId_type: {
        connectionId: connection.id,
        externalRecordId,
        type: 'WORKOUT'
      }
    },
    create: {
      userId: input.userId,
      connectionId: connection.id,
      syncBatchId: syncBatch.id,
      externalRecordId,
      type: 'WORKOUT',
      startTime: startedAt,
      endTime: completedAt,
      value: totalDurationMinutes,
      unit: 'minute',
      sourceApp: input.sourceApp ?? 'steadyai-workout-widget',
      metadata: nextMetadata,
      sourceUpdatedAt: new Date()
    },
    update: {
      syncBatchId: syncBatch.id,
      startTime: startedAt,
      endTime: completedAt,
      value: totalDurationMinutes,
      unit: 'minute',
      sourceApp: input.sourceApp ?? 'steadyai-workout-widget',
      metadata: nextMetadata,
      sourceUpdatedAt: new Date()
    }
  });

  return {
    recordId: record.id,
    connectionId: connection.id,
    syncBatchId: syncBatch.id,
    savedAt: new Date().toISOString()
  };
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function asNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function normalizeForComparison(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForComparison(item));
  }
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const keys = Object.keys(source).sort();
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key] = normalizeForComparison(source[key]);
    }
    return out;
  }
  return value;
}

export async function getLatestWorkoutSessionInsight(userId: string): Promise<WorkoutSessionInsight | null> {
  const prisma = getPrismaClient();
  const rows = await prisma.healthRecord.findMany({
    where: {
      userId,
      type: 'WORKOUT',
      sourceApp: {
        in: ['steadyai-mcp-workout-widget', 'steadyai-workout-widget']
      }
    },
    orderBy: { endTime: 'desc' },
    take: 10,
    select: {
      externalRecordId: true,
      metadata: true,
      value: true,
      endTime: true
    }
  });

  for (const row of rows) {
    const meta = asObject(row.metadata);
    if (meta.metric !== 'workout_session') {
      continue;
    }
    const completed = asNumber(meta.completedExercises) ?? 0;
    const total = Math.max(1, asNumber(meta.totalExercises) ?? 0);
    const feedback =
      meta.feedback === 'TOO_EASY' || meta.feedback === 'JUST_RIGHT' || meta.feedback === 'TOO_HARD'
        ? meta.feedback
        : null;

    return {
      sessionId: row.externalRecordId.replace(/^workout-session:/, ''),
      completedExercises: completed,
      totalExercises: total,
      completionRate: Number((completed / total).toFixed(4)),
      totalDurationMinutes: Number(row.value ?? 0),
      feedback,
      completedAt: (row.endTime ?? new Date()).toISOString()
    };
  }

  return null;
}

export async function getWorkoutHistorySummary(userId: string, windowDays = 7): Promise<WorkoutHistorySummary> {
  const prisma = getPrismaClient();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - Math.max(1, Math.floor(windowDays)));

  const rows = await prisma.healthRecord.findMany({
    where: {
      userId,
      type: 'WORKOUT',
      sourceApp: {
        in: ['steadyai-mcp-workout-widget', 'steadyai-workout-widget']
      },
      endTime: { gte: start }
    },
    orderBy: { endTime: 'desc' },
    select: {
      metadata: true,
      value: true,
      endTime: true
    }
  });

  const sessions: Array<{
    completed: number;
    total: number;
    duration: number;
    feedback: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD' | null;
    dayKey: string;
  }> = [];

  for (const row of rows) {
    const meta = asObject(row.metadata);
    if (meta.metric !== 'workout_session') {
      continue;
    }
    const completed = Math.max(0, asNumber(meta.completedExercises) ?? 0);
    const total = Math.max(1, asNumber(meta.totalExercises) ?? 0);
    const feedback =
      meta.feedback === 'TOO_EASY' || meta.feedback === 'JUST_RIGHT' || meta.feedback === 'TOO_HARD'
        ? meta.feedback
        : null;
    sessions.push({
      completed,
      total,
      duration: Math.max(0, Number(row.value ?? 0)),
      feedback,
      dayKey: (row.endTime ?? new Date()).toISOString().slice(0, 10)
    });
  }

  if (!sessions.length) {
    return {
      windowDays: Math.max(1, Math.floor(windowDays)),
      sessions: 0,
      avgCompletionRate: 0,
      avgDurationMinutes: 0,
      lastFeedback: null,
      streakDays: 0
    };
  }

  const avgCompletionRate = Number(
    (sessions.reduce((sum, item) => sum + item.completed / item.total, 0) / sessions.length).toFixed(4)
  );
  const avgDurationMinutes = Number(
    (sessions.reduce((sum, item) => sum + item.duration, 0) / sessions.length).toFixed(2)
  );
  const uniqueDays = Array.from(new Set(sessions.map((x) => x.dayKey))).sort().reverse();
  let streak = 0;
  let cursor = new Date();
  for (const day of uniqueDays) {
    const key = cursor.toISOString().slice(0, 10);
    if (day !== key) {
      if (streak === 0 && day === key) {
        streak += 1;
      } else {
        break;
      }
    } else {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }

  return {
    windowDays: Math.max(1, Math.floor(windowDays)),
    sessions: sessions.length,
    avgCompletionRate,
    avgDurationMinutes,
    lastFeedback: sessions[0]?.feedback ?? null,
    streakDays: streak
  };
}

export async function upsertWorkoutPreferences(userId: string, preferences: WorkoutPreferences): Promise<WorkoutPreferences> {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw new Error('User not found. Complete onboarding first.');
  }

  const connection = await prisma.userHealthConnection.upsert({
    where: {
      userId_provider_deviceInstallId: {
        userId,
        provider: HealthProvider.HEALTH_CONNECT,
        deviceInstallId: 'steadyai-workout-widget'
      }
    },
    create: {
      userId,
      provider: HealthProvider.HEALTH_CONNECT,
      status: 'ACTIVE',
      grantedScopes: ['write_workout_preferences'],
      deviceInstallId: 'steadyai-workout-widget',
      lastSyncedAt: new Date()
    },
    update: {
      status: 'ACTIVE',
      lastSyncedAt: new Date()
    }
  });

  const now = new Date();
  const normalized: WorkoutPreferences = {
    preferredDurationMinutes:
      typeof preferences.preferredDurationMinutes === 'number'
        ? Math.max(5, Math.min(90, Math.floor(preferences.preferredDurationMinutes)))
        : null,
    preferredImpact:
      preferences.preferredImpact === 'LOW' || preferences.preferredImpact === 'MEDIUM' || preferences.preferredImpact === 'HIGH'
        ? preferences.preferredImpact
        : null,
    equipment:
      preferences.equipment === 'NONE' || preferences.equipment === 'HOME' || preferences.equipment === 'GYM'
        ? preferences.equipment
        : null,
    autoPostCheckIn: Boolean(preferences.autoPostCheckIn),
    updatedAt: now.toISOString()
  };

  await prisma.healthRecord.upsert({
    where: {
      connectionId_externalRecordId_type: {
        connectionId: connection.id,
        externalRecordId: 'workout-preferences',
        type: 'WORKOUT'
      }
    },
    create: {
      userId,
      connectionId: connection.id,
      externalRecordId: 'workout-preferences',
      type: 'WORKOUT',
      startTime: now,
      endTime: now,
      value: normalized.preferredDurationMinutes ?? 0,
      unit: 'minute',
      sourceApp: 'steadyai-mcp-workout-widget',
      metadata: {
        summaryOnly: true,
        metric: 'workout_preferences',
        ...normalized
      },
      sourceUpdatedAt: now
    },
    update: {
      startTime: now,
      endTime: now,
      value: normalized.preferredDurationMinutes ?? 0,
      unit: 'minute',
      sourceApp: 'steadyai-mcp-workout-widget',
      metadata: {
        summaryOnly: true,
        metric: 'workout_preferences',
        ...normalized
      },
      sourceUpdatedAt: now
    }
  });

  return normalized;
}

export async function getWorkoutPreferences(userId: string): Promise<WorkoutPreferences | null> {
  const prisma = getPrismaClient();
  const row = await prisma.healthRecord.findFirst({
    where: {
      userId,
      type: 'WORKOUT',
      externalRecordId: 'workout-preferences'
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      metadata: true
    }
  });
  if (!row) {
    return null;
  }
  const meta = asObject(row.metadata);
  if (meta.metric !== 'workout_preferences') {
    return null;
  }

  return {
    preferredDurationMinutes:
      typeof meta.preferredDurationMinutes === 'number' ? Math.max(5, Math.min(90, Math.floor(meta.preferredDurationMinutes))) : null,
    preferredImpact:
      meta.preferredImpact === 'LOW' || meta.preferredImpact === 'MEDIUM' || meta.preferredImpact === 'HIGH'
        ? meta.preferredImpact
        : null,
    equipment: meta.equipment === 'NONE' || meta.equipment === 'HOME' || meta.equipment === 'GYM' ? meta.equipment : null,
    autoPostCheckIn: Boolean(meta.autoPostCheckIn),
    updatedAt: typeof meta.updatedAt === 'string' ? meta.updatedAt : undefined
  };
}
