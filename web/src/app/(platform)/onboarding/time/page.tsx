'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepScaffold, OptionButton, TIME_OPTIONS, useOnboarding } from '@/features/onboarding';

export default function TimePage() {
  const router = useRouter();
  const { draft, setTimeAvailability, submit, isSubmitting, clearError, error } = useOnboarding();

  useEffect(() => {
    if (!draft.primaryGoal) {
      router.replace('/onboarding/goal');
      return;
    }

    if (!draft.experienceLevel) {
      router.replace('/onboarding/experience');
      return;
    }
  }, [draft.experienceLevel, draft.primaryGoal, router]);

  return (
    <OnboardingStepScaffold
      stepKey="time"
      title="How much time can you commit each day?"
      description="This sets plan intensity and pacing."
      error={error}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              clearError();
              router.push('/onboarding/diet');
            }}
            disabled={isSubmitting}
            className="min-h-14 w-full rounded-full border border-[#d8c4b3] bg-white/72 px-5 py-4 text-base font-semibold text-[#4e4035] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#4a372b] dark:bg-[#231914] dark:text-[#fff7ed]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await submit();
                router.replace('/ai-coach');
              } catch {
                // Error state is handled in onboarding context.
              }
            }}
            disabled={!draft.timeAvailability || isSubmitting}
            className="min-h-14 w-full rounded-full bg-[#1d140d] px-5 py-4 text-base font-semibold text-white shadow-[0_14px_36px_rgba(29,20,13,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#d8c4b3] disabled:text-[#7a6a5b] dark:bg-[#fff7ed] dark:text-[#1d140d] dark:disabled:bg-[#4a372b] dark:disabled:text-[#a8927c]"
          >
            {isSubmitting ? 'Submitting...' : 'Finish'}
          </button>
        </div>
      }
    >
      {TIME_OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={option}
          selected={draft.timeAvailability === option}
          onClick={() => setTimeAvailability(option)}
        />
      ))}
    </OnboardingStepScaffold>
  );
}
