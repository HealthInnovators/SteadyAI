import type { AgentType, ChatMessage, ReasoningStep } from './types';

export function buildAgentReply(agent: AgentType, prompt: string): ChatMessage {
  const normalizedPrompt = prompt.trim().slice(0, 240);
  const createdAt = new Date().toISOString();

  if (agent === 'MEAL_PLANNER') {
    return {
      id: `agent-${createdAt}`,
      role: 'agent',
      createdAt,
      text: 'I can draft a 3-day meal structure with a concise grocery list based on your constraints.',
      reasoning: [
        reasoning('Input parsed', `Captured request focus: "${normalizedPrompt || 'no details provided'}".`),
        reasoning('Plan strategy', 'Prioritized repeatable meals to reduce prep load and improve consistency.'),
        reasoning('Safety', 'Excluded medical claims and kept guidance educational.')
      ]
    };
  }

  if (agent === 'HABIT_COACH') {
    return {
      id: `agent-${createdAt}`,
      role: 'agent',
      createdAt,
      text: 'I can generate a weekly reflection and one manageable habit adjustment for next week.',
      reasoning: [
        reasoning('Tone', 'Used supportive, non-judgmental language.'),
        reasoning('Scope', 'Focused on one adjustment to keep behavior change realistic.'),
        reasoning('Safety', 'No medical recommendations or diagnosis content.')
      ]
    };
  }

  return {
    id: `agent-${createdAt}`,
    role: 'agent',
    createdAt,
    text: 'I can suggest one post idea and two peer outreach prompts to encourage meaningful engagement.',
    reasoning: [
      reasoning('Engagement', 'Selected low-pressure actions to lower posting friction.'),
      reasoning('Bias guard', 'Avoided popularity ranking or follower-style recommendations.'),
      reasoning('Safety', 'Kept output informational and non-medical.')
    ]
  };
}

function reasoning(title: string, detail: string): ReasoningStep {
  return { title, detail };
}
