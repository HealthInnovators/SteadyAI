import { env } from '../config/env';

export interface EstimatedNutritionItem {
  name: string;
  quantity?: number;
  unit?: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  confidence?: number;
}

export interface NutritionEstimationResult {
  items: EstimatedNutritionItem[];
  modelName: string;
  provider: 'gemini' | 'groq' | 'heuristic';
  confidence: number;
  rawResponse: unknown;
  promptVersion: string;
}

function clampConfidence(value?: number): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function normalizeItems(items: unknown): EstimatedNutritionItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalized: EstimatedNutritionItem[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const source = item as Record<string, unknown>;
    const name = typeof source.name === 'string' ? source.name.trim() : '';
    const calories = Number(source.calories);

    if (!name || Number.isNaN(calories)) {
      continue;
    }

    normalized.push({
      name,
      quantity: typeof source.quantity === 'number' ? source.quantity : undefined,
      unit: typeof source.unit === 'string' ? source.unit : undefined,
      calories: Math.max(0, Math.round(calories)),
      proteinG: typeof source.proteinG === 'number' ? source.proteinG : undefined,
      carbsG: typeof source.carbsG === 'number' ? source.carbsG : undefined,
      fatG: typeof source.fatG === 'number' ? source.fatG : undefined,
      confidence: clampConfidence(typeof source.confidence === 'number' ? source.confidence : undefined)
    });
  }

  return normalized;
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('Model output is not valid JSON');
  }
}

async function fetchImageInlineData(imageUrl: string): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
  }

  const mimeType = response.headers.get('content-type') ?? 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const data = Buffer.from(arrayBuffer).toString('base64');

  return { mimeType, data };
}

function buildPrompt(rawText: string, imageUrls: string[]): string {
  const imageHint = imageUrls.length > 0 ? `Image count: ${imageUrls.length}.` : 'No images attached.';
  return [
    'You are a nutrition estimation model.',
    'Estimate meal items and nutrition from the user input.',
    imageHint,
    'Return strict JSON only with this shape:',
    '{"items":[{"name":"string","quantity":number,"unit":"string","calories":number,"proteinG":number,"carbsG":number,"fatG":number,"confidence":number}], "overallConfidence": number}',
    'Use confidence range 0..1.',
    `User input: ${rawText || 'N/A'}`
  ].join('\n');
}

async function estimateWithGemini(rawText: string, imageUrls: string[]): Promise<NutritionEstimationResult> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required for Gemini provider');
  }

  const prompt = buildPrompt(rawText, imageUrls);
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];

  for (const imageUrl of imageUrls) {
    const inlineData = await fetchImageInlineData(imageUrl);
    parts.push({ inline_data: inlineData });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${body}`);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  const candidates = raw.candidates as Array<Record<string, unknown>> | undefined;
  const content = candidates?.[0]?.content as Record<string, unknown> | undefined;
  const modelParts = content?.parts as Array<Record<string, unknown>> | undefined;
  const outputText = typeof modelParts?.[0]?.text === 'string' ? (modelParts[0].text as string) : '{}';
  const parsed = extractJsonObject(outputText) as Record<string, unknown>;
  const items = normalizeItems(parsed.items);
  const overallConfidence = clampConfidence(typeof parsed.overallConfidence === 'number' ? parsed.overallConfidence : 0.5) ?? 0.5;

  return {
    items,
    modelName: env.GEMINI_MODEL,
    provider: 'gemini',
    confidence: overallConfidence,
    rawResponse: raw,
    promptVersion: 'nutrition-v1'
  };
}

async function estimateWithGroq(rawText: string, imageUrls: string[]): Promise<NutritionEstimationResult> {
  if (!env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required for Groq provider');
  }

  const prompt = buildPrompt(rawText, imageUrls);
  const content: Array<Record<string, unknown>> = [{ type: 'text', text: prompt }];

  for (const imageUrl of imageUrls) {
    content.push({
      type: 'image_url',
      image_url: {
        url: imageUrl
      }
    });
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq API error: ${response.status} ${body}`);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  const choices = raw.choices as Array<Record<string, unknown>> | undefined;
  const message = choices?.[0]?.message as Record<string, unknown> | undefined;
  const outputText = typeof message?.content === 'string' ? (message.content as string) : '{}';
  const parsed = extractJsonObject(outputText) as Record<string, unknown>;
  const items = normalizeItems(parsed.items);
  const overallConfidence = clampConfidence(typeof parsed.overallConfidence === 'number' ? parsed.overallConfidence : 0.5) ?? 0.5;

  return {
    items,
    modelName: env.GROQ_MODEL,
    provider: 'groq',
    confidence: overallConfidence,
    rawResponse: raw,
    promptVersion: 'nutrition-v1'
  };
}

function estimateWithHeuristics(rawText: string): NutritionEstimationResult {
  const normalized = rawText.trim().toLowerCase();

  if (!normalized) {
    return {
      items: [],
      modelName: 'heuristic-fallback',
      provider: 'heuristic',
      confidence: 0,
      rawResponse: { source: 'heuristic', reason: 'empty-input' },
      promptVersion: 'nutrition-v1'
    };
  }

  const heuristics: Array<{ keyword: string; calories: number; proteinG: number; carbsG: number; fatG: number }> = [
    { keyword: 'rice', calories: 200, proteinG: 4, carbsG: 45, fatG: 1 },
    { keyword: 'chicken', calories: 250, proteinG: 35, carbsG: 0, fatG: 10 },
    { keyword: 'egg', calories: 78, proteinG: 6, carbsG: 1, fatG: 5 },
    { keyword: 'banana', calories: 105, proteinG: 1, carbsG: 27, fatG: 0.4 },
    { keyword: 'apple', calories: 95, proteinG: 0.5, carbsG: 25, fatG: 0.3 },
    { keyword: 'salad', calories: 120, proteinG: 3, carbsG: 10, fatG: 8 }
  ];

  const matches = heuristics.filter((item) => normalized.includes(item.keyword));

  if (matches.length === 0) {
    return {
      items: [
        {
          name: rawText.slice(0, 120),
          calories: 250,
          proteinG: 10,
          carbsG: 30,
          fatG: 8,
          confidence: 0.35
        }
      ],
      modelName: 'heuristic-fallback',
      provider: 'heuristic',
      confidence: 0.35,
      rawResponse: { source: 'heuristic', matched: false },
      promptVersion: 'nutrition-v1'
    };
  }

  return {
    items: matches.map((item) => ({
      name: item.keyword,
      calories: item.calories,
      proteinG: item.proteinG,
      carbsG: item.carbsG,
      fatG: item.fatG,
      confidence: 0.6
    })),
    modelName: 'heuristic-fallback',
    provider: 'heuristic',
    confidence: 0.6,
    rawResponse: { source: 'heuristic', matched: true, count: matches.length },
    promptVersion: 'nutrition-v1'
  };
}

export async function estimateNutrition(rawText: string, imageUrls: string[] = []): Promise<NutritionEstimationResult> {
  try {
    if (env.NUTRITION_AI_PROVIDER === 'groq') {
      return await estimateWithGroq(rawText, imageUrls);
    }
    return await estimateWithGemini(rawText, imageUrls);
  } catch (error) {
    const fallback = estimateWithHeuristics(rawText);
    return {
      ...fallback,
      rawResponse: {
        ...((fallback.rawResponse as Record<string, unknown>) ?? {}),
        providerError: error instanceof Error ? error.message : 'unknown-error'
      }
    };
  }
}
