'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DIET_OPTIONS, OnboardingStepScaffold, OptionButton, useOnboarding } from '@/features/onboarding';

export default function DietPage() {
  const router = useRouter();
  const { draft, toggleDietaryPreference, clearError, error } = useOnboarding();

  useEffect(() => {
    if (!draft.primaryGoal) {
      router.replace('/onboarding/goal');
      return;
    }

    if (!draft.experienceLevel) {
      router.replace('/onboarding/experience');
    }
  }, [draft.experienceLevel, draft.primaryGoal, router]);

  return (
    <OnboardingStepScaffold
      stepKey="diet"
      title="Any dietary preferences?"
      description="Select one or more options, or skip if none apply."
      error={error}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              clearError();
              router.push('/onboarding/experience');
            }}
            className="min-h-14 w-full rounded-full border border-[#d8c4b3] bg-white/72 px-5 py-4 text-base font-semibold text-[#4e4035] transition active:scale-[0.99] dark:border-[#4a372b] dark:bg-[#231914] dark:text-[#fff7ed]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              clearError();
              router.push('/onboarding/time');
            }}
            className="min-h-14 w-full rounded-full bg-[#1d140d] px-5 py-4 text-base font-semibold text-white shadow-[0_14px_36px_rgba(29,20,13,0.18)] transition active:scale-[0.99] dark:bg-[#fff7ed] dark:text-[#1d140d]"
          >
            Continue
          </button>
        </div>
      }
    >
      {DIET_OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={option}
          selected={draft.dietaryPreferences.includes(option)}
          onClick={() => toggleDietaryPreference(option)}
        />
      ))}
    </OnboardingStepScaffold>
  );
}
