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
  const stepNumber = stepIndex + 1;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.95),_rgba(246,236,226,0.96)_36%,_#f4efe8_86%)] px-4 pb-[calc(1rem+var(--safe-bottom))] pt-[calc(1rem+var(--safe-top))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(74,55,43,0.82),_rgba(35,25,20,0.96)_42%,_#15100c_86%)] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-var(--safe-top)-var(--safe-bottom)-2rem)] w-full max-w-2xl flex-col">
        <header className="rounded-[34px] border border-white/80 bg-[#fffaf5]/88 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.1)] backdrop-blur dark:border-[#4a372b] dark:bg-[#231914]/88 dark:shadow-[0_18px_70px_rgba(0,0,0,0.3)] sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22] dark:text-[#f3c99f]">
              Step {stepNumber} of {ONBOARDING_STEPS.length}
            </p>
            <span className="rounded-full border border-[#ead9ca] bg-white/72 px-3 py-1 text-xs font-bold text-[#7a4b28] dark:border-[#4a372b] dark:bg-[#15100c]/72 dark:text-[#f3c99f]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#ead9ca] dark:bg-[#4a372b]">
            <div className="h-full rounded-full bg-[#1d140d] transition-all duration-300 dark:bg-[#f3c99f]" style={{ width: `${progress}%` }} />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.05em] text-[#1d140d] dark:text-[#fff7ed] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-[#5f5145] dark:text-[#d6c2ae]">{description}</p>
        </header>

        <section className="flex flex-1 flex-col gap-3 py-5 sm:py-6">{children}</section>

        {error ? (
          <p className="mb-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        {footer ? (
          <footer className="sticky bottom-0 -mx-4 mt-auto border-t border-white/70 bg-[#f4efe8]/88 px-4 pb-[calc(0.75rem+var(--safe-bottom))] pt-3 backdrop-blur dark:border-[#4a372b] dark:bg-[#15100c]/88 sm:-mx-6 sm:px-6">
            <div className="mx-auto max-w-2xl">{footer}</div>
          </footer>
        ) : null}
      </div>
    </main>
  );
}
