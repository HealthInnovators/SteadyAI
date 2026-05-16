'use client';

import { useAuth } from '@/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const benefits = [
  {
    title: 'A coach that remembers your goals',
    description:
      'SteadyAI keeps your fitness, nutrition, check-ins, and weekly progress in one place so every recommendation starts with your real context.'
  },
  {
    title: 'Simple plans you can actually follow',
    description:
      'Get practical workouts, meal guidance, and next-step suggestions designed around your time, equipment, preferences, and consistency.'
  },
  {
    title: 'Progress without spreadsheet work',
    description:
      'Log workouts, meals, and reflections quickly, then review trends and reports that explain what is improving and what to adjust next.'
  }
];

const productModules = [
  {
    title: 'Fitness coaching',
    description: 'Build low-impact, no-equipment, strength, mobility, or habit-focused workout plans with clear exercise guidance.',
    image: '/illustrations/workout-flow.svg'
  },
  {
    title: 'Nutrition support',
    description: 'Track meals, estimate nutrition, understand patterns, and get practical suggestions without turning food into homework.',
    image: '/illustrations/nutrition-board.svg'
  },
  {
    title: 'Weekly reports',
    description: 'See a plain-language summary of your workouts, meals, check-ins, and community activity so you know what to do next.',
    image: '/illustrations/coach-orbit.svg'
  },
  {
    title: 'Community momentum',
    description: 'Use guided check-ins and supportive prompts to stay accountable without noisy feeds or pressure tactics.',
    image: '/illustrations/community-pulse.svg'
  }
];

const reasons = [
  'You want a health app that feels conversational instead of complicated.',
  'You want coaching that adapts to your routine, not a generic PDF plan.',
  'You want one place for workouts, nutrition, check-ins, and reports.',
  'You want a steady habit system, not guilt, streak pressure, or unrealistic goals.'
];

export default function PublicHomePage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isHydrated, router]);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.95),_rgba(246,236,226,0.9)_34%,_#f4efe8_72%)] text-[#1d140d]">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="w-fit rounded-full border border-[#d9b991] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8a4b22]">
            Fitness, nutrition, and accountability
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#1d140d] sm:text-6xl lg:text-7xl">
            Turn good intentions into a steady health routine.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f5145] sm:text-xl">
            SteadyAI helps you plan workouts, understand nutrition, log progress, and get weekly coaching insights from one personalized health companion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full bg-[#1d140d] px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(29,20,13,0.22)] transition hover:-translate-y-0.5 hover:bg-[#33251a]"
            >
              Start your SteadyAI plan
            </Link>
            <Link
              href="#how-it-helps"
              className="inline-flex items-center justify-center rounded-full border border-[#cda77f] bg-white/65 px-8 py-4 text-sm font-semibold text-[#1d140d] transition hover:-translate-y-0.5 hover:bg-white"
            >
              See how it helps
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#6d5b4d]">
            Create an account to unlock your dashboard, coaching tools, and personal progress history.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#e78d3c]/20 blur-3xl" />
          <div className="absolute -bottom-12 left-0 h-52 w-52 rounded-full bg-[#7dbb8f]/20 blur-3xl" />
          <div className="relative rounded-[40px] border border-white/70 bg-[#fffaf5]/85 p-5 shadow-[0_32px_120px_rgba(80,48,24,0.16)] backdrop-blur">
            <div className="rounded-[30px] bg-[#1d140d] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#f3c99f]">Today&apos;s focus</p>
                  <h2 className="mt-2 text-2xl font-semibold">20 minutes. One clear plan.</h2>
                </div>
                <div className="rounded-2xl bg-white/12 px-4 py-3 text-center">
                  <p className="text-3xl font-semibold">87%</p>
                  <p className="text-xs text-[#f6d7b9]">weekly consistency</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {['Low-impact workout', 'Protein-forward dinner idea', 'Evening check-in prompt'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3c99f] text-sm font-bold text-[#1d140d]">
                      {index + 1}
                    </span>
                    <span className="text-sm text-[#fff6ee]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] bg-white p-5">
                <p className="text-sm font-semibold text-[#8a4b22]">Ask in ChatGPT</p>
                <p className="mt-2 text-sm leading-6 text-[#5f5145]">
                  Request a workout, nutrition idea, or progress summary and let SteadyAI use your saved context.
                </p>
              </div>
              <div className="rounded-[26px] bg-[#f4e3cf] p-5">
                <p className="text-sm font-semibold text-[#8a4b22]">Review in the app</p>
                <p className="mt-2 text-sm leading-6 text-[#5f5145]">
                  Open your dashboard for logs, reports, preferences, community prompts, and next actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-helps" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-[30px] border border-white/75 bg-white/72 p-6 shadow-[0_18px_70px_rgba(80,48,24,0.08)]">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">{benefit.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#5f5145]">{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#8a4b22]">Why log in?</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            Because the useful coaching starts when SteadyAI knows your context.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#5f5145]">
            The public site can explain the product. Your signed-in account is where SteadyAI becomes personal: goals, preferences, progress, saved plans, nutrition entries, check-ins, and reports.
          </p>
          <Link
            href="/sign-in"
            className="mt-7 inline-flex rounded-full bg-[#1d140d] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#33251a]"
          >
            Create your account
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {productModules.map((module) => (
            <article key={module.title} className="overflow-hidden rounded-[32px] border border-white/75 bg-[#fffaf5]/82 shadow-[0_18px_70px_rgba(80,48,24,0.08)]">
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#f7dcc0] to-[#eef0dd] p-6">
                <img src={module.image} alt="" className="h-full max-h-32 w-full object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">{module.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f5145]">{module.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[40px] border border-[#e6cbb0] bg-[#1d140d] p-6 text-white shadow-[0_30px_100px_rgba(29,20,13,0.22)] sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#f3c99f]">Built for real life</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em]">
              Use SteadyAI when you need a plan, a reset, or a clear next step.
            </h2>
          </div>
          <div className="grid gap-3">
            {reasons.map((reason) => (
              <div key={reason} className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-[#fff6ee]">
                {reason}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#8a4b22]">Start steady</p>
        <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
          Sign in once. Build your plan. Let SteadyAI help you keep going.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#5f5145]">
          Your account unlocks the dashboard, coaching history, saved preferences, nutrition and workout tracking, weekly reports, and ChatGPT app context.
        </p>
        <div className="mt-8">
          <Link
            href="/sign-in"
            className="inline-flex rounded-full bg-[#1d140d] px-9 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(29,20,13,0.22)] transition hover:-translate-y-0.5 hover:bg-[#33251a]"
          >
            Sign up for SteadyAI
          </Link>
        </div>
      </section>
    </main>
  );
}
