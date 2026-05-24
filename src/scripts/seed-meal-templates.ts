import { MealTemplateSource, MealType, type Prisma } from '@prisma/client';

import { disconnectPrisma, getPrismaClient } from '../db/prisma';

type MealTemplateSeed = {
  slug: string;
  name: string;
  description: string;
  mealType: MealType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  prepTimeMin: number;
  goalTags: string[];
  dietTags: string[];
  cuisineTags: string[];
  ingredients: string[];
  steps: string[];
  imageUrl: string;
  youtubeSearchQuery: string;
  videoUrls?: string[];
};

export const MEAL_TEMPLATE_CATALOG: MealTemplateSeed[] = [
  {
    slug: 'lemon-herb-chicken-salad-bowl',
    name: 'Lemon Herb Chicken Salad Bowl',
    description: 'A lean, high-protein lunch with crisp vegetables and a light lemon herb dressing.',
    mealType: MealType.LUNCH,
    calories: 390,
    proteinG: 42,
    carbsG: 22,
    fatG: 15,
    fiberG: 8,
    prepTimeMin: 18,
    goalTags: ['low-calorie', 'high-protein', 'weight-loss', 'quick'],
    dietTags: ['gluten-free'],
    cuisineTags: ['american', 'mediterranean'],
    ingredients: [
      '4 oz grilled chicken breast',
      '3 cups romaine or mixed greens',
      '1 cup cucumber, tomato, and bell pepper',
      '1/4 avocado',
      '1 tbsp olive oil lemon herb vinaigrette'
    ],
    steps: [
      'Season and grill or pan-sear the chicken.',
      'Build the greens and chopped vegetables in a bowl.',
      'Slice chicken on top and finish with lemon herb vinaigrette.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'lemon herb chicken salad bowl healthy recipe'
  },
  {
    slug: 'chicken-lettuce-wrap-plate',
    name: 'Chicken Lettuce Wrap Plate',
    description: 'A light lunch plate with crunchy vegetables, shredded chicken, and yogurt herb sauce.',
    mealType: MealType.LUNCH,
    calories: 360,
    proteinG: 38,
    carbsG: 18,
    fatG: 13,
    fiberG: 6,
    prepTimeMin: 15,
    goalTags: ['low-calorie', 'high-protein', 'low-carb', 'quick'],
    dietTags: ['gluten-free'],
    cuisineTags: ['american', 'asian-inspired'],
    ingredients: [
      '4 oz shredded chicken',
      'large romaine or butter lettuce leaves',
      '1 cup shredded carrots and cabbage',
      '2 tbsp Greek yogurt herb sauce',
      'lime juice and black pepper'
    ],
    steps: [
      'Warm chicken with garlic, pepper, and paprika.',
      'Fill lettuce leaves with vegetables and chicken.',
      'Drizzle yogurt sauce and serve immediately.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy chicken lettuce wraps recipe'
  },
  {
    slug: 'chicken-vegetable-soup-side-salad',
    name: 'Chicken Vegetable Soup with Side Salad',
    description: 'A filling lower-calorie meal built around broth, vegetables, and lean protein.',
    mealType: MealType.LUNCH,
    calories: 330,
    proteinG: 35,
    carbsG: 28,
    fatG: 8,
    fiberG: 9,
    prepTimeMin: 25,
    goalTags: ['low-calorie', 'high-protein', 'meal-prep', 'filling'],
    dietTags: ['dairy-free'],
    cuisineTags: ['american'],
    ingredients: [
      '4 oz diced cooked chicken',
      '2 cups low-sodium broth',
      'zucchini, spinach, celery, carrots, and onion',
      '1/2 cup beans or cauliflower rice',
      'side salad with vinegar-based dressing'
    ],
    steps: [
      'Simmer broth, vegetables, and seasoning until tender.',
      'Add cooked chicken and warm through.',
      'Serve with a simple side salad.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy chicken vegetable soup recipe'
  },
  {
    slug: 'greek-yogurt-berry-protein-bowl',
    name: 'Greek Yogurt Berry Protein Bowl',
    description: 'A fast breakfast with protein, fiber, and naturally sweet berries.',
    mealType: MealType.BREAKFAST,
    calories: 340,
    proteinG: 32,
    carbsG: 38,
    fatG: 7,
    fiberG: 7,
    prepTimeMin: 5,
    goalTags: ['high-protein', 'quick', 'breakfast', 'balanced'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1 cup nonfat Greek yogurt',
      '1/2 cup mixed berries',
      '1 tbsp chia seeds',
      '1/4 cup low-sugar granola',
      'cinnamon'
    ],
    steps: [
      'Add yogurt to a bowl.',
      'Top with berries, chia seeds, and granola.',
      'Finish with cinnamon.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'greek yogurt berry protein bowl recipe'
  },
  {
    slug: 'egg-white-veggie-scramble-toast',
    name: 'Egg White Veggie Scramble with Toast',
    description: 'A simple savory breakfast with vegetables and lean protein.',
    mealType: MealType.BREAKFAST,
    calories: 310,
    proteinG: 29,
    carbsG: 30,
    fatG: 8,
    fiberG: 5,
    prepTimeMin: 12,
    goalTags: ['low-calorie', 'high-protein', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1 cup egg whites',
      '1 whole egg',
      'spinach, mushrooms, peppers, and onion',
      '1 slice whole-grain toast',
      'salsa or hot sauce'
    ],
    steps: [
      'Saute vegetables until softened.',
      'Add egg whites and egg, then scramble until set.',
      'Serve with toast and salsa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'egg white vegetable scramble healthy recipe'
  },
  {
    slug: 'turkey-quinoa-power-bowl',
    name: 'Turkey Quinoa Power Bowl',
    description: 'A balanced dinner bowl with lean turkey, quinoa, vegetables, and a yogurt sauce.',
    mealType: MealType.DINNER,
    calories: 520,
    proteinG: 43,
    carbsG: 52,
    fatG: 16,
    fiberG: 9,
    prepTimeMin: 25,
    goalTags: ['high-protein', 'balanced', 'dinner', 'meal-prep'],
    dietTags: ['gluten-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '5 oz lean ground turkey',
      '3/4 cup cooked quinoa',
      'roasted zucchini and bell pepper',
      '2 tbsp Greek yogurt sauce',
      'lemon, herbs, and garlic'
    ],
    steps: [
      'Cook turkey with garlic and herbs.',
      'Layer quinoa and roasted vegetables in a bowl.',
      'Top with turkey and yogurt sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'turkey quinoa power bowl healthy recipe'
  },
  {
    slug: 'salmon-sweet-potato-green-beans',
    name: 'Salmon with Sweet Potato and Green Beans',
    description: 'A heart-healthy dinner with protein, complex carbs, and vegetables.',
    mealType: MealType.DINNER,
    calories: 560,
    proteinG: 39,
    carbsG: 45,
    fatG: 25,
    fiberG: 8,
    prepTimeMin: 30,
    goalTags: ['balanced', 'high-protein', 'heart-healthy', 'dinner'],
    dietTags: ['gluten-free', 'dairy-free'],
    cuisineTags: ['american'],
    ingredients: [
      '5 oz salmon fillet',
      '1 medium roasted sweet potato',
      '1.5 cups green beans',
      '1 tsp olive oil',
      'lemon, dill, salt, and pepper'
    ],
    steps: [
      'Roast sweet potato until tender.',
      'Bake or pan-sear salmon with lemon and dill.',
      'Steam green beans and serve together.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'salmon sweet potato green beans healthy recipe'
  },
  {
    slug: 'tofu-veggie-stir-fry-brown-rice',
    name: 'Tofu Vegetable Stir-Fry with Brown Rice',
    description: 'A plant-forward dinner with tofu, vegetables, and a moderate serving of brown rice.',
    mealType: MealType.DINNER,
    calories: 480,
    proteinG: 28,
    carbsG: 58,
    fatG: 16,
    fiberG: 10,
    prepTimeMin: 22,
    goalTags: ['vegetarian', 'balanced', 'high-fiber', 'dinner'],
    dietTags: ['vegetarian', 'vegan', 'dairy-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '5 oz extra-firm tofu',
      '2 cups broccoli, peppers, carrots, and snap peas',
      '2/3 cup cooked brown rice',
      '1 tbsp low-sodium stir-fry sauce',
      'garlic and ginger'
    ],
    steps: [
      'Press and cube tofu, then sear until golden.',
      'Stir-fry vegetables with garlic and ginger.',
      'Serve over brown rice with sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'tofu vegetable stir fry brown rice recipe'
  },
  {
    slug: 'cottage-cheese-apple-cinnamon-bowl',
    name: 'Cottage Cheese Apple Cinnamon Bowl',
    description: 'A high-protein snack with fruit, crunch, and minimal prep.',
    mealType: MealType.SNACK,
    calories: 240,
    proteinG: 25,
    carbsG: 26,
    fatG: 5,
    fiberG: 4,
    prepTimeMin: 5,
    goalTags: ['high-protein', 'snack', 'quick'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '3/4 cup low-fat cottage cheese',
      '1 small chopped apple',
      '1 tsp honey',
      'cinnamon',
      '1 tbsp chopped walnuts'
    ],
    steps: [
      'Add cottage cheese to a bowl.',
      'Top with apple, honey, cinnamon, and walnuts.',
      'Serve cold.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'cottage cheese apple cinnamon bowl healthy snack'
  },
  {
    slug: 'hummus-veggie-pita-snack-box',
    name: 'Hummus Veggie Pita Snack Box',
    description: 'A portable snack box with vegetables, hummus, and a small pita.',
    mealType: MealType.SNACK,
    calories: 280,
    proteinG: 11,
    carbsG: 36,
    fatG: 10,
    fiberG: 8,
    prepTimeMin: 8,
    goalTags: ['snack', 'high-fiber', 'vegetarian', 'quick'],
    dietTags: ['vegetarian', 'dairy-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '1/4 cup hummus',
      '1 small whole-wheat pita',
      'carrot sticks, cucumber, and bell pepper',
      'cherry tomatoes',
      'lemon pepper'
    ],
    steps: [
      'Slice vegetables into sticks.',
      'Pack hummus, pita, and vegetables together.',
      'Season with lemon pepper if desired.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'hummus veggie pita snack box recipe'
  }
];

async function main(): Promise<void> {
  const prisma = getPrismaClient();

  for (const meal of MEAL_TEMPLATE_CATALOG) {
    const data: Prisma.MealTemplateCreateInput = {
      slug: meal.slug,
      name: meal.name,
      description: meal.description,
      mealType: meal.mealType,
      calories: meal.calories,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
      fiberG: meal.fiberG,
      prepTimeMin: meal.prepTimeMin,
      goalTags: meal.goalTags,
      dietTags: meal.dietTags,
      cuisineTags: meal.cuisineTags,
      ingredients: meal.ingredients,
      steps: meal.steps,
      imageUrl: meal.imageUrl,
      youtubeSearchQuery: meal.youtubeSearchQuery,
      videoUrls: meal.videoUrls ?? [],
      source: MealTemplateSource.CURATED,
      isActive: true
    };

    await prisma.mealTemplate.upsert({
      where: { slug: meal.slug },
      update: data,
      create: data
    });
  }

  console.log(`Seeded ${MEAL_TEMPLATE_CATALOG.length} meal templates.`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await disconnectPrisma();
    });
}
