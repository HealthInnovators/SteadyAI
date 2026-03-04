import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STORE_OWNER = {
  email: 'store-owner@steadyai.local',
  username: 'steadyai_store_owner',
  displayName: 'SteadyAI Store'
};

const STARTER_CATALOG: Array<{
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
}> = [
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f001',
    name: 'Habit Reset Playbook',
    description: 'A structured 7-day reset protocol to recover after missed check-ins and rebuild consistency.',
    priceCents: 1500,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f002',
    name: '30-Day Momentum Challenge Pack',
    description: 'Daily micro-prompts and reflection checkpoints to sustain progress through a 30-day challenge.',
    priceCents: 2400,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f003',
    name: 'Weekly Reflection Journal',
    description: 'A guided template for identifying wins, friction, and one practical adjustment each week.',
    priceCents: 1200,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f004',
    name: '7-Day Meal Quickstart',
    description: 'Simple meal structure templates with clear portioning and low-friction planning steps.',
    priceCents: 1900,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f005',
    name: 'Budget Grocery Builder',
    description: 'Staple-focused grocery matrix with affordable swaps to maintain nutrition goals on a budget.',
    priceCents: 1700,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f006',
    name: 'High-Protein Recipe Starter',
    description: 'A practical recipe bank built around protein anchors and repeatable prep routines.',
    priceCents: 2100,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f007',
    name: '10-Minute Meal Prep System',
    description: 'Short prep workflows for users with limited time who still want structured nutrition.',
    priceCents: 1600,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f008',
    name: 'Beginner Strength at Home',
    description: 'A progression-based beginner routine with bodyweight and light-equipment options.',
    priceCents: 2900,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f009',
    name: 'Low-Impact Training Plan',
    description: 'Joint-friendly sessions designed for consistency without high-impact movement.',
    priceCents: 2600,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f00a',
    name: '20-Minute Express Workouts',
    description: 'Short, repeatable sessions for busy schedules with clear weekly structure.',
    priceCents: 2200,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f00b',
    name: 'Mobility and Recovery Protocol',
    description: 'A recovery-focused mobility sequence to reduce stiffness and support training readiness.',
    priceCents: 1800,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f00c',
    name: 'Community Starter Prompts',
    description: 'Post templates for wins, questions, and check-ins that encourage meaningful engagement.',
    priceCents: 1200,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f00d',
    name: 'Supportive Reply Playbook',
    description: 'A practical guide for writing non-judgmental, helpful responses in community threads.',
    priceCents: 1100,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f00e',
    name: 'Challenge Facilitator Kit',
    description: 'Templates and cadence plans for running a consistent, low-friction group challenge.',
    priceCents: 2700,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f00f',
    name: 'Check-In Accountability Toolkit',
    description: 'Daily check-in scripts and routines to keep participation steady through the week.',
    priceCents: 1400,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f010',
    name: 'Personal Plan Review Credit',
    description: 'One asynchronous review cycle with action-focused feedback on your weekly plan.',
    priceCents: 4900,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f011',
    name: 'Monthly Progress Report Export',
    description: 'A structured monthly report template for adherence, trends, and next-step planning.',
    priceCents: 2500,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f012',
    name: 'Notion Habit Dashboard',
    description: 'A ready-to-use Notion template for check-ins, reflection, and routine tracking.',
    priceCents: 1800,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f013',
    name: 'Sheets Nutrition Tracker',
    description: 'A lightweight spreadsheet system for meal logging, macro trends, and weekly review.',
    priceCents: 1300,
    currency: 'USD'
  },
  {
    id: 'a6f31a95-0460-4627-98e0-8e6f20b2f014',
    name: 'Weekly Planning Bundle',
    description: 'Combined planning templates for workouts, meals, check-ins, and reflection in one flow.',
    priceCents: 3200,
    currency: 'USD'
  }
];

async function main(): Promise<void> {
  const owner = await prisma.user.upsert({
    where: { email: STORE_OWNER.email },
    update: {
      username: STORE_OWNER.username,
      displayName: STORE_OWNER.displayName
    },
    create: {
      email: STORE_OWNER.email,
      username: STORE_OWNER.username,
      displayName: STORE_OWNER.displayName,
      onboardingCompleted: true
    },
    select: { id: true }
  });

  for (const product of STARTER_CATALOG) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        creatorId: owner.id,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        currency: product.currency,
        isActive: true
      },
      create: {
        id: product.id,
        creatorId: owner.id,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        currency: product.currency,
        isActive: true
      }
    });
  }

  console.log(`Seeded ${STARTER_CATALOG.length} store products.`);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

