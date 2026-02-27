import { getPrismaClient } from '../db/prisma';

export interface StoreProductView {
  id: string;
  name: string;
  description: string;
  whoItsFor: string;
  whoItsNotFor: string;
}

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
      description: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return products.map((product) => {
    const name = normalizeText(product.name, 'Unnamed product');
    const description = normalizeText(
      product.description,
      'Educational resource designed to support planning, consistency, and habit-building.'
    );

    return {
      id: product.id,
      name,
      description,
      whoItsFor: buildWhoItsFor(name, description),
      whoItsNotFor: buildWhoItsNotFor()
    };
  });
}
