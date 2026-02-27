export interface ChallengeParticipationSummaryInput {
  challengeId?: string;
  weekLabel?: string;
  totalCheckIns: number;
  completedCount: number;
  partialCount: number;
  skippedCount: number;
}

export interface WeeklyReflectionResult {
  challengeId: string | null;
  weekLabel: string;
  metrics: {
    totalCheckIns: number;
    completedCount: number;
    partialCount: number;
    skippedCount: number;
    completionRate: number;
  };
  insights: string[];
  suggestion: string;
}

function clampCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

function normalizeInput(input: ChallengeParticipationSummaryInput): ChallengeParticipationSummaryInput {
  return {
    challengeId: input.challengeId,
    weekLabel: input.weekLabel,
    totalCheckIns: clampCount(input.totalCheckIns),
    completedCount: clampCount(input.completedCount),
    partialCount: clampCount(input.partialCount),
    skippedCount: clampCount(input.skippedCount)
  };
}

export function generateWeeklyReflection(input: ChallengeParticipationSummaryInput): WeeklyReflectionResult {
  const normalized = normalizeInput(input);
  const trackedTotal = Math.max(
    normalized.totalCheckIns,
    normalized.completedCount + normalized.partialCount + normalized.skippedCount
  );
  const effectiveCompleted = normalized.completedCount + normalized.partialCount;
  const completionRate = trackedTotal === 0 ? 0 : Number(((effectiveCompleted / trackedTotal) * 100).toFixed(1));

  const consistencyInsight =
    completionRate >= 80
      ? `You showed strong consistency this week with a ${completionRate}% completion rate.`
      : completionRate >= 50
        ? `You kept momentum this week with a ${completionRate}% completion rate and steady effort.`
        : `You still showed up this week, and every check-in builds momentum for next week.`;

  const winsInsight =
    normalized.completedCount > 0
      ? `You logged ${normalized.completedCount} fully completed day${normalized.completedCount === 1 ? '' : 's'}, which is meaningful progress.`
      : 'You may not have had a fully completed day yet, but your check-ins still show commitment.';

  const recoveryInsight =
    normalized.partialCount > 0
      ? `${normalized.partialCount} partial check-in${normalized.partialCount === 1 ? '' : 's'} show that you stayed engaged even on busy days.`
      : normalized.skippedCount > 0
        ? `You had ${normalized.skippedCount} skipped day${normalized.skippedCount === 1 ? '' : 's'}, and naming that honestly is a strong reset signal.`
        : 'You maintained a clean check-in pattern this week, which is a great base to keep building from.';

  const suggestion =
    completionRate >= 80
      ? 'Keep your current routine, and add one small stretch goal: complete your check-in at the same time each day.'
      : completionRate >= 50
        ? 'Choose one anchor habit for next week, and commit to a short check-in right after it to make consistency easier.'
        : 'Start with a lighter target next week: aim for one simple action per day and mark it as PARTIAL when time is tight.';

  return {
    challengeId: normalized.challengeId ?? null,
    weekLabel: normalized.weekLabel?.trim() || 'Current Week',
    metrics: {
      totalCheckIns: trackedTotal,
      completedCount: normalized.completedCount,
      partialCount: normalized.partialCount,
      skippedCount: normalized.skippedCount,
      completionRate
    },
    insights: [consistencyInsight, winsInsight, recoveryInsight],
    suggestion
  };
}
