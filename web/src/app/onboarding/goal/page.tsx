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
          className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
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
