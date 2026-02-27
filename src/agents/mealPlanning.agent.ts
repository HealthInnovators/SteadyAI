import type { McpUserSummary } from '../mcp/userSummary';
import { createLlmClientFromEnv } from '../services/llm';
import { buildMealPlanningPrompt, MEAL_PLAN_SCHEMA_VERSION } from './mealPlanning.prompt';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type GroceryCategory = 'produce' | 'protein' | 'grains' | 'dairy' | 'pantry' | 'other';

export interface MealPlanMeal {
  slot: MealSlot;
  name: string;
  portion: string;
  reason: string;
}

export interface MealPlanDay {
  day: 1 | 2 | 3;
  meals: MealPlanMeal[];
}

export interface GroceryListItem {
  item: string;
  quantity: string;
  category: GroceryCategory;
}

export interface MealPlanningResult {
  schemaVersion: 'v1';
  days: MealPlanDay[];
  groceryList: GroceryListItem[];
  reasoning: {
    approach: string;
    constraintsApplied: string[];
    safetyNote: string;
  };
}

const VALID_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const VALID_GROCERY_CATEGORIES: GroceryCategory[] = ['produce', 'protein', 'grains', 'dairy', 'pantry', 'other'];
const UNSUPPORTIVE_TERMS = ['strict', 'perfect', 'failure', 'bad', 'lazy', 'guilt', 'punish'];

function compactText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function supportiveText(value: unknown, fallback: string): string {
  const base = compactText(value, fallback);
  let cleaned = base;
  for (const term of UNSUPPORTIVE_TERMS) {
    const pattern = new RegExp(`\\b${term}\\b`, 'gi');
    cleaned = cleaned.replace(pattern, 'steady');
  }
  return cleaned;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function parseJsonObject(input: string): Record<string, unknown> {
  const trimmed = input.trim();
  try {
    return asObject(JSON.parse(trimmed));
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return asObject(JSON.parse(trimmed.slice(start, end + 1)));
    }
    throw new Error('Meal planning response is not valid JSON');
  }
}

function normalizeMeals(value: unknown): MealPlanMeal[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: MealPlanMeal[] = [];
  for (const item of value) {
    const source = asObject(item);
    const slotRaw = compactText(source.slot, '');
    const slot = VALID_SLOTS.includes(slotRaw as MealSlot) ? (slotRaw as MealSlot) : null;
    if (!slot) {
      continue;
    }

    normalized.push({
      slot,
      name: compactText(source.name, 'Simple meal option'),
      portion: compactText(source.portion, '1 serving'),
      reason: supportiveText(source.reason, 'Supportive fit for your goals, preferences, and schedule')
    });
  }

  return normalized;
}

function normalizeDays(value: unknown): MealPlanDay[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: MealPlanDay[] = [];
  for (const day of value) {
    const source = asObject(day);
    const dayNumber = Number(source.day);
    if (![1, 2, 3].includes(dayNumber)) {
      continue;
    }

    result.push({
      day: dayNumber as 1 | 2 | 3,
      meals: normalizeMeals(source.meals)
    });
  }

  return result
    .sort((a, b) => a.day - b.day)
    .filter((d, index, arr) => arr.findIndex((x) => x.day === d.day) === index);
}

function normalizeGroceryList(value: unknown): GroceryListItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: GroceryListItem[] = [];
  for (const item of value) {
    const source = asObject(item);
    const categoryRaw = compactText(source.category, 'other');
    const category = VALID_GROCERY_CATEGORIES.includes(categoryRaw as GroceryCategory)
      ? (categoryRaw as GroceryCategory)
      : 'other';

    const name = compactText(source.item, 'item');
    const quantity = compactText(source.quantity, '1');
    items.push({ item: name, quantity, category });
  }

  return items;
}

function buildDeterministicFallback(summary: McpUserSummary): MealPlanningResult {
  const preferenceHint = summary.profile.dietaryPreferences[0] ?? 'balanced';

  const days: MealPlanDay[] = [1, 2, 3].map((day) => ({
    day: day as 1 | 2 | 3,
    meals: [
      {
        slot: 'breakfast',
        name: `${preferenceHint} oatmeal bowl`,
        portion: '1 bowl',
        reason: 'Simple start that supports steady energy and a manageable morning routine.'
      },
      {
        slot: 'lunch',
        name: 'grain bowl with mixed vegetables and protein',
        portion: '1 plate',
        reason: 'Easy to prep and repeat, helping you stay consistent on busy days.'
      },
      {
        slot: 'dinner',
        name: 'stir-fry with vegetables and protein',
        portion: '1 plate',
        reason: 'Flexible ingredients make this easier to adapt to your schedule and preferences.'
      },
      {
        slot: 'snack',
        name: 'fruit and nuts',
        portion: '1 small serving',
        reason: 'Convenient option that supports steady momentum between meals.'
      }
    ]
  }));

  return {
    schemaVersion: 'v1',
    days,
    groceryList: [
      { item: 'rolled oats', quantity: '1 bag', category: 'grains' },
      { item: 'mixed vegetables', quantity: '6 cups', category: 'produce' },
      { item: 'protein source (beans/tofu/chicken)', quantity: '6 servings', category: 'protein' },
      { item: 'fruit', quantity: '9 pieces', category: 'produce' },
      { item: 'nuts or seeds', quantity: '1 pack', category: 'pantry' },
      { item: 'olive oil', quantity: '1 bottle', category: 'pantry' }
    ],
    reasoning: {
      approach: 'Focus on simple repeatable meals that fit your goal, preferences, and schedule in a realistic way.',
      constraintsApplied: ['3-day plan', 'compact grocery list', 'non-medical language only'],
      safetyNote: 'For planning support only; not medical guidance. You can adjust portions and ingredients based on your comfort and needs.'
    }
  };
}

