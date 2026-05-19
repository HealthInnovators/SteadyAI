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
            className="min-h-14 w-full rounded-full border border-[#d8c4b3] bg-white/72 px-5 py-4 text-base font-semibold text-[#4e4035] transition active:scale-[0.99] dark:border-[#4a372b] dark:bg-[#231914] dark:text-[#fff7ed]"
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
            className="min-h-14 w-full rounded-full bg-[#1d140d] px-5 py-4 text-base font-semibold text-white shadow-[0_14px_36px_rgba(29,20,13,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#d8c4b3] disabled:text-[#7a6a5b] dark:bg-[#fff7ed] dark:text-[#1d140d] dark:disabled:bg-[#4a372b] dark:disabled:text-[#a8927c]"
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
