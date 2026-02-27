import type { McpUserSummary } from '../mcp/userSummary';

export const MEAL_PLAN_SCHEMA_VERSION = 'v1';

export function buildMealPlanningPrompt(userSummary: McpUserSummary): string {
  const summaryJson = JSON.stringify(userSummary);

  return [
    'You are a meal planning assistant for a wellness app.',
    'Create a practical 3-day meal plan and grocery list from the user summary.',
    'Use only the provided context and make reasonable, non-medical suggestions.',
    'Hard requirements:',
    '- Return strict JSON only.',
    '- No markdown, no code fences, no extra keys.',
    '- Exactly 3 day objects, with day values 1, 2, and 3.',
    '- Include reasoning as plain lifestyle rationale only.',
    '- Do not include medical advice, diagnosis, treatment, or health claims.',
    '- Keep output compact and deterministic in structure.',
    'Output JSON schema:',
    '{',
    '  "schemaVersion": "v1",',
    '  "days": [',
    '    {',
    '      "day": 1,',
    '      "meals": [',
    '        { "slot": "breakfast|lunch|dinner|snack", "name": "string", "portion": "string", "reason": "string" }',
    '      ]',
    '    }',
    '  ],',
    '  "groceryList": [',
    '    { "item": "string", "quantity": "string", "category": "produce|protein|grains|dairy|pantry|other" }',
    '  ],',
    '  "reasoning": {',
    '    "approach": "string",',
    '    "constraintsApplied": ["string"],',
    '    "safetyNote": "string"',
    '  }',
    '}',
    `Input summary: ${summaryJson}`
  ].join('\n');
}
