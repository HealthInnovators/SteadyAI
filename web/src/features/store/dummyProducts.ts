import type { StoreProduct } from './types';

export const DUMMY_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'demo-meal-quickstart',
    name: '7-Day Meal Quickstart',
    description: 'Simple meal structure templates with grocery shortcuts for busy weekdays.',
    priceCents: 1900,
    currency: 'USD',
    whoItsFor: 'People who want low-friction meal planning with predictable shopping.',
    whoItsNotFor: 'Not for people seeking medical nutrition therapy or condition-specific treatment plans.'
  },
  {
    id: 'demo-habit-reset',
    name: 'Habit Reset Playbook',
    description: 'Step-by-step plan to recover after missed check-ins and rebuild consistency.',
    priceCents: 1500,
    currency: 'USD',
    whoItsFor: 'People restarting routines after lapses and wanting practical next actions.',
    whoItsNotFor: 'Not for users expecting crisis intervention or emergency support.'
  },
  {
    id: 'demo-community-starter',
    name: 'Community Starter Prompts',
    description: 'Prompt pack to write supportive posts, thoughtful questions, and check-in updates.',
    priceCents: 1200,
    currency: 'USD',
    whoItsFor: 'People who want easier ways to participate in community conversations.',
    whoItsNotFor: 'Not for users who want automated social posting or engagement bait.'
  },
  {
    id: 'demo-strength-basics',
    name: 'Strength Basics at Home',
    description: 'Foundational beginner strength sessions with progression notes and no-gym options.',
    priceCents: 2900,
    currency: 'USD',
    whoItsFor: 'Beginners building confidence with at-home strength training.',
    whoItsNotFor: 'Not for advanced lifters expecting highly specialized periodized programs.'
  },
  {
    id: 'demo-checkin-journal',
    name: 'Check-In Reflection Journal',
    description: 'Guided weekly prompts to turn daily check-ins into useful insights and decisions.',
    priceCents: 1400,
    currency: 'USD',
    whoItsFor: 'People who want to learn from patterns and stay accountable.',
    whoItsNotFor: 'Not for users wanting only passive tracking without reflection.'
  },
  {
    id: 'demo-grocery-budget',
    name: 'Budget Grocery Builder',
    description: 'Swap matrix and staple list to keep high-protein meals affordable every week.',
    priceCents: 1700,
    currency: 'USD',
    whoItsFor: 'People balancing nutrition goals with a strict grocery budget.',
    whoItsNotFor: 'Not for users looking for luxury ingredient-focused recipe curation.'
  }
];
