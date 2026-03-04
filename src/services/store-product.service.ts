import { getPrismaClient } from '../db/prisma';

export interface StoreProductView {
  id: string;
  name: string;
  description: string;
  priceCents?: number;
  currency?: string;
  whoItsFor: string;
  whoItsNotFor: string;
}

const DUMMY_STORE_PRODUCTS: StoreProductView[] = [
  {
    id: 'demo-meal-quickstart',
    name: '7-Day Meal Quickstart',
    description: 'Simple meal structure templates with grocery shortcuts for busy weekdays.',
    priceCents: 1900,
    currency: 'USD',
    whoItsFor: 'People who want low-friction meal planning with predictable shopping.',
    whoItsNotFor: 'Not for emergency, crisis, or medical treatment needs; this is educational support only.'
  },
  {
    id: 'demo-habit-reset',
    name: 'Habit Reset Playbook',
    description: 'Step-by-step plan to recover after missed check-ins and rebuild consistency.',
    priceCents: 1500,
    currency: 'USD',
    whoItsFor: 'People restarting routines after lapses and wanting practical next actions.',
    whoItsNotFor: 'Not for emergency, crisis, or medical treatment needs; this is educational support only.'
  },
  {
    id: 'demo-community-prompts',
    name: 'Community Starter Prompts',
    description: 'Prompt pack to write supportive posts, thoughtful questions, and check-in updates.',
    priceCents: 1200,
    currency: 'USD',
    whoItsFor: 'People who want easier ways to participate in community conversations.',
    whoItsNotFor: 'Not for emergency, crisis, or medical treatment needs; this is educational support only.'
  }
];

const URGENCY_PATTERNS: RegExp[] = [
  /\blimited time\b/gi,
  /\bact now\b/gi,
  /\bbuy now\b/gi,
  /\bhurry\b/gi,
  /\burgent\b/gi,
  /\bdon't miss\b/gi,
  /\blast chance\b/gi
];

function normalizeText(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  let normalized = value.replace(/\s+/g, ' ').trim();
  for (const pattern of URGENCY_PATTERNS) {
    normalized = normalized.replace(pattern, '');
  }

  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function buildWhoItsFor(name: string, description: string): string {
  const content = `${name} ${description}`.toLowerCase();

  if (content.includes('beginner')) {
    return 'People starting a new routine who want structured, educational guidance.';
  }

  if (content.includes('intermediate') || content.includes('advanced')) {
    return 'People with an existing routine who want clearer planning and consistency support.';
  }

  return 'People who want practical, education-first support for building healthy routines.';
}

function buildWhoItsNotFor(): string {
  return 'Not for emergency, crisis, or medical treatment needs; this is educational support only.';
}

export async function getStoreProducts(): Promise<StoreProductView[]> {
  const prisma = getPrismaClient();

  const products = await prisma.product.findMany({
    where: {
      isActive: true
    },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      currency: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const mapped = products.map((product) => {
    const name = normalizeText(product.name, 'Unnamed product');
    const description = normalizeText(
      product.description,
      'Educational resource designed to support planning, consistency, and habit-building.'
    );

    return {
      id: product.id,
      name,
      description,
      priceCents: product.priceCents,
      currency: product.currency,
      whoItsFor: buildWhoItsFor(name, description),
      whoItsNotFor: buildWhoItsNotFor()
    };
  });

  if (mapped.length === 0) {
    return DUMMY_STORE_PRODUCTS;
  }

  return mapped;
}
