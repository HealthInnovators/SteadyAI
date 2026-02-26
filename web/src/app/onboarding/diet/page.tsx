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
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              clearError();
              router.push('/onboarding/time');
            }}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
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
