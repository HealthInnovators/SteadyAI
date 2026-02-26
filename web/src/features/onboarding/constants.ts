export const GOAL_OPTIONS = [
  'Build consistency',
  'Improve nutrition habits',
  'Increase energy for daily life',
  'Stay accountable with community'
] as const;

export const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const;

export const DIET_OPTIONS = ['No preference', 'Vegetarian', 'Vegan', 'High protein', 'Low carb', 'Gluten free'] as const;

export const TIME_OPTIONS = ['10-15 minutes/day', '20-30 minutes/day', '30-45 minutes/day', '60+ minutes/day'] as const;

export const ONBOARDING_STEPS = [
  { key: 'goal', route: '/onboarding/goal' },
  { key: 'experience', route: '/onboarding/experience' },
  { key: 'diet', route: '/onboarding/diet' },
  { key: 'time', route: '/onboarding/time' }
] as const;