function normalizeResult(raw: Record<string, unknown>, fallback: MealPlanningResult): MealPlanningResult {
  const days = normalizeDays(raw.days);
  const groceryList = normalizeGroceryList(raw.groceryList);
  const reasoning = asObject(raw.reasoning);

  if (days.length !== 3) {
    return fallback;
  }

  return {
    schemaVersion: MEAL_PLAN_SCHEMA_VERSION,
    days,
    groceryList: groceryList.length > 0 ? groceryList : fallback.groceryList,
    reasoning: {
      approach: supportiveText(reasoning.approach, fallback.reasoning.approach),
      constraintsApplied: Array.isArray(reasoning.constraintsApplied)
        ? reasoning.constraintsApplied
            .map((x) => compactText(x, ''))
            .filter((x) => x.length > 0)
            .slice(0, 12)
        : fallback.reasoning.constraintsApplied,
      safetyNote: supportiveText(reasoning.safetyNote, fallback.reasoning.safetyNote)
    }
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter((x) => x.length > 0);
}

function asMcpSummary(input: unknown): McpUserSummary {
  const source = asObject(input);
  const profile = asObject(source.profile);
  const challengeActivity = asObject(source.challengeActivity);
  const communityEngagement = asObject(source.communityEngagement);
  const purchaseHistory = asObject(source.purchaseHistory);
  const checkIns = asObject(challengeActivity.checkIns);

  return {
    schemaVersion: 'v1',
    generatedAt: compactText(source.generatedAt, new Date().toISOString()),
    userId: compactText(source.userId, 'unknown-user'),
    profile: {
      onboardingCompleted: Boolean(profile.onboardingCompleted),
      primaryGoal: typeof profile.primaryGoal === 'string' ? compactText(profile.primaryGoal, '') || null : null,
      experienceLevel: typeof profile.experienceLevel === 'string' ? compactText(profile.experienceLevel, '') || null : null,
      dietaryPreferences: toStringArray(profile.dietaryPreferences),
      timeAvailability: typeof profile.timeAvailability === 'string' ? compactText(profile.timeAvailability, '') || null : null
    },
    challengeActivity: {
      activeChallengeId:
        typeof challengeActivity.activeChallengeId === 'string'
          ? compactText(challengeActivity.activeChallengeId, '') || null
          : null,
      participationStatus:
        typeof challengeActivity.participationStatus === 'string'
          ? compactText(challengeActivity.participationStatus, '') || null
          : null,
      checkIns: {
        total: Number(checkIns.total) || 0,
        completed: Number(checkIns.completed) || 0,
        partial: Number(checkIns.partial) || 0,
        skipped: Number(checkIns.skipped) || 0,
        completionRate: Number(checkIns.completionRate) || 0,
        lastCheckInAt: typeof checkIns.lastCheckInAt === 'string' ? compactText(checkIns.lastCheckInAt, '') || null : null
      }
    },
    communityEngagement: {
      postsCount: Number(communityEngagement.postsCount) || 0,
      reactionsGivenCount: Number(communityEngagement.reactionsGivenCount) || 0,
      reactionsReceivedCount: Number(communityEngagement.reactionsReceivedCount) || 0,
      lastPostAt: typeof communityEngagement.lastPostAt === 'string' ? compactText(communityEngagement.lastPostAt, '') || null : null
    },
    purchaseHistory: {
      totalPurchases: Number(purchaseHistory.totalPurchases) || 0,
      totalSpentCents: Number(purchaseHistory.totalSpentCents) || 0,
      averageOrderValueCents: Number(purchaseHistory.averageOrderValueCents) || 0,
      lastPurchaseAt: typeof purchaseHistory.lastPurchaseAt === 'string' ? compactText(purchaseHistory.lastPurchaseAt, '') || null : null,
      topProductIds: toStringArray(purchaseHistory.topProductIds)
    },
    safety: {
      piiIncluded: false,
      rawHealthDataIncluded: false
    }
  };
}

export async function generateThreeDayMealPlan(summary: McpUserSummary): Promise<MealPlanningResult> {
  const llm = createLlmClientFromEnv();
  const prompt = buildMealPlanningPrompt(summary);
  const fallback = buildDeterministicFallback(summary);

  try {
    const response = await llm.generateText({
      prompt,
      systemPrompt:
        'Return strict JSON only. Do not include medical claims. Keep rationale practical and lifestyle-oriented.',
      maxOutputTokens: 1600,
      temperature: 0.1
    });

    const parsed = parseJsonObject(response.text);
    return normalizeResult(parsed, fallback);
  } catch {
    return fallback;
  }
}

export async function generateThreeDayMealPlanFromJson(userSummaryJson: string | Record<string, unknown>): Promise<MealPlanningResult> {
  const parsed =
    typeof userSummaryJson === 'string'
      ? parseJsonObject(userSummaryJson)
      : asObject(userSummaryJson);

  const summary = asMcpSummary(parsed);
  return generateThreeDayMealPlan(summary);
}
