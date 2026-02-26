'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EXPERIENCE_OPTIONS, OnboardingStepScaffold, OptionButton, useOnboarding } from '@/features/onboarding';

export default function ExperiencePage() {
  const router = useRouter();
  const { draft, setExperienceLevel, clearError, error } = useOnboarding();

  useEffect(() => {
    if (!draft.primaryGoal) {
      router.replace('/onboarding/goal');
    }
  }, [draft.primaryGoal, router]);

  return (
    <OnboardingStepScaffold
      stepKey="experience"
      title="How would you describe your experience level?"
      description="This helps Steady AI shape your first plan."
      error={error}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              clearError();
              router.push('/onboarding/goal');
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              clearError();
              router.push('/onboarding/diet');
            }}
            disabled={!draft.experienceLevel}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Continue
          </button>
        </div>
      }
    >
      {EXPERIENCE_OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={option}
          selected={draft.experienceLevel === option}
          onClick={() => setExperienceLevel(option)}
        />
      ))}
    </OnboardingStepScaffold>
  );
}
