export interface ChallengeParticipationSummary {
  challengeId: string | null;
  participationStatus: string | null;
  periodDays: number;
  totalCheckIns: number;
  completedCheckIns: number;
  partialCheckIns: number;
  skippedCheckIns: number;
  completionRate: number;
  lastCheckInAt: string | null;
}

export const HABIT_COACH_SCHEMA_VERSION = 'v1';

export function buildHabitCoachPrompt(summary: ChallengeParticipationSummary): string {
  return [
    'You are a supportive habit coach.',
    'Write a weekly reflection and exactly one habit adjustment suggestion.',
    'Use neutral, encouraging language only.',
    'Do not use shaming language. Do not use medical advice or claims.',
    'Return strict JSON only with this schema:',
    '{',
    '  "schemaVersion": "v1",',
    '  "weeklyReflection": "string",',
    '  "habitAdjustment": {',
    '    "title": "string",',
    '    "action": "string",',
    '    "whyItHelps": "string",',
    '    "difficulty": "easy|moderate",',
    '    "nextCheckInDays": number',
    '  },',
    '  "toneCheck": {',
    '    "supportive": true,',
    '    "nonJudgmental": true,',
    '    "noShamingLanguage": true',
    '  }',
    '}',
    `Input summary: ${JSON.stringify(summary)}`
  ].join('\n');
}
