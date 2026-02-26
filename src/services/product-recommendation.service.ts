import type { McpUserSummary } from '../mcp/userSummary';
import { getStoreProducts } from './store-product.service';

export interface ProductSuggestion {
  productId: string;
  name: string;
  explanation: string;
  relevanceScore: number;
}

export interface SoftProductRecommendationResult {
  optional: true;
  shouldShowSuggestions: boolean;
  presentation: 'passive_optional';
  suggestions: ProductSuggestion[];
  rationale: string;
}

interface ScoredProduct {
  productId: string;
  name: string;
  description: string;
  score: number;
  reasons: string[];
}

function normalizeText(value: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

function scoreFromKeyword(content: string, keywords: string[], points: number): number {
  return keywords.some((keyword) => content.includes(keyword)) ? points : 0;
}

function buildSuggestionExplanation(reasons: string[]): string {
  if (reasons.length === 0) {
    return 'Optional educational resource aligned with your current routine goals.';
  }

  return `Optional suggestion: ${reasons.join(' ')}.`;
}

function scoreProducts(summary: McpUserSummary, products: Array<{ id: string; name: string; description: string }>): ScoredProduct[] {
  const goal = normalizeText(summary.profile.primaryGoal);
  const experience = normalizeText(summary.profile.experienceLevel);
  const timeAvailability = normalizeText(summary.profile.timeAvailability);
  const preferences = summary.profile.dietaryPreferences.map((x) => x.toLowerCase());

  return products.map((product) => {
    const name = product.name.trim();
    const description = product.description.trim();
    const content = `${name} ${description}`.toLowerCase();

    let score = 0;
    const reasons: string[] = [];

    const consistencyScore = scoreFromKeyword(content, ['routine', 'habit', 'consistency', 'check-in'], 2);
    if (consistencyScore > 0 && (goal.includes('consisten') || goal.includes('habit'))) {
      score += consistencyScore;
      reasons.push('It supports consistency and routine-building.');
    }

    const nutritionScore = scoreFromKeyword(content, ['meal', 'nutrition', 'food', 'grocery'], 2);
    if (nutritionScore > 0 && (goal.includes('nutrition') || goal.includes('diet') || goal.includes('meal'))) {
      score += nutritionScore;
      reasons.push('It aligns with your nutrition-focused goal.');
    }

    const beginnerScore = scoreFromKeyword(content, ['beginner', 'starter', 'foundational'], 2);
    if (beginnerScore > 0 && (experience.includes('beginner') || experience.includes('new'))) {
      score += beginnerScore;
      reasons.push('It appears suitable for getting started.');
    }

    const busyTimeScore = scoreFromKeyword(content, ['quick', 'simple', 'short', '10 minute', '15 minute'], 1);
    if (busyTimeScore > 0 && (timeAvailability.includes('30') || timeAvailability.includes('20') || timeAvailability.includes('15'))) {
      score += busyTimeScore;
      reasons.push('It may fit your limited available time.');
    }

    if (preferences.length > 0) {
      const preferenceMatch = preferences.some((preference) => content.includes(preference));
      if (preferenceMatch) {
        score += 1;
        reasons.push('It matches one of your listed dietary preferences.');
      }
    }

    if (score === 0) {
      score = 1;
      reasons.push('It can be used as an optional educational add-on if helpful.');
    }

    return {
      productId: product.id,
      name,
      description,
      score,
      reasons
    };
  });
}

export async function buildSoftProductRecommendations(summary: McpUserSummary): Promise<SoftProductRecommendationResult> {
  const products = await getStoreProducts();

  if (products.length === 0) {
    return {
      optional: true,
      shouldShowSuggestions: false,
      presentation: 'passive_optional',
      suggestions: [],
      rationale: 'No active products are available right now; continue the core user flow without interruption.'
    };
  }

  const scored = scoreProducts(
    summary,
    products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description
    }))
  )
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 2);

  const suggestions: ProductSuggestion[] = scored.map((product) => ({
    productId: product.productId,
    name: product.name,
    explanation: buildSuggestionExplanation(product.reasons),
    relevanceScore: product.score
  }));

  return {
    optional: true,
    shouldShowSuggestions: suggestions.length > 0,
    presentation: 'passive_optional',
    suggestions,
    rationale:
      'Suggestions are optional and should be shown in a non-blocking area (for example, below primary actions) so the main flow is never interrupted.'
  };
}
