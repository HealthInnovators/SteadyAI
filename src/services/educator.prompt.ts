import type { EducatorInput, EducatorMythCorrectionInput } from './types';

export function buildLessonPrompt(input: EducatorInput): string {
  return [
    `Question: ${input.userQuestion}`,
    input.threadContext ? `Thread context: ${input.threadContext}` : '',
    'Return a concise educational answer with practical, non-medical guidance.'
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildMythCorrectionPrompt(input: EducatorMythCorrectionInput): string {
  return [
    `Community post: ${input.communityPostText}`,
    input.threadContext ? `Thread context: ${input.threadContext}` : '',
    'Return JSON with suggestedCorrection, context, and citations.'
  ]
    .filter(Boolean)
    .join('\n');
}
