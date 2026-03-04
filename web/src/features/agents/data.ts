import type { AgentDefinition } from './types';
import type { AgentType } from './types';

export const AGENTS: AgentDefinition[] = [
  {
    id: 'MEAL_PLANNER',
    label: 'Meal Planner',
    subtitle: 'Builds practical meal structure and shopping guidance.'
  },
  {
    id: 'HABIT_COACH',
    label: 'Habit Coach',
    subtitle: 'Creates supportive reflection and habit adjustment prompts.'
  },
  {
    id: 'COMMUNITY_GUIDE',
    label: 'Community Guide',
    subtitle: 'Suggests low-pressure community engagement ideas.'
  }
];

export const AGENT_DISCLAIMER =
  'Steady AI responses are educational and supportive. They are not medical advice, diagnosis, or treatment.';

export const STARTER_PROMPTS: Record<AgentType, string[]> = {
  MEAL_PLANNER: [
    'Plan a simple 3-day high-protein meal plan with quick dinners.',
    'Build a beginner-friendly 3-day meal plan and grocery list.',
    'Suggest post-workout dinner ideas for evening training days.'
  ],
  HABIT_COACH: [
    'I missed check-ins this week. Give me a simple restart plan.',
    'Help me set a 10-minute daily habit for the next 7 days.',
    'Give me one habit adjustment I can sustain this week.'
  ],
  COMMUNITY_GUIDE: [
    'Suggest one low-pressure post idea I can share today.',
    'Draft a supportive CHECK_IN post about a small win.',
    'Give me one peer outreach message I can send today.'
  ]
};
