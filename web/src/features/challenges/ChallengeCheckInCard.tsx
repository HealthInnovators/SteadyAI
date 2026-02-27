'use client';

import { createApiClient } from '@/lib/api';
import { useMemo, useState } from 'react';
import { submitChallengeCheckIn } from './api';
import type { ChallengeCheckInResponse, ChallengeCheckInStatus } from './types';

const CHECK_IN_ACTIONS: Array<{ status: ChallengeCheckInStatus; label: string }> = [
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'PARTIAL', label: 'Partial' },
  { status: 'SKIPPED', label: 'Skipped' }
];

interface ChallengeCheckInCardProps {
  token: string | null;
}

export function ChallengeCheckInCard({ token }: ChallengeCheckInCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStatus, setActiveStatus] = useState<ChallengeCheckInStatus | null>(null);
  const [summary, setSummary] = useState<ChallengeCheckInResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const api = useMemo(() => createApiClient(() => token || undefined), [token]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Daily challenge check-in</h2>
        <p className="text-sm text-gray-600">Choose what fits today. Progress includes partial days and resets.</p>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {CHECK_IN_ACTIONS.map((action) => {
          const isActive = activeStatus === action.status;

          return (
            <button
              key={action.status}
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                setError(null);

                try {
                  const response = await submitChallengeCheckIn(api, { status: action.status });
                  setSummary(response);
                  setActiveStatus(action.status);
                } catch (submissionError) {
                  setError(submissionError instanceof Error ? submissionError.message : 'Failed to submit check-in.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                isActive ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-900'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isSubmitting && isActive ? 'Saving...' : action.label}
            </button>
          );
        })}
      </div>

      {summary ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">Check-in saved.</p>
          <p className="mt-1 text-sm text-emerald-900">{supportiveCopy(activeStatus)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-emerald-900 sm:grid-cols-4">
            <p>Total: {summary.counts.total}</p>
            <p>Completed: {summary.counts.completed}</p>
            <p>Partial: {summary.counts.partial}</p>
            <p>Skipped: {summary.counts.skipped}</p>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}

function supportiveCopy(status: ChallengeCheckInStatus | null): string {
  switch (status) {
    case 'COMPLETED':
      return 'Nice work. You followed through today and that consistency compounds.';
    case 'PARTIAL':
      return 'Good progress. Partial effort still supports your long-term momentum.';
    case 'SKIPPED':
      return 'Thanks for checking in. Tomorrow is a fresh step, and this still keeps your streak of awareness.';
    default:
      return 'Your check-in helps keep your plan grounded in real life.';
  }
}
