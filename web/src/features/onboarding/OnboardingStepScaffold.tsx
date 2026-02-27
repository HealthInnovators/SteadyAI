'use client';

import { ONBOARDING_STEPS } from './constants';
import type { ReactNode } from 'react';

interface OnboardingStepScaffoldProps {
  stepKey: (typeof ONBOARDING_STEPS)[number]['key'];
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  error?: string | null;
}

export function OnboardingStepScaffold({
  stepKey,
  title,
  description,
  children,
  footer,
  error
}: OnboardingStepScaffoldProps) {
  const stepIndex = ONBOARDING_STEPS.findIndex((step) => step.key === stepKey);
  const progress = stepIndex === -1 ? 0 : ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm text-gray-500">Step {stepIndex + 1} of {ONBOARDING_STEPS.length}</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-black" style={{ width: `${progress}%` }} />
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-600">{description}</p>
      </header>

      <section className="flex flex-1 flex-col gap-3">{children}</section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {footer ? <footer className="mt-auto">{footer}</footer> : null}
    </main>
  );
}
