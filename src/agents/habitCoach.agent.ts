import { createLlmClientFromEnv } from '../services/llm';
import { buildHabitCoachPrompt, HABIT_COACH_SCHEMA_VERSION, type ChallengeParticipationSummary } from './habitCoach.prompt';

type HabitDifficulty = 'easy' | 'moderate';

export interface HabitAdjustmentSuggestion {
  title: string;
  action: string;
  whyItHelps: string;
  difficulty: HabitDifficulty;
  nextCheckInDays: number;
}

export interface HabitCoachResult {
  schemaVersion: 'v1';
  weeklyReflection: string;
  habitAdjustment: HabitAdjustmentSuggestion;
  toneCheck: {
    supportive: true;
    nonJudgmental: true;
    noShamingLanguage: true;
  };
}

const SHAMING_TERMS = ['lazy', 'failure', 'bad', 'weak', 'pathetic', 'undisciplined', 'worthless'];

function compactText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function sanitizeTone(text: string): string {
  let cleaned = text;
  for (const term of SHAMING_TERMS) {
    const pattern = new RegExp(`\\b${term}\\b`, 'gi');
    cleaned = cleaned.replace(pattern, 'off-track');
  }
  return cleaned;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function parseJsonObject(input: string): Record<string, unknown> {
  const trimmed = input.trim();
  try {
    return asObject(JSON.parse(trimmed));
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return asObject(JSON.parse(trimmed.slice(start, end + 1)));
    }
    throw new Error('Habit coach output is not valid JSON');
  }
}

function clampDays(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 7;
  }
  return Math.min(Math.max(Math.round(parsed), 1), 14);
}

function buildDeterministicFallback(summary: ChallengeParticipationSummary): HabitCoachResult {
  const completionRatePct = Math.round(summary.completionRate * 100);
  const reflection =
    completionRatePct >= 70
      ? `You kept steady momentum this week with a ${completionRatePct}% completion rate. Your consistency shows a stable routine you can keep building on.`
      : `You logged progress this week, and each check-in adds useful momentum. A ${completionRatePct}% completion rate suggests the routine can be simplified for better consistency.`;

  return {
    schemaVersion: 'v1',
    weeklyReflection: sanitizeTone(reflection),
    habitAdjustment: {
      title: 'Use a smaller daily baseline',
      action: 'Set one minimum daily action that can be finished in under 10 minutes and complete it before your main task.',
      whyItHelps: 'A smaller starting step lowers friction and makes consistency easier on busy days.',
      difficulty: 'easy',
      nextCheckInDays: 7
    },
    toneCheck: {
      supportive: true,
      nonJudgmental: true,
      noShamingLanguage: true
    }
  };
}

function normalizeResult(raw: Record<string, unknown>, fallback: HabitCoachResult): HabitCoachResult {
  const habitAdjustmentRaw = asObject(raw.habitAdjustment);
  const difficultyRaw = compactText(habitAdjustmentRaw.difficulty, fallback.habitAdjustment.difficulty);
  const difficulty: HabitDifficulty = difficultyRaw === 'moderate' ? 'moderate' : 'easy';

  return {
    schemaVersion: HABIT_COACH_SCHEMA_VERSION,
    weeklyReflection: sanitizeTone(compactText(raw.weeklyReflection, fallback.weeklyReflection)),
    habitAdjustment: {
      title: sanitizeTone(compactText(habitAdjustmentRaw.title, fallback.habitAdjustment.title)),
      action: sanitizeTone(compactText(habitAdjustmentRaw.action, fallback.habitAdjustment.action)),
      whyItHelps: sanitizeTone(compactText(habitAdjustmentRaw.whyItHelps, fallback.habitAdjustment.whyItHelps)),
      difficulty,
      nextCheckInDays: clampDays(habitAdjustmentRaw.nextCheckInDays)
    },
    toneCheck: {
      supportive: true,
      nonJudgmental: true,
      noShamingLanguage: true
    }
  };
}

export async function generateWeeklyHabitReflection(summary: ChallengeParticipationSummary): Promise<HabitCoachResult> {
  const llm = createLlmClientFromEnv();
  const prompt = buildHabitCoachPrompt(summary);
  const fallback = buildDeterministicFallback(summary);

  try {
    const response = await llm.generateText({
      prompt,
      systemPrompt:
        'Return strict JSON. Use supportive, non-judgmental language only. Do not use shaming terms. Do not include medical advice.',
      temperature: 0.1,
      maxOutputTokens: 700
    });

    const parsed = parseJsonObject(response.text);
    return normalizeResult(parsed, fallback);
  } catch {
    return fallback;
  }
}
