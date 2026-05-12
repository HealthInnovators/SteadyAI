import { createLlmClientFromEnv } from './llm';
import { EducatorInput, EducatorResult, EducatorMythCorrectionInput, EducatorMythCorrectionResult, MythCitation } from './types';
import { buildLessonPrompt, buildMythCorrectionPrompt } from './educator.prompt';
import { asObject, getString, parseJsonObject } from '../utils/json';
import { compactText } from '../utils/text';

const MAX_WORDS = 250;
const DISCLAIMER = 'Disclaimer: This is general educational information, not medical advice. For diagnosis or treatment, consult a licensed clinician.';

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
  const normalized = normalizeText(text);
  if (!normalized) {
    return 0;
  }
  return normalized.split(' ').length;
}

function truncateToWords(text: string, maxWords: number): string {
  const normalized = normalizeText(text);
  if (!normalized) {
    return normalized;
  }
  const words = normalized.split(' ');
  if (words.length <= maxWords) {
    return `${words.slice(0, maxWords).join(' ')}...`;
  }
  return normalized;
}

function enforceConstraints(content: string): { lesson: string; wordCount: number } {
  const core = normalizeText(content);
  // Corrected regex to handle potential special characters in DISCLAIMER
  const escapedDisclaimer = DISCLAIMER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const disclaimerRegex = new RegExp(`${escapedDisclaimer}$`);
  const coreWithoutDisclaimer = core.replace(disclaimerRegex, '').trim();
  const availableWords = Math.max(40, MAX_WORDS - countWords(DISCLAIMER));
  const trimmedCore = truncateToWords(coreWithoutDisclaimer, availableWords);
  const combined = normalizeText(`${trimmedCore} ${DISCLAIMER}`);

  return {
    lesson: truncateToWords(combined, MAX_WORDS),
    wordCount: Math.min(countWords(combined), MAX_WORDS)
  };
}

function buildEvidenceBasis(userQuestion: string, threadContext?: string): string[] {
  const text = `${userQuestion} ${threadContext ?? ''}`.toLowerCase();
  const items: string[] = [];

  if (/(sleep|rest|recover)/.test(text)) {
    items.push('sleep regularity and recovery principles');
  }
  if (/(protein|diet|meal|nutrition|calorie)/.test(text)) {
    items.push('basic sports nutrition and energy balance principles');
  }
  if (/(strength|muscle|workout|training|exercise)/.test(text)) {
    items.push('progressive overload and training consistency principles');
  }
  if (/(habit|routine|motivation|consisten)/.test(text)) {
    items.push('behavior-change consistency and cue-based habit formation');
  }

  if (items.length === 0) {
    items.push('general evidence-based health behavior and coaching principles');
  }

  return items.slice(0, 3);
}

function sanitizeNonConfrontational(text: string): string {
  return text
    .replace(/\byou are wrong\b/gi, 'this may be incomplete')
    .replace(/\bthat is wrong\b/gi, 'that may be incomplete')
    .replace(/\bmyth\b/gi, 'common misconception')
    .replace(/\bfalse\b/gi, 'not well-supported');
}

