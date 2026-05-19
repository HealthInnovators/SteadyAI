'use client';

import { useRouter } from 'next/navigation';
import { GOAL_OPTIONS, OnboardingStepScaffold, OptionButton, useOnboarding } from '@/features/onboarding';

export default function GoalPage() {
  const router = useRouter();
  const { draft, setPrimaryGoal, clearError, error } = useOnboarding();

  return (
    <OnboardingStepScaffold
      stepKey="goal"
      title="What is your primary goal?"
      description="Choose one focus for your first phase."
      error={error}
      footer={
        <button
          type="button"
          onClick={() => {
            clearError();
            router.push('/onboarding/experience');
          }}
          disabled={!draft.primaryGoal}
          className="min-h-14 w-full rounded-full bg-[#1d140d] px-5 py-4 text-base font-semibold text-white shadow-[0_14px_36px_rgba(29,20,13,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#d8c4b3] disabled:text-[#7a6a5b] dark:bg-[#fff7ed] dark:text-[#1d140d] dark:disabled:bg-[#4a372b] dark:disabled:text-[#a8927c]"
        >
          Continue
        </button>
      }
    >
      {GOAL_OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={option}
          selected={draft.primaryGoal === option}
          onClick={() => setPrimaryGoal(option)}
        />
      ))}
    </OnboardingStepScaffold>
  );
}
