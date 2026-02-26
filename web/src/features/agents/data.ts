import type { AgentDefinition } from './types';

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