function citationPoolFor(text: string): MythCitation[] {
  const normalized = text.toLowerCase();
  const citations: MythCitation[] = [];

  if (/(protein|nutrition|calorie|diet|meal)/.test(normalized)) {
    citations.push(
      { title: 'ISSN Position Stand: Diets and Body Composition', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/' },
      { title: 'Dietary Guidelines for Americans', url: 'https://www.dietaryguidelines.gov/' }
    );
  }

  if (/(strength|muscle|training|exercise|workout)/.test(normalized)) {
    citations.push(
      { title: 'ACSM Position Stand on Progression Models in Resistance Training', url: 'https://pubmed.ncbi.nlm.nih.gov/19204579/' },
      { title: 'WHO Physical Activity Guidelines', url: 'https://www.who.int/publications/i/item/9789240015128' }
    );
  }

  if (/(sleep|recovery|rest)/.test(normalized)) {
    citations.push({ title: 'CDC Sleep and Sleep Disorders', url: 'https://www.cdc.gov/sleep/' });
  }

  if (citations.length === 0) {
    citations.push(
      { title: 'WHO Fact Sheets', url: 'https://www.who.int/news-room/fact-sheets' },
      { title: 'CDC Healthy Living', url: 'https://www.cdc.gov/healthy-weight-growth/' }
    );
  }

  return citations.slice(0, 3);
}

function buildFallbackLesson(input: EducatorInput, evidenceBasis: string[]): string {
  const question = normalizeText(input.userQuestion);
  const context = normalizeText(input.threadContext ?? '');

  const lessonCore = [
    `You asked: "${question}".`,
    context ? `Context considered: ${context}.` : '',
    'A practical evidence-based approach is to pick one small action you can repeat daily, measure it, and adjust weekly.',
    'Focus first on consistency before intensity: repeated moderate effort usually produces better long-term results than short bursts of extreme effort.',
    'Use a simple loop: plan one action, complete it, log the result, and review patterns every 7 days.',
    `Evidence lens: ${evidenceBasis.join(', ')}.`
  ]
    .filter(Boolean)
    .join(' ');

  return lessonCore;
}

function buildFallbackMythCorrection(input: EducatorMythCorrectionInput): EducatorMythCorrectionResult {
  const citations = citationPoolFor(`${input.communityPostText} ${input.threadContext ?? ''}`);
  const suggestedCorrection = sanitizeNonConfrontational(
    'Thanks for sharing this perspective. A gentle clarification is that results usually come from consistent habits, progressive training, and overall nutrition patterns rather than one single rule.'
  );
  const context = sanitizeNonConfrontational(
    `Community context: "${normalizeText(input.communityPostText)}". A supportive response can acknowledge effort first, then offer practical evidence-aligned guidance and invite discussion.`
  );

  return {
    suggestedCorrection,
    context,
    citations,
    disclaimer: DISCLAIMER,
    provider: 'fallback'
  };
}

export async function getEducatorHelp(options: { userId: string; topic: string; question: string }): Promise<{ response: string; citations: any[] }> {
  // This is a placeholder to align with the new structure.
  const result = await generateEducatorLesson({
    userQuestion: options.question,
    threadContext: options.topic,
  });
  return { response: result.lesson, citations: [] };
}

export async function generateEducatorLesson(input: EducatorInput): Promise<EducatorResult> {
  const evidenceBasis = buildEvidenceBasis(input.userQuestion, input.threadContext);
  const fallbackCore = buildFallbackLesson(input, evidenceBasis);
  const llm = createLlmClientFromEnv();
  const systemPrompt =
    'You are an expert educator, coach, and trainer. Return only a short lesson. Do not use shaming language. Do not offer medical advice. Do not refer to yourself as an AI. Keep response to less than 220 words.';

  try {
    const response = await llm.generateText({
      prompt: buildLessonPrompt(input),
      systemPrompt,
      temperature: 0.1,
      maxOutputTokens: 700
    });

    const constrained = enforceConstraints(response);
    return {
      lesson: constrained.lesson,
      wordCount: constrained.wordCount,
      disclaimer: DISCLAIMER,
      evidenceBasis,
      provider: 'llm'
    };
  } catch {
    const constrained = enforceConstraints(fallbackCore);
    return {
      lesson: constrained.lesson,
      wordCount: constrained.wordCount,
      disclaimer: DISCLAIMER,
      evidenceBasis,
      provider: 'fallback'
    };
  }
}

export async function generateMythCorrection(input: EducatorMythCorrectionInput): Promise<EducatorMythCorrectionResult> {
  const fallback = buildFallbackMythCorrection(input);
  const llm = createLlmClientFromEnv();
  const systemPrompt =
    'Use supportive language only. Avoid confrontational terms. Output strict JSON only.';

  try {
    const response = await llm.generateText({
      prompt: buildMythCorrectionPrompt(input),
      systemPrompt,
      temperature: 0.15,
      maxOutputTokens: 500
    });

    const parsed = parseJsonObject(response);
    const suggestedCorrection = sanitizeNonConfrontational(
      getString(parsed.suggestedCorrection, fallback.suggestedCorrection)
    );
    const context = sanitizeNonConfrontational(getString(parsed.context, fallback.context));

    const citationValue = Array.isArray(parsed.citations) ? parsed.citations : [];
    const citations = citationValue
      .map((item) => asObject(item))
      .map((item) => ({
        title: getString(item.title, ''),
        url: getString(item.url, '')
      }))
      .filter((item) => item.title && /^https?:\/\//.test(item.url))
      .slice(0, 3);

    return {
      suggestedCorrection,
      context,
      citations: citations.length > 0 ? citations : fallback.citations,
      disclaimer: DISCLAIMER,
      provider: 'llm'
    };
  } catch {
    return fallback;
  }
}
