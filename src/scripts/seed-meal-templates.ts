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
    slug: 'turkey-avocado-wrap',
    name: 'Turkey Avocado Wrap',
    description: 'A quick high-protein wrap with lean turkey, avocado, vegetables, and a yogurt mustard spread.',
    mealType: MealType.LUNCH,
    calories: 430,
    proteinG: 34,
    carbsG: 42,
    fatG: 15,
    fiberG: 8,
    prepTimeMin: 10,
    goalTags: ['high-protein', 'quick', 'balanced', 'lunch'],
    dietTags: [],
    cuisineTags: ['american'],
    ingredients: [
      '1 whole-wheat tortilla',
      '4 oz sliced turkey breast',
      '1/4 avocado',
      'lettuce, tomato, and cucumber',
      '1 tbsp Greek yogurt mustard spread'
    ],
    steps: [
      'Spread yogurt mustard on the tortilla.',
      'Layer turkey, avocado, and vegetables.',
      'Roll tightly and slice in half.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy turkey avocado wrap recipe'
  },
  {
    slug: 'mediterranean-chickpea-quinoa-bowl',
    name: 'Mediterranean Chickpea Quinoa Bowl',
    description: 'A plant-forward lunch bowl with chickpeas, quinoa, cucumber, tomato, hummus, and feta.',
    mealType: MealType.LUNCH,
    calories: 510,
    proteinG: 22,
    carbsG: 70,
    fatG: 17,
    fiberG: 15,
    prepTimeMin: 18,
    goalTags: ['vegetarian', 'high-fiber', 'balanced', 'meal-prep'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '3/4 cup cooked quinoa',
      '1/2 cup chickpeas',
      'cucumber, tomato, red onion, and parsley',
      '2 tbsp hummus',
      '2 tbsp feta and lemon juice'
    ],
    steps: [
      'Add quinoa and chickpeas to a bowl.',
      'Top with chopped vegetables and parsley.',
      'Finish with hummus, feta, and lemon juice.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'mediterranean chickpea quinoa bowl healthy lunch recipe'
  },
  {
    slug: 'tuna-chickpea-cucumber-salad',
    name: 'Tuna Chickpea Cucumber Salad',
    description: 'A no-cook protein and fiber lunch with tuna, chickpeas, cucumber, herbs, and lemon.',
    mealType: MealType.LUNCH,
    calories: 390,
    proteinG: 36,
    carbsG: 34,
    fatG: 11,
    fiberG: 9,
    prepTimeMin: 10,
    goalTags: ['high-protein', 'quick', 'high-fiber', 'lunch'],
    dietTags: ['dairy-free', 'gluten-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '1 can tuna packed in water',
      '1/2 cup chickpeas',
      '1 cup cucumber and tomato',
      'parsley and red onion',
      'lemon juice and 1 tsp olive oil'
    ],
    steps: [
      'Drain tuna and chickpeas.',
      'Mix with cucumber, tomato, herbs, and onion.',
      'Dress with lemon juice and olive oil.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy tuna chickpea cucumber salad recipe'
  },
  {
    slug: 'salmon-rice-cucumber-bowl',
    name: 'Salmon Rice Cucumber Bowl',
    description: 'A balanced lunch bowl with salmon, rice, cucumber, edamame, and a light soy ginger sauce.',
    mealType: MealType.LUNCH,
    calories: 540,
    proteinG: 38,
    carbsG: 58,
    fatG: 18,
    fiberG: 6,
    prepTimeMin: 18,
    goalTags: ['high-protein', 'balanced', 'quick', 'lunch'],
    dietTags: ['dairy-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '5 oz cooked salmon',
      '3/4 cup cooked rice',
      'cucumber and shredded carrot',
      '1/3 cup edamame',
      'soy ginger sauce'
    ],
    steps: [
      'Warm rice and salmon.',
      'Add cucumber, carrot, and edamame.',
      'Drizzle with soy ginger sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy salmon rice cucumber bowl recipe'
  },
  {
    slug: 'tofu-veggie-soba-noodle-bowl',
    name: 'Tofu Veggie Soba Noodle Bowl',
    description: 'A vegetarian lunch bowl with tofu, soba noodles, vegetables, and sesame ginger dressing.',
    mealType: MealType.LUNCH,
    calories: 500,
    proteinG: 29,
    carbsG: 62,
    fatG: 16,
    fiberG: 8,
    prepTimeMin: 22,
    goalTags: ['vegetarian', 'balanced', 'high-protein', 'lunch'],
    dietTags: ['vegetarian', 'dairy-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '5 oz extra-firm tofu',
      '2 oz soba noodles',
      'broccoli, carrots, and snap peas',
      '1 tbsp sesame ginger dressing',
      'scallions and sesame seeds'
    ],
    steps: [
      'Cook soba noodles and rinse.',
      'Sear tofu until golden.',
      'Toss noodles, vegetables, tofu, and dressing.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'tofu soba noodle bowl healthy lunch recipe'
  },
  {
    slug: 'chicken-burrito-bowl',
    name: 'Chicken Burrito Bowl',
    description: 'A high-protein burrito bowl with chicken, beans, rice, salsa, and vegetables.',
    mealType: MealType.LUNCH,
    calories: 560,
    proteinG: 44,
    carbsG: 62,
    fatG: 15,
    fiberG: 12,
    prepTimeMin: 20,
    goalTags: ['high-protein', 'balanced', 'meal-prep', 'lunch'],
    dietTags: ['gluten-free'],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '5 oz grilled chicken',
      '1/2 cup brown rice',
      '1/2 cup black beans',
      'lettuce, peppers, corn, and salsa',
      '2 tbsp Greek yogurt or avocado'
    ],
    steps: [
      'Layer rice, beans, and lettuce in a bowl.',
      'Add sliced grilled chicken and vegetables.',
      'Top with salsa and yogurt or avocado.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy chicken burrito bowl recipe'
  },
  {
    slug: 'lentil-vegetable-soup',
    name: 'Lentil Vegetable Soup',
    description: 'A filling plant-based soup with lentils, vegetables, herbs, and a side of whole-grain toast.',
    mealType: MealType.LUNCH,
    calories: 420,
    proteinG: 24,
    carbsG: 66,
    fatG: 7,
    fiberG: 18,
    prepTimeMin: 30,
    goalTags: ['vegan', 'high-fiber', 'meal-prep', 'lunch'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '1 cup cooked lentils',
      'carrots, celery, onion, spinach, and tomato',
      '2 cups vegetable broth',
      'garlic, cumin, and herbs',
      '1 slice whole-grain toast'
    ],
    steps: [
      'Saute onion, carrot, and celery.',
      'Add lentils, broth, tomato, and seasoning.',
      'Simmer until vegetables are tender and serve with toast.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy lentil vegetable soup recipe'
  },
  {
    slug: 'shrimp-avocado-salad',
    name: 'Shrimp Avocado Salad',
    description: 'A light seafood salad with shrimp, avocado, greens, cucumber, and citrus dressing.',
    mealType: MealType.LUNCH,
    calories: 410,
    proteinG: 36,
    carbsG: 24,
    fatG: 20,
    fiberG: 9,
    prepTimeMin: 15,
    goalTags: ['low-calorie', 'high-protein', 'quick', 'lunch'],
    dietTags: ['gluten-free', 'dairy-free'],
    cuisineTags: ['american', 'latin-inspired'],
    ingredients: [
      '5 oz cooked shrimp',
      '3 cups mixed greens',
      '1/3 avocado',
      'cucumber, tomato, and red onion',
      'lime citrus dressing'
    ],
    steps: [
      'Add greens and vegetables to a bowl.',
      'Top with shrimp and avocado.',
      'Dress with lime citrus dressing.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy shrimp avocado salad recipe'
  },
  {
    slug: 'greek-chicken-pita-pocket',
    name: 'Greek Chicken Pita Pocket',
    description: 'A portable high-protein pita with chicken, vegetables, and tzatziki.',
    mealType: MealType.LUNCH,
    calories: 470,
    proteinG: 41,
    carbsG: 50,
    fatG: 12,
    fiberG: 6,
    prepTimeMin: 15,
    goalTags: ['high-protein', 'quick', 'lunch'],
    dietTags: [],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '1 whole-wheat pita',
      '4 oz grilled chicken',
      'cucumber, tomato, and lettuce',
      '2 tbsp tzatziki',
      'lemon and oregano'
    ],
    steps: [
      'Warm pita and slice open.',
      'Fill with chicken and vegetables.',
      'Add tzatziki, lemon, and oregano.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy greek chicken pita recipe'
  },
  {
    slug: 'edamame-brown-rice-power-bowl',
    name: 'Edamame Brown Rice Power Bowl',
    description: 'A vegetarian power bowl with edamame, brown rice, cabbage, carrots, and peanut lime sauce.',
    mealType: MealType.LUNCH,
    calories: 520,
    proteinG: 25,
    carbsG: 68,
    fatG: 17,
    fiberG: 13,
    prepTimeMin: 18,
    goalTags: ['vegetarian', 'high-fiber', 'balanced', 'lunch'],
    dietTags: ['vegetarian', 'dairy-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '3/4 cup cooked brown rice',
      '3/4 cup shelled edamame',
      'cabbage, carrots, cucumber, and scallions',
      '1 tbsp peanut lime sauce',
      'sesame seeds'
    ],
    steps: [
      'Layer rice and edamame in a bowl.',
      'Add crunchy vegetables.',
      'Drizzle with peanut lime sauce and sesame seeds.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'edamame brown rice power bowl healthy recipe'
  },
  {
    slug: 'caprese-chicken-grain-bowl',
    name: 'Caprese Chicken Grain Bowl',
    description: 'A balanced bowl with chicken, farro, tomatoes, mozzarella, basil, and balsamic.',
    mealType: MealType.LUNCH,
    calories: 520,
    proteinG: 42,
    carbsG: 48,
    fatG: 18,
    fiberG: 7,
    prepTimeMin: 18,
    goalTags: ['high-protein', 'balanced', 'lunch'],
    dietTags: [],
    cuisineTags: ['italian-inspired'],
    ingredients: [
      '5 oz grilled chicken',
      '3/4 cup cooked farro',
      'cherry tomatoes and spinach',
      '1 oz mozzarella',
      'basil and balsamic glaze'
    ],
    steps: [
      'Add farro and spinach to a bowl.',
      'Top with chicken, tomatoes, mozzarella, and basil.',
      'Finish with a small drizzle of balsamic.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'caprese chicken grain bowl healthy recipe'
  },
  {
    slug: 'egg-salad-lettuce-cups',
    name: 'Greek Yogurt Egg Salad Lettuce Cups',
    description: 'A lighter egg salad made with Greek yogurt and served in lettuce cups.',
    mealType: MealType.LUNCH,
    calories: 350,
    proteinG: 28,
    carbsG: 18,
    fatG: 18,
    fiberG: 5,
    prepTimeMin: 12,
    goalTags: ['low-carb', 'high-protein', 'quick', 'lunch'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '2 hard-boiled eggs',
      '2 hard-boiled egg whites',
      '2 tbsp Greek yogurt',
      'celery, herbs, mustard, and pepper',
      'large romaine or butter lettuce leaves'
    ],
    steps: [
      'Chop eggs and egg whites.',
      'Mix with yogurt, mustard, celery, and herbs.',
      'Spoon into lettuce cups.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy greek yogurt egg salad lettuce cups recipe'
  },
  {
    slug: 'buffalo-chicken-sweet-potato',
    name: 'Buffalo Chicken Stuffed Sweet Potato',
    description: 'A satisfying lunch with shredded buffalo chicken, sweet potato, and yogurt ranch.',
    mealType: MealType.LUNCH,
    calories: 500,
    proteinG: 42,
    carbsG: 55,
    fatG: 12,
    fiberG: 8,
    prepTimeMin: 25,
    goalTags: ['high-protein', 'balanced', 'meal-prep', 'lunch'],
    dietTags: ['gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1 medium baked sweet potato',
      '5 oz shredded chicken',
      '1 tbsp buffalo sauce',
      '2 tbsp Greek yogurt ranch',
      'green onion and celery'
    ],
    steps: [
      'Bake or microwave sweet potato until tender.',
      'Toss chicken with buffalo sauce.',
      'Stuff potato with chicken and top with yogurt ranch.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy buffalo chicken stuffed sweet potato recipe'
  },
  {
    slug: 'veggie-hummus-sandwich',
    name: 'Veggie Hummus Sandwich',
    description: 'A quick vegetarian sandwich with hummus, avocado, crunchy vegetables, and whole-grain bread.',
    mealType: MealType.LUNCH,
    calories: 430,
    proteinG: 17,
    carbsG: 58,
    fatG: 16,
    fiberG: 13,
    prepTimeMin: 8,
    goalTags: ['vegetarian', 'quick', 'high-fiber', 'lunch'],
    dietTags: ['vegetarian', 'dairy-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '2 slices whole-grain bread',
      '1/4 cup hummus',
      '1/4 avocado',
      'cucumber, tomato, sprouts, and spinach',
      'lemon pepper'
    ],
    steps: [
      'Spread hummus and avocado on bread.',
      'Layer vegetables and sprouts.',
      'Season with lemon pepper and close sandwich.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy veggie hummus sandwich recipe'
  },
  {
    slug: 'beef-taco-salad-bowl',
    name: 'Lean Beef Taco Salad Bowl',
    description: 'A higher-protein taco salad with lean beef, lettuce, beans, salsa, and avocado.',
    mealType: MealType.LUNCH,
    calories: 520,
    proteinG: 40,
    carbsG: 38,
    fatG: 23,
    fiberG: 12,
    prepTimeMin: 18,
    goalTags: ['high-protein', 'balanced', 'lunch'],
    dietTags: ['gluten-free'],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '5 oz 93% lean ground beef',
      '3 cups romaine',
      '1/2 cup black beans',
      'tomato, corn, and salsa',
      '1/4 avocado'
    ],
    steps: [
      'Cook beef with taco seasoning.',
      'Build a salad with romaine, beans, vegetables, and salsa.',
      'Top with beef and avocado.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy lean beef taco salad bowl recipe'
  },
  {
    slug: 'chicken-pesto-zucchini-pasta',
    name: 'Chicken Pesto Zucchini Pasta',
    description: 'A lighter pasta bowl with chicken, zucchini noodles, whole-grain pasta, and pesto.',
    mealType: MealType.LUNCH,
    calories: 510,
    proteinG: 43,
    carbsG: 45,
    fatG: 18,
    fiberG: 7,
    prepTimeMin: 22,
    goalTags: ['high-protein', 'balanced', 'lunch'],
    dietTags: [],
    cuisineTags: ['italian-inspired'],
    ingredients: [
      '5 oz grilled chicken',
      '1 cup zucchini noodles',
      '1/2 cup cooked whole-grain pasta',
      '1 tbsp pesto',
      'cherry tomatoes and basil'
    ],
    steps: [
      'Warm pasta and zucchini noodles together.',
      'Toss with pesto and tomatoes.',
      'Top with sliced grilled chicken.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy chicken pesto zucchini pasta recipe'
  },
  {
    slug: 'paneer-tikka-salad-bowl',
    name: 'Paneer Tikka Salad Bowl',
    description: 'A vegetarian Indian-inspired salad bowl with paneer, greens, cucumber, and yogurt mint sauce.',
    mealType: MealType.LUNCH,
    calories: 500,
    proteinG: 30,
    carbsG: 34,
    fatG: 27,
    fiberG: 7,
    prepTimeMin: 22,
    goalTags: ['vegetarian', 'high-protein', 'lunch'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['indian-inspired'],
    ingredients: [
      '4 oz paneer cubes',
      'tikka spices and lemon',
      '3 cups greens',
      'cucumber, tomato, and onion',
      '2 tbsp yogurt mint sauce'
    ],
    steps: [
      'Season paneer with tikka spices and lemon.',
      'Pan-sear paneer until golden.',
      'Serve over greens with vegetables and yogurt mint sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy paneer tikka salad bowl recipe'
  },
  {
    slug: 'miso-chicken-ramen-bowl',
    name: 'Miso Chicken Ramen Bowl',
    description: 'A lighter ramen-style lunch with chicken, vegetables, broth, and a controlled portion of noodles.',
    mealType: MealType.LUNCH,
    calories: 540,
    proteinG: 40,
    carbsG: 58,
    fatG: 15,
    fiberG: 7,
    prepTimeMin: 25,
    goalTags: ['high-protein', 'balanced', 'lunch'],
    dietTags: ['dairy-free'],
    cuisineTags: ['japanese-inspired'],
    ingredients: [
      '4 oz cooked chicken',
      '2 cups low-sodium miso broth',
      '2 oz ramen noodles',
      'bok choy, mushrooms, and carrots',
      'soft-boiled egg'
    ],
    steps: [
      'Simmer broth with vegetables.',
      'Cook noodles separately or in broth.',
      'Top with chicken and egg.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy miso chicken ramen bowl recipe'
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
    slug: 'protein-overnight-oats-berries',
    name: 'Protein Overnight Oats with Berries',
    description: 'A make-ahead breakfast with oats, Greek yogurt, berries, and chia for steady energy.',
    mealType: MealType.BREAKFAST,
    calories: 410,
    proteinG: 31,
    carbsG: 54,
    fatG: 9,
    fiberG: 10,
    prepTimeMin: 8,
    goalTags: ['high-protein', 'meal-prep', 'high-fiber', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1/2 cup rolled oats',
      '3/4 cup nonfat Greek yogurt',
      '1/2 cup mixed berries',
      '1 tbsp chia seeds',
      '1/2 scoop vanilla protein powder'
    ],
    steps: [
      'Mix oats, yogurt, chia, protein powder, and a splash of water or milk.',
      'Refrigerate overnight.',
      'Top with berries before eating.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'protein overnight oats berries healthy recipe'
  },
  {
    slug: 'avocado-egg-toast',
    name: 'Avocado Egg Toast',
    description: 'A balanced toast with fiber-rich bread, healthy fat, and a cooked egg.',
    mealType: MealType.BREAKFAST,
    calories: 390,
    proteinG: 22,
    carbsG: 36,
    fatG: 18,
    fiberG: 9,
    prepTimeMin: 10,
    goalTags: ['balanced', 'quick', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1 slice whole-grain toast',
      '1/2 avocado',
      '2 eggs or 1 egg plus 2 egg whites',
      'tomato slices',
      'lemon juice, chili flakes, and pepper'
    ],
    steps: [
      'Toast bread and mash avocado with lemon and pepper.',
      'Cook eggs to preference.',
      'Layer avocado, tomato, and eggs on toast.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy avocado egg toast recipe'
  },
  {
    slug: 'spinach-feta-egg-muffins',
    name: 'Spinach Feta Egg Muffins',
    description: 'Portable egg muffins for meal prep with spinach, peppers, and feta.',
    mealType: MealType.BREAKFAST,
    calories: 280,
    proteinG: 26,
    carbsG: 10,
    fatG: 15,
    fiberG: 3,
    prepTimeMin: 30,
    goalTags: ['low-carb', 'high-protein', 'meal-prep', 'breakfast'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '6 eggs',
      '1 cup egg whites',
      '2 cups spinach',
      '1/2 cup diced bell pepper',
      '1/3 cup crumbled feta'
    ],
    steps: [
      'Whisk eggs and egg whites.',
      'Fold in spinach, peppers, and feta.',
      'Bake in a muffin tin until set.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'spinach feta egg muffins healthy breakfast recipe'
  },
  {
    slug: 'banana-protein-pancakes',
    name: 'Banana Protein Pancakes',
    description: 'Simple blender pancakes made with banana, oats, eggs, and protein powder.',
    mealType: MealType.BREAKFAST,
    calories: 430,
    proteinG: 34,
    carbsG: 55,
    fatG: 10,
    fiberG: 7,
    prepTimeMin: 18,
    goalTags: ['high-protein', 'post-workout', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1 banana',
      '1/2 cup rolled oats',
      '2 eggs',
      '1/2 scoop vanilla protein powder',
      '1/2 tsp baking powder'
    ],
    steps: [
      'Blend all ingredients into a batter.',
      'Cook small pancakes on a nonstick pan.',
      'Serve with berries or a spoon of yogurt.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'banana protein pancakes healthy recipe'
  },
  {
    slug: 'cottage-cheese-berry-toast',
    name: 'Cottage Cheese Berry Toast',
    description: 'High-protein toast with cottage cheese, berries, and cinnamon.',
    mealType: MealType.BREAKFAST,
    calories: 330,
    proteinG: 28,
    carbsG: 42,
    fatG: 6,
    fiberG: 6,
    prepTimeMin: 6,
    goalTags: ['high-protein', 'quick', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1 slice whole-grain toast',
      '3/4 cup low-fat cottage cheese',
      '1/2 cup strawberries or blueberries',
      '1 tsp honey',
      'cinnamon'
    ],
    steps: [
      'Toast bread.',
      'Spread cottage cheese over toast.',
      'Top with berries, honey, and cinnamon.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'cottage cheese berry toast healthy breakfast recipe'
  },
  {
    slug: 'savory-oatmeal-egg-spinach',
    name: 'Savory Oatmeal with Egg and Spinach',
    description: 'A warm savory bowl with oats, spinach, egg, and parmesan.',
    mealType: MealType.BREAKFAST,
    calories: 380,
    proteinG: 24,
    carbsG: 44,
    fatG: 13,
    fiberG: 8,
    prepTimeMin: 15,
    goalTags: ['high-fiber', 'balanced', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1/2 cup rolled oats',
      '1 cup low-sodium broth or water',
      '1 egg',
      '1 cup spinach',
      '1 tbsp grated parmesan'
    ],
    steps: [
      'Cook oats with broth or water until creamy.',
      'Stir in spinach until wilted.',
      'Top with a cooked egg and parmesan.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'savory oatmeal egg spinach recipe'
  },
  {
    slug: 'breakfast-burrito-egg-black-bean',
    name: 'Egg and Black Bean Breakfast Burrito',
    description: 'A fiber-rich breakfast burrito with eggs, beans, salsa, and vegetables.',
    mealType: MealType.BREAKFAST,
    calories: 460,
    proteinG: 29,
    carbsG: 56,
    fatG: 14,
    fiberG: 11,
    prepTimeMin: 18,
    goalTags: ['high-fiber', 'balanced', 'meal-prep', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '1 whole-wheat tortilla',
      '2 eggs or egg whites',
      '1/2 cup black beans',
      'peppers and onions',
      'salsa'
    ],
    steps: [
      'Scramble eggs with peppers and onions.',
      'Warm beans and tortilla.',
      'Fill tortilla with eggs, beans, and salsa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy breakfast burrito egg black bean recipe'
  },
  {
    slug: 'smoked-salmon-cucumber-bagel-thin',
    name: 'Smoked Salmon Cucumber Bagel Thin',
    description: 'A lighter bagel breakfast with smoked salmon, cucumber, and Greek yogurt spread.',
    mealType: MealType.BREAKFAST,
    calories: 370,
    proteinG: 27,
    carbsG: 42,
    fatG: 11,
    fiberG: 5,
    prepTimeMin: 8,
    goalTags: ['high-protein', 'quick', 'breakfast'],
    dietTags: [],
    cuisineTags: ['american'],
    ingredients: [
      '1 whole-grain bagel thin',
      '3 oz smoked salmon',
      '2 tbsp Greek yogurt cream cheese spread',
      'cucumber slices',
      'capers, dill, and lemon'
    ],
    steps: [
      'Toast bagel thin.',
      'Spread yogurt cream cheese.',
      'Layer salmon, cucumber, capers, dill, and lemon.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy smoked salmon bagel breakfast recipe'
  },
  {
    slug: 'chia-protein-pudding-mango',
    name: 'Chia Protein Pudding with Mango',
    description: 'A make-ahead chia pudding with protein powder, mango, and Greek yogurt.',
    mealType: MealType.BREAKFAST,
    calories: 360,
    proteinG: 27,
    carbsG: 40,
    fatG: 12,
    fiberG: 12,
    prepTimeMin: 10,
    goalTags: ['meal-prep', 'high-fiber', 'high-protein', 'breakfast'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '3 tbsp chia seeds',
      '3/4 cup unsweetened milk',
      '1/2 scoop vanilla protein powder',
      '1/2 cup Greek yogurt',
      '1/2 cup diced mango'
    ],
    steps: [
      'Whisk chia seeds, milk, and protein powder.',
      'Refrigerate until thickened.',
      'Top with yogurt and mango.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'chia protein pudding mango healthy breakfast recipe'
  },
  {
    slug: 'tofu-scramble-breakfast-bowl',
    name: 'Tofu Scramble Breakfast Bowl',
    description: 'A vegan breakfast bowl with tofu scramble, potatoes, and vegetables.',
    mealType: MealType.BREAKFAST,
    calories: 430,
    proteinG: 28,
    carbsG: 48,
    fatG: 15,
    fiberG: 9,
    prepTimeMin: 22,
    goalTags: ['vegan', 'high-protein', 'balanced', 'breakfast'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '5 oz extra-firm tofu',
      '1 cup roasted potatoes',
      'spinach, peppers, and onions',
      'turmeric and nutritional yeast',
      'salsa'
    ],
    steps: [
      'Crumble tofu and season with turmeric and nutritional yeast.',
      'Cook vegetables until tender.',
      'Serve tofu scramble with potatoes and salsa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'vegan tofu scramble breakfast bowl recipe'
  },
  {
    slug: 'high-protein-breakfast-smoothie',
    name: 'High-Protein Breakfast Smoothie',
    description: 'A fast smoothie with protein, berries, spinach, and peanut butter.',
    mealType: MealType.BREAKFAST,
    calories: 420,
    proteinG: 35,
    carbsG: 44,
    fatG: 13,
    fiberG: 8,
    prepTimeMin: 5,
    goalTags: ['high-protein', 'quick', 'post-workout', 'breakfast'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1 scoop protein powder',
      '1 cup unsweetened milk',
      '1/2 banana',
      '1 cup berries',
      '1 tbsp peanut butter and a handful of spinach'
    ],
    steps: [
      'Add all ingredients to a blender.',
      'Blend until smooth.',
      'Add ice or water to adjust thickness.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'high protein breakfast smoothie healthy recipe'
  },
  {
    slug: 'turkey-sausage-egg-white-bowl',
    name: 'Turkey Sausage Egg White Bowl',
    description: 'A lower-calorie savory bowl with turkey sausage, egg whites, and vegetables.',
    mealType: MealType.BREAKFAST,
    calories: 350,
    proteinG: 36,
    carbsG: 24,
    fatG: 12,
    fiberG: 5,
    prepTimeMin: 15,
    goalTags: ['high-protein', 'low-calorie', 'breakfast'],
    dietTags: ['gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '3 oz turkey sausage',
      '1 cup egg whites',
      '1/2 cup roasted sweet potato',
      'spinach and peppers',
      'salsa'
    ],
    steps: [
      'Brown turkey sausage in a skillet.',
      'Add vegetables and egg whites.',
      'Serve with sweet potato and salsa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'turkey sausage egg white breakfast bowl healthy recipe'
  },
  {
    slug: 'peanut-butter-banana-oatmeal',
    name: 'Peanut Butter Banana Oatmeal',
    description: 'Creamy oatmeal with banana, peanut butter, and added protein.',
    mealType: MealType.BREAKFAST,
    calories: 450,
    proteinG: 26,
    carbsG: 58,
    fatG: 15,
    fiberG: 9,
    prepTimeMin: 10,
    goalTags: ['balanced', 'high-fiber', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1/2 cup rolled oats',
      '1 banana',
      '1 tbsp peanut butter',
      '1/2 scoop protein powder',
      'cinnamon'
    ],
    steps: [
      'Cook oats with water or milk.',
      'Stir in protein powder after cooking.',
      'Top with banana, peanut butter, and cinnamon.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'peanut butter banana protein oatmeal recipe'
  },
  {
    slug: 'mediterranean-breakfast-plate',
    name: 'Mediterranean Breakfast Plate',
    description: 'A no-cook breakfast plate with eggs, hummus, vegetables, and whole-grain pita.',
    mealType: MealType.BREAKFAST,
    calories: 440,
    proteinG: 24,
    carbsG: 45,
    fatG: 18,
    fiberG: 9,
    prepTimeMin: 10,
    goalTags: ['balanced', 'high-fiber', 'quick', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '2 hard-boiled eggs',
      '1/4 cup hummus',
      '1 small whole-grain pita',
      'cucumber, tomato, and olives',
      'feta and herbs'
    ],
    steps: [
      'Slice eggs and vegetables.',
      'Arrange hummus, pita, vegetables, and eggs on a plate.',
      'Top with feta and herbs.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'mediterranean healthy breakfast plate recipe'
  },
  {
    slug: 'breakfast-quinoa-apple-cinnamon',
    name: 'Apple Cinnamon Breakfast Quinoa',
    description: 'A warm whole-grain breakfast bowl with quinoa, apple, cinnamon, and yogurt.',
    mealType: MealType.BREAKFAST,
    calories: 390,
    proteinG: 23,
    carbsG: 59,
    fatG: 8,
    fiberG: 8,
    prepTimeMin: 18,
    goalTags: ['high-fiber', 'vegetarian', 'breakfast'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '3/4 cup cooked quinoa',
      '1 chopped apple',
      '1/2 cup Greek yogurt',
      '1 tbsp chopped walnuts',
      'cinnamon'
    ],
    steps: [
      'Warm quinoa with apple and cinnamon.',
      'Spoon into a bowl.',
      'Top with Greek yogurt and walnuts.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'apple cinnamon breakfast quinoa recipe'
  },
  {
    slug: 'breakfast-taco-egg-avocado',
    name: 'Egg Avocado Breakfast Tacos',
    description: 'Two quick breakfast tacos with eggs, avocado, beans, and salsa.',
    mealType: MealType.BREAKFAST,
    calories: 430,
    proteinG: 25,
    carbsG: 48,
    fatG: 16,
    fiberG: 10,
    prepTimeMin: 15,
    goalTags: ['balanced', 'high-fiber', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '2 corn tortillas',
      '2 eggs',
      '1/3 cup black beans',
      '1/4 avocado',
      'salsa and cilantro'
    ],
    steps: [
      'Scramble eggs.',
      'Warm tortillas and beans.',
      'Fill tacos with eggs, beans, avocado, and salsa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy egg avocado breakfast tacos recipe'
  },
  {
    slug: 'ricotta-berry-protein-toast',
    name: 'Ricotta Berry Protein Toast',
    description: 'A sweet high-protein toast with ricotta, berries, and pistachios.',
    mealType: MealType.BREAKFAST,
    calories: 360,
    proteinG: 24,
    carbsG: 42,
    fatG: 11,
    fiberG: 6,
    prepTimeMin: 7,
    goalTags: ['quick', 'high-protein', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1 slice whole-grain toast',
      '1/2 cup part-skim ricotta',
      '1/2 cup berries',
      '1 tsp honey',
      '1 tbsp chopped pistachios'
    ],
    steps: [
      'Toast bread.',
      'Spread ricotta over toast.',
      'Top with berries, honey, and pistachios.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'ricotta berry toast healthy breakfast recipe'
  },
  {
    slug: 'mushroom-spinach-omelet',
    name: 'Mushroom Spinach Omelet',
    description: 'A classic high-protein omelet with mushrooms, spinach, and a small amount of cheese.',
    mealType: MealType.BREAKFAST,
    calories: 320,
    proteinG: 30,
    carbsG: 12,
    fatG: 17,
    fiberG: 4,
    prepTimeMin: 14,
    goalTags: ['low-carb', 'high-protein', 'breakfast'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '2 eggs',
      '1/2 cup egg whites',
      '1 cup mushrooms',
      '1 cup spinach',
      '2 tbsp shredded cheese'
    ],
    steps: [
      'Saute mushrooms and spinach.',
      'Add beaten eggs and egg whites.',
      'Fold with cheese when set.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'mushroom spinach omelet healthy breakfast recipe'
  },
  {
    slug: 'breakfast-lentil-hash-egg',
    name: 'Breakfast Lentil Hash with Egg',
    description: 'A fiber-rich savory hash with lentils, vegetables, and a fried egg.',
    mealType: MealType.BREAKFAST,
    calories: 430,
    proteinG: 27,
    carbsG: 52,
    fatG: 13,
    fiberG: 14,
    prepTimeMin: 20,
    goalTags: ['high-fiber', 'balanced', 'breakfast'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '3/4 cup cooked lentils',
      '1 egg',
      'peppers, onions, and spinach',
      '1/2 cup diced potato',
      'paprika and herbs'
    ],
    steps: [
      'Cook potato, peppers, and onions until tender.',
      'Stir in lentils and spinach.',
      'Top with a cooked egg.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy breakfast lentil hash egg recipe'
  },
  {
    slug: 'pumpkin-spice-protein-oats',
    name: 'Pumpkin Spice Protein Oats',
    description: 'A warm seasonal oatmeal with pumpkin puree, protein, and cinnamon.',
    mealType: MealType.BREAKFAST,
    calories: 400,
    proteinG: 30,
    carbsG: 52,
    fatG: 9,
    fiberG: 10,
    prepTimeMin: 10,
    goalTags: ['high-protein', 'high-fiber', 'breakfast'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1/2 cup rolled oats',
      '1/3 cup pumpkin puree',
      '1/2 scoop vanilla protein powder',
      '1 tbsp ground flaxseed',
      'pumpkin spice and cinnamon'
    ],
    steps: [
      'Cook oats with water or milk.',
      'Stir in pumpkin puree and spices.',
      'Mix in protein powder and flaxseed after cooking.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'pumpkin spice protein oatmeal healthy recipe'
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
    slug: 'chicken-fajita-plate',
    name: 'Chicken Fajita Plate',
    description: 'A high-protein dinner with chicken, peppers, onions, beans, and a small serving of rice.',
    mealType: MealType.DINNER,
    calories: 540,
    proteinG: 46,
    carbsG: 58,
    fatG: 14,
    fiberG: 12,
    prepTimeMin: 25,
    goalTags: ['high-protein', 'balanced', 'dinner'],
    dietTags: ['gluten-free'],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '5 oz chicken breast strips',
      'bell peppers and onions',
      '1/2 cup black beans',
      '1/2 cup cooked brown rice',
      'salsa, lime, and fajita spices'
    ],
    steps: [
      'Cook chicken with fajita spices.',
      'Saute peppers and onions.',
      'Serve with beans, rice, salsa, and lime.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy chicken fajita plate recipe'
  },
  {
    slug: 'turkey-meatballs-zucchini-noodles',
    name: 'Turkey Meatballs with Zucchini Noodles',
    description: 'A lighter Italian-inspired dinner with lean turkey meatballs, marinara, and zucchini noodles.',
    mealType: MealType.DINNER,
    calories: 460,
    proteinG: 42,
    carbsG: 28,
    fatG: 20,
    fiberG: 7,
    prepTimeMin: 30,
    goalTags: ['high-protein', 'low-carb', 'dinner'],
    dietTags: ['gluten-free'],
    cuisineTags: ['italian-inspired'],
    ingredients: [
      '5 oz lean ground turkey',
      'zucchini noodles',
      '1/2 cup marinara sauce',
      '1 tbsp parmesan',
      'garlic, basil, and Italian herbs'
    ],
    steps: [
      'Shape turkey with garlic and herbs into meatballs.',
      'Bake or pan-cook until done.',
      'Serve over zucchini noodles with marinara and parmesan.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy turkey meatballs zucchini noodles recipe'
  },
  {
    slug: 'shrimp-cauliflower-fried-rice',
    name: 'Shrimp Cauliflower Fried Rice',
    description: 'A lower-carb stir-fry with shrimp, cauliflower rice, vegetables, egg, and soy ginger seasoning.',
    mealType: MealType.DINNER,
    calories: 390,
    proteinG: 38,
    carbsG: 24,
    fatG: 16,
    fiberG: 8,
    prepTimeMin: 20,
    goalTags: ['low-calorie', 'high-protein', 'low-carb', 'dinner'],
    dietTags: ['gluten-free', 'dairy-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '5 oz shrimp',
      '2 cups cauliflower rice',
      '1 egg',
      'peas, carrots, scallions, and garlic',
      'low-sodium soy sauce or tamari'
    ],
    steps: [
      'Cook shrimp until pink and set aside.',
      'Stir-fry vegetables and cauliflower rice.',
      'Add egg, shrimp, and soy ginger seasoning.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy shrimp cauliflower fried rice recipe'
  },
  {
    slug: 'chickpea-spinach-curry',
    name: 'Chickpea Spinach Curry',
    description: 'A plant-based curry with chickpeas, spinach, tomatoes, and a moderate serving of rice.',
    mealType: MealType.DINNER,
    calories: 520,
    proteinG: 22,
    carbsG: 76,
    fatG: 14,
    fiberG: 17,
    prepTimeMin: 28,
    goalTags: ['vegan', 'high-fiber', 'balanced', 'dinner'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'],
    cuisineTags: ['indian-inspired'],
    ingredients: [
      '1 cup chickpeas',
      '2 cups spinach',
      'tomato, onion, garlic, and ginger',
      'curry spices',
      '1/2 cup cooked basmati or brown rice'
    ],
    steps: [
      'Saute onion, garlic, ginger, and spices.',
      'Add tomatoes and chickpeas, then simmer.',
      'Stir in spinach and serve with rice.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy chickpea spinach curry recipe'
  },
  {
    slug: 'lean-beef-broccoli-bowl',
    name: 'Lean Beef and Broccoli Bowl',
    description: 'A high-protein takeout-style dinner with lean beef, broccoli, rice, and a lighter sauce.',
    mealType: MealType.DINNER,
    calories: 560,
    proteinG: 43,
    carbsG: 58,
    fatG: 18,
    fiberG: 8,
    prepTimeMin: 25,
    goalTags: ['high-protein', 'balanced', 'dinner'],
    dietTags: ['dairy-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '5 oz lean flank steak or sirloin',
      '2 cups broccoli',
      '3/4 cup cooked brown rice',
      'garlic and ginger',
      'low-sodium soy sauce slurry'
    ],
    steps: [
      'Slice beef thinly and sear quickly.',
      'Steam or stir-fry broccoli.',
      'Toss beef and broccoli with sauce and serve over rice.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy beef and broccoli bowl recipe'
  },
  {
    slug: 'cod-tacos-cabbage-slaw',
    name: 'Cod Tacos with Cabbage Slaw',
    description: 'Light fish tacos with cod, cabbage slaw, avocado, and yogurt lime sauce.',
    mealType: MealType.DINNER,
    calories: 470,
    proteinG: 39,
    carbsG: 48,
    fatG: 14,
    fiberG: 9,
    prepTimeMin: 22,
    goalTags: ['high-protein', 'balanced', 'dinner'],
    dietTags: [],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '5 oz cod or white fish',
      '2 corn tortillas',
      'cabbage slaw',
      '1/4 avocado',
      'Greek yogurt lime sauce'
    ],
    steps: [
      'Season and cook cod until flaky.',
      'Warm tortillas.',
      'Fill with fish, slaw, avocado, and lime sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy cod fish tacos cabbage slaw recipe'
  },
  {
    slug: 'chicken-tikka-masala-light',
    name: 'Light Chicken Tikka Masala',
    description: 'A lighter version of chicken tikka masala with Greek yogurt, tomato sauce, and cauliflower rice.',
    mealType: MealType.DINNER,
    calories: 500,
    proteinG: 48,
    carbsG: 38,
    fatG: 18,
    fiberG: 8,
    prepTimeMin: 30,
    goalTags: ['high-protein', 'lower-carb', 'dinner'],
    dietTags: ['gluten-free'],
    cuisineTags: ['indian-inspired'],
    ingredients: [
      '5 oz chicken breast',
      'tomato sauce and tikka spices',
      '2 tbsp Greek yogurt',
      '2 cups cauliflower rice',
      'cilantro and lemon'
    ],
    steps: [
      'Cook chicken with tikka spices.',
      'Simmer tomato sauce and stir in Greek yogurt off heat.',
      'Serve over cauliflower rice with cilantro.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy light chicken tikka masala recipe'
  },
  {
    slug: 'stuffed-bell-peppers-turkey',
    name: 'Turkey Stuffed Bell Peppers',
    description: 'Meal-prep friendly peppers stuffed with lean turkey, rice, beans, tomato, and spices.',
    mealType: MealType.DINNER,
    calories: 510,
    proteinG: 42,
    carbsG: 52,
    fatG: 15,
    fiberG: 11,
    prepTimeMin: 40,
    goalTags: ['high-protein', 'meal-prep', 'balanced', 'dinner'],
    dietTags: ['gluten-free'],
    cuisineTags: ['american', 'mexican-inspired'],
    ingredients: [
      '2 bell peppers',
      '5 oz lean ground turkey',
      '1/2 cup cooked rice',
      '1/3 cup black beans',
      'tomato sauce and spices'
    ],
    steps: [
      'Cook turkey with tomato sauce, beans, rice, and spices.',
      'Fill halved peppers.',
      'Bake until peppers are tender.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy turkey stuffed bell peppers recipe'
  },
  {
    slug: 'veggie-black-bean-enchilada-skillet',
    name: 'Veggie Black Bean Enchilada Skillet',
    description: 'A vegetarian skillet dinner with black beans, vegetables, corn tortillas, and enchilada sauce.',
    mealType: MealType.DINNER,
    calories: 520,
    proteinG: 24,
    carbsG: 74,
    fatG: 15,
    fiberG: 17,
    prepTimeMin: 25,
    goalTags: ['vegetarian', 'high-fiber', 'dinner'],
    dietTags: ['vegetarian'],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '1 cup black beans',
      'zucchini, peppers, onion, and corn',
      '2 corn tortillas, cut into strips',
      '1/2 cup enchilada sauce',
      '2 tbsp shredded cheese'
    ],
    steps: [
      'Saute vegetables until tender.',
      'Add beans, tortilla strips, and enchilada sauce.',
      'Top with cheese and cook until melted.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy black bean enchilada skillet recipe'
  },
  {
    slug: 'pesto-salmon-white-bean-salad',
    name: 'Pesto Salmon White Bean Salad',
    description: 'A protein-rich dinner salad with salmon, white beans, greens, tomato, and pesto vinaigrette.',
    mealType: MealType.DINNER,
    calories: 560,
    proteinG: 43,
    carbsG: 38,
    fatG: 27,
    fiberG: 10,
    prepTimeMin: 18,
    goalTags: ['high-protein', 'heart-healthy', 'quick', 'dinner'],
    dietTags: ['gluten-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '5 oz cooked salmon',
      '1/2 cup white beans',
      '3 cups mixed greens',
      'cherry tomatoes and cucumber',
      '1 tbsp pesto vinaigrette'
    ],
    steps: [
      'Add greens, beans, and vegetables to a bowl.',
      'Top with salmon.',
      'Drizzle with pesto vinaigrette.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'salmon white bean salad pesto healthy recipe'
  },
  {
    slug: 'thai-basil-chicken-bowl',
    name: 'Thai Basil Chicken Bowl',
    description: 'A lighter Thai-inspired chicken bowl with basil, vegetables, and jasmine or cauliflower rice.',
    mealType: MealType.DINNER,
    calories: 520,
    proteinG: 45,
    carbsG: 52,
    fatG: 16,
    fiberG: 6,
    prepTimeMin: 22,
    goalTags: ['high-protein', 'balanced', 'dinner'],
    dietTags: ['dairy-free'],
    cuisineTags: ['thai-inspired'],
    ingredients: [
      '5 oz ground chicken',
      'basil, garlic, and chili',
      'green beans and bell pepper',
      '3/4 cup cooked rice',
      'light soy or fish sauce'
    ],
    steps: [
      'Cook chicken with garlic and chili.',
      'Add vegetables and sauce.',
      'Finish with basil and serve over rice.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy thai basil chicken bowl recipe'
  },
  {
    slug: 'mushroom-lentil-bolognese',
    name: 'Mushroom Lentil Bolognese',
    description: 'A plant-based pasta dinner with lentils, mushrooms, tomato sauce, and whole-grain pasta.',
    mealType: MealType.DINNER,
    calories: 540,
    proteinG: 27,
    carbsG: 82,
    fatG: 12,
    fiberG: 18,
    prepTimeMin: 35,
    goalTags: ['vegan', 'high-fiber', 'dinner'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free'],
    cuisineTags: ['italian-inspired'],
    ingredients: [
      '3/4 cup cooked lentils',
      'mushrooms, onion, carrot, and celery',
      '1 cup marinara sauce',
      '2 oz whole-grain pasta',
      'Italian herbs'
    ],
    steps: [
      'Saute vegetables and mushrooms.',
      'Add lentils, marinara, and herbs, then simmer.',
      'Serve over whole-grain pasta.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'mushroom lentil bolognese healthy recipe'
  },
  {
    slug: 'chicken-shawarma-rice-bowl',
    name: 'Chicken Shawarma Rice Bowl',
    description: 'A Mediterranean-style bowl with spiced chicken, rice, cucumber tomato salad, and yogurt sauce.',
    mealType: MealType.DINNER,
    calories: 560,
    proteinG: 46,
    carbsG: 58,
    fatG: 17,
    fiberG: 7,
    prepTimeMin: 28,
    goalTags: ['high-protein', 'balanced', 'dinner'],
    dietTags: ['gluten-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '5 oz chicken breast or thigh',
      'shawarma spices',
      '3/4 cup cooked rice',
      'cucumber tomato salad',
      '2 tbsp yogurt tahini sauce'
    ],
    steps: [
      'Season and cook chicken with shawarma spices.',
      'Prepare cucumber tomato salad.',
      'Serve chicken over rice with yogurt tahini sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy chicken shawarma rice bowl recipe'
  },
  {
    slug: 'eggplant-chickpea-tagine',
    name: 'Eggplant Chickpea Tagine',
    description: 'A Moroccan-inspired plant-based stew with eggplant, chickpeas, tomatoes, and couscous.',
    mealType: MealType.DINNER,
    calories: 510,
    proteinG: 21,
    carbsG: 74,
    fatG: 15,
    fiberG: 16,
    prepTimeMin: 35,
    goalTags: ['vegan', 'high-fiber', 'dinner'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free'],
    cuisineTags: ['moroccan-inspired'],
    ingredients: [
      '1 cup chickpeas',
      'eggplant, tomato, onion, and carrots',
      'ras el hanout or cumin and cinnamon',
      '1/2 cup cooked couscous',
      'parsley and lemon'
    ],
    steps: [
      'Saute onion, eggplant, and carrots.',
      'Add chickpeas, tomatoes, and spices, then simmer.',
      'Serve with couscous, parsley, and lemon.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy eggplant chickpea tagine recipe'
  },
  {
    slug: 'pork-tenderloin-apple-slaw',
    name: 'Pork Tenderloin with Apple Slaw',
    description: 'A lean pork dinner with crunchy apple cabbage slaw and roasted potatoes.',
    mealType: MealType.DINNER,
    calories: 540,
    proteinG: 44,
    carbsG: 50,
    fatG: 17,
    fiberG: 8,
    prepTimeMin: 32,
    goalTags: ['high-protein', 'balanced', 'dinner'],
    dietTags: ['gluten-free', 'dairy-free'],
    cuisineTags: ['american'],
    ingredients: [
      '5 oz pork tenderloin',
      '1 cup roasted potatoes',
      'cabbage and apple slaw',
      'mustard vinaigrette',
      'rosemary and pepper'
    ],
    steps: [
      'Season and roast or sear pork tenderloin.',
      'Roast potatoes until tender.',
      'Serve with apple cabbage slaw and mustard vinaigrette.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy pork tenderloin apple slaw recipe'
  },
  {
    slug: 'baked-falafel-bowl',
    name: 'Baked Falafel Bowl',
    description: 'A vegetarian bowl with baked falafel, greens, quinoa, cucumber, tomato, and tahini yogurt sauce.',
    mealType: MealType.DINNER,
    calories: 530,
    proteinG: 24,
    carbsG: 68,
    fatG: 19,
    fiberG: 15,
    prepTimeMin: 35,
    goalTags: ['vegetarian', 'high-fiber', 'balanced', 'dinner'],
    dietTags: ['vegetarian'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '4 baked falafel patties',
      '1/2 cup cooked quinoa',
      'greens, cucumber, tomato, and onion',
      '2 tbsp tahini yogurt sauce',
      'lemon and parsley'
    ],
    steps: [
      'Bake falafel until crisp.',
      'Build a bowl with quinoa and vegetables.',
      'Top with falafel and tahini yogurt sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy baked falafel bowl recipe'
  },
  {
    slug: 'garlic-herb-chicken-roasted-vegetables',
    name: 'Garlic Herb Chicken with Roasted Vegetables',
    description: 'A simple sheet-pan dinner with chicken, potatoes, broccoli, carrots, and herbs.',
    mealType: MealType.DINNER,
    calories: 520,
    proteinG: 46,
    carbsG: 48,
    fatG: 16,
    fiberG: 9,
    prepTimeMin: 35,
    goalTags: ['high-protein', 'meal-prep', 'balanced', 'dinner'],
    dietTags: ['gluten-free', 'dairy-free'],
    cuisineTags: ['american'],
    ingredients: [
      '5 oz chicken breast or thigh',
      '1 cup potatoes',
      'broccoli and carrots',
      '1 tbsp olive oil',
      'garlic, rosemary, thyme, and lemon'
    ],
    steps: [
      'Season chicken and vegetables with oil, garlic, herbs, and lemon.',
      'Spread on a sheet pan.',
      'Roast until chicken is cooked and vegetables are tender.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy garlic herb chicken roasted vegetables recipe'
  },
  {
    slug: 'tempeh-peanut-noodle-bowl',
    name: 'Tempeh Peanut Noodle Bowl',
    description: 'A vegan dinner bowl with tempeh, noodles, vegetables, and a lighter peanut sauce.',
    mealType: MealType.DINNER,
    calories: 580,
    proteinG: 32,
    carbsG: 70,
    fatG: 20,
    fiberG: 12,
    prepTimeMin: 25,
    goalTags: ['vegan', 'high-protein', 'balanced', 'dinner'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '4 oz tempeh',
      '2 oz whole-grain noodles',
      'cabbage, carrots, cucumber, and scallions',
      '1 tbsp peanut lime sauce',
      'sesame seeds'
    ],
    steps: [
      'Sear sliced tempeh until browned.',
      'Cook noodles and rinse.',
      'Toss noodles, vegetables, tempeh, and peanut lime sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy tempeh peanut noodle bowl recipe'
  },
  {
    slug: 'turkey-chili-beans',
    name: 'Turkey Chili with Beans',
    description: 'A hearty high-protein chili with lean turkey, beans, tomatoes, and spices.',
    mealType: MealType.DINNER,
    calories: 500,
    proteinG: 43,
    carbsG: 48,
    fatG: 14,
    fiberG: 15,
    prepTimeMin: 35,
    goalTags: ['high-protein', 'high-fiber', 'meal-prep', 'dinner'],
    dietTags: ['gluten-free', 'dairy-free'],
    cuisineTags: ['american'],
    ingredients: [
      '5 oz lean ground turkey',
      '1 cup kidney or black beans',
      'tomatoes, onion, and peppers',
      'chili powder and cumin',
      'optional Greek yogurt topping'
    ],
    steps: [
      'Brown turkey with onion and peppers.',
      'Add beans, tomatoes, and spices.',
      'Simmer until thickened.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy turkey chili with beans recipe'
  },
  {
    slug: 'seared-tuna-nicoise-bowl',
    name: 'Seared Tuna Nicoise Bowl',
    description: 'A protein-rich bowl with tuna, potatoes, green beans, egg, olives, and vinaigrette.',
    mealType: MealType.DINNER,
    calories: 560,
    proteinG: 46,
    carbsG: 42,
    fatG: 24,
    fiberG: 8,
    prepTimeMin: 28,
    goalTags: ['high-protein', 'balanced', 'dinner'],
    dietTags: ['gluten-free', 'dairy-free'],
    cuisineTags: ['french-inspired'],
    ingredients: [
      '5 oz tuna steak',
      'small potatoes',
      'green beans and mixed greens',
      '1 boiled egg',
      'olives and vinaigrette'
    ],
    steps: [
      'Boil potatoes and green beans until tender.',
      'Sear tuna briefly on each side.',
      'Arrange with greens, egg, olives, and vinaigrette.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy seared tuna nicoise bowl recipe'
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
  },
  {
    slug: 'greek-yogurt-ranch-veggie-dip',
    name: 'Greek Yogurt Ranch Veggie Dip',
    description: 'A high-protein savory snack with Greek yogurt ranch dip and crunchy vegetables.',
    mealType: MealType.SNACK,
    calories: 180,
    proteinG: 18,
    carbsG: 20,
    fatG: 4,
    fiberG: 5,
    prepTimeMin: 6,
    goalTags: ['high-protein', 'low-calorie', 'quick', 'snack'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '3/4 cup nonfat Greek yogurt',
      'ranch seasoning or dill, garlic, and onion powder',
      'carrot sticks',
      'cucumber slices',
      'bell pepper strips'
    ],
    steps: [
      'Mix Greek yogurt with ranch-style seasoning.',
      'Slice vegetables into sticks.',
      'Serve vegetables with dip.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'greek yogurt ranch veggie dip healthy snack recipe'
  },
  {
    slug: 'protein-energy-bites',
    name: 'Protein Energy Bites',
    description: 'No-bake oat and nut butter bites with protein powder for a portable snack.',
    mealType: MealType.SNACK,
    calories: 230,
    proteinG: 14,
    carbsG: 24,
    fatG: 10,
    fiberG: 4,
    prepTimeMin: 15,
    goalTags: ['high-protein', 'meal-prep', 'snack'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '1/2 cup rolled oats',
      '1 tbsp peanut butter',
      '1/2 scoop protein powder',
      '1 tsp honey',
      'chia seeds'
    ],
    steps: [
      'Mix oats, peanut butter, protein powder, honey, and chia.',
      'Roll into small bites.',
      'Chill until firm.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy protein energy bites recipe'
  },
  {
    slug: 'tuna-cucumber-crackers',
    name: 'Tuna Cucumber Crackers',
    description: 'A quick protein snack with tuna salad, cucumber slices, and whole-grain crackers.',
    mealType: MealType.SNACK,
    calories: 260,
    proteinG: 28,
    carbsG: 22,
    fatG: 7,
    fiberG: 4,
    prepTimeMin: 8,
    goalTags: ['high-protein', 'quick', 'snack'],
    dietTags: ['dairy-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1 small tuna pouch',
      '1 tbsp Greek yogurt or light mayo',
      'cucumber slices',
      '6 whole-grain crackers',
      'mustard, pepper, and herbs'
    ],
    steps: [
      'Mix tuna with yogurt or light mayo, mustard, and herbs.',
      'Slice cucumber.',
      'Serve tuna with cucumber and crackers.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy tuna cucumber crackers snack recipe'
  },
  {
    slug: 'apple-peanut-butter-yogurt-dip',
    name: 'Apple with Peanut Butter Yogurt Dip',
    description: 'A sweet snack with apple slices and a lighter peanut butter yogurt dip.',
    mealType: MealType.SNACK,
    calories: 250,
    proteinG: 15,
    carbsG: 32,
    fatG: 9,
    fiberG: 6,
    prepTimeMin: 5,
    goalTags: ['quick', 'balanced', 'snack'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1 medium apple',
      '1/2 cup Greek yogurt',
      '1 tbsp peanut butter',
      'cinnamon',
      'optional: 1 tsp honey'
    ],
    steps: [
      'Slice apple.',
      'Mix yogurt, peanut butter, cinnamon, and optional honey.',
      'Dip apple slices into yogurt dip.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'apple peanut butter greek yogurt dip healthy snack recipe'
  },
  {
    slug: 'edamame-sea-salt-lime',
    name: 'Edamame with Sea Salt and Lime',
    description: 'A simple plant-protein snack with steamed edamame, lime, and sea salt.',
    mealType: MealType.SNACK,
    calories: 190,
    proteinG: 18,
    carbsG: 16,
    fatG: 8,
    fiberG: 8,
    prepTimeMin: 6,
    goalTags: ['vegan', 'high-protein', 'high-fiber', 'quick'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '1 cup shelled or in-pod edamame',
      'lime juice',
      'sea salt',
      'chili flakes',
      'optional garlic powder'
    ],
    steps: [
      'Steam edamame until warm.',
      'Season with lime, sea salt, and chili flakes.',
      'Serve warm.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy edamame snack sea salt lime recipe'
  },
  {
    slug: 'turkey-cheese-rollups',
    name: 'Turkey Cheese Roll-Ups',
    description: 'A low-carb protein snack with turkey slices, cheese, greens, and mustard.',
    mealType: MealType.SNACK,
    calories: 220,
    proteinG: 25,
    carbsG: 6,
    fatG: 11,
    fiberG: 1,
    prepTimeMin: 5,
    goalTags: ['high-protein', 'low-carb', 'quick', 'snack'],
    dietTags: ['gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '4 slices turkey breast',
      '1 slice cheese',
      'spinach leaves',
      'mustard',
      'pickle spear'
    ],
    steps: [
      'Lay turkey slices flat.',
      'Add cheese, spinach, mustard, and pickle.',
      'Roll tightly and slice if desired.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy turkey cheese roll ups snack recipe'
  },
  {
    slug: 'roasted-chickpeas',
    name: 'Crispy Roasted Chickpeas',
    description: 'A crunchy high-fiber snack with roasted chickpeas and spices.',
    mealType: MealType.SNACK,
    calories: 210,
    proteinG: 10,
    carbsG: 32,
    fatG: 6,
    fiberG: 9,
    prepTimeMin: 30,
    goalTags: ['vegan', 'high-fiber', 'meal-prep', 'snack'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'],
    cuisineTags: ['mediterranean'],
    ingredients: [
      '3/4 cup chickpeas',
      '1 tsp olive oil',
      'paprika',
      'garlic powder',
      'salt and pepper'
    ],
    steps: [
      'Dry chickpeas well.',
      'Toss with oil and spices.',
      'Roast until crisp.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'crispy roasted chickpeas healthy snack recipe'
  },
  {
    slug: 'caprese-skewers',
    name: 'Caprese Skewers',
    description: 'A fresh snack with tomato, mozzarella, basil, and balsamic.',
    mealType: MealType.SNACK,
    calories: 210,
    proteinG: 14,
    carbsG: 10,
    fatG: 13,
    fiberG: 2,
    prepTimeMin: 8,
    goalTags: ['vegetarian', 'quick', 'snack'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['italian-inspired'],
    ingredients: [
      'cherry tomatoes',
      '1.5 oz mozzarella pearls',
      'fresh basil',
      'balsamic glaze',
      'black pepper'
    ],
    steps: [
      'Thread tomatoes, mozzarella, and basil onto skewers.',
      'Drizzle lightly with balsamic.',
      'Finish with black pepper.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy caprese skewers snack recipe'
  },
  {
    slug: 'protein-smoothie-snack',
    name: 'Protein Smoothie Snack',
    description: 'A small smoothie snack with protein powder, berries, spinach, and unsweetened milk.',
    mealType: MealType.SNACK,
    calories: 260,
    proteinG: 27,
    carbsG: 28,
    fatG: 6,
    fiberG: 6,
    prepTimeMin: 5,
    goalTags: ['high-protein', 'post-workout', 'quick', 'snack'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1 scoop protein powder',
      '3/4 cup unsweetened milk',
      '1/2 cup berries',
      'handful of spinach',
      'ice'
    ],
    steps: [
      'Add all ingredients to a blender.',
      'Blend until smooth.',
      'Add water or ice to adjust texture.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy protein smoothie snack recipe'
  },
  {
    slug: 'hard-boiled-eggs-fruit',
    name: 'Hard-Boiled Eggs with Fruit',
    description: 'A simple protein snack with hard-boiled eggs and a piece of fruit.',
    mealType: MealType.SNACK,
    calories: 230,
    proteinG: 14,
    carbsG: 24,
    fatG: 10,
    fiberG: 4,
    prepTimeMin: 10,
    goalTags: ['quick', 'high-protein', 'snack'],
    dietTags: ['vegetarian', 'gluten-free', 'dairy-free'],
    cuisineTags: ['american'],
    ingredients: [
      '2 hard-boiled eggs',
      '1 orange or apple',
      'salt',
      'pepper',
      'optional hot sauce'
    ],
    steps: [
      'Boil eggs ahead of time and chill.',
      'Peel eggs and season lightly.',
      'Serve with fruit.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'hard boiled eggs fruit healthy snack'
  },
  {
    slug: 'mini-chicken-salad-cucumber-boats',
    name: 'Mini Chicken Salad Cucumber Boats',
    description: 'A lower-carb snack with Greek-yogurt chicken salad served in cucumber boats.',
    mealType: MealType.SNACK,
    calories: 240,
    proteinG: 28,
    carbsG: 12,
    fatG: 9,
    fiberG: 3,
    prepTimeMin: 10,
    goalTags: ['high-protein', 'low-carb', 'snack'],
    dietTags: ['gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '3 oz shredded chicken',
      '1 tbsp Greek yogurt',
      'celery and herbs',
      '1 large cucumber',
      'mustard and pepper'
    ],
    steps: [
      'Mix chicken with yogurt, celery, herbs, mustard, and pepper.',
      'Slice cucumber lengthwise and scoop slightly.',
      'Fill cucumber boats with chicken salad.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy chicken salad cucumber boats recipe'
  },
  {
    slug: 'banana-cocoa-protein-mug-cake',
    name: 'Banana Cocoa Protein Mug Cake',
    description: 'A quick sweet snack made in a mug with banana, cocoa, egg, and protein powder.',
    mealType: MealType.SNACK,
    calories: 290,
    proteinG: 25,
    carbsG: 32,
    fatG: 8,
    fiberG: 5,
    prepTimeMin: 7,
    goalTags: ['high-protein', 'sweet', 'quick', 'snack'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1/2 banana',
      '1 egg',
      '1/2 scoop chocolate protein powder',
      '1 tbsp cocoa powder',
      '1/4 tsp baking powder'
    ],
    steps: [
      'Mash banana in a mug.',
      'Mix in egg, protein powder, cocoa, and baking powder.',
      'Microwave until set.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy protein mug cake banana cocoa recipe'
  },
  {
    slug: 'trail-mix-portion-box',
    name: 'Trail Mix Portion Box',
    description: 'A controlled-portion trail mix snack with nuts, dried fruit, and dark chocolate.',
    mealType: MealType.SNACK,
    calories: 260,
    proteinG: 8,
    carbsG: 24,
    fatG: 16,
    fiberG: 4,
    prepTimeMin: 5,
    goalTags: ['quick', 'meal-prep', 'snack'],
    dietTags: ['vegetarian', 'dairy-free', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1 tbsp almonds',
      '1 tbsp walnuts',
      '1 tbsp pumpkin seeds',
      '1 tbsp dried cranberries',
      '1 tsp dark chocolate chips'
    ],
    steps: [
      'Measure ingredients into a small container.',
      'Mix together.',
      'Store as a grab-and-go snack.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy portion controlled trail mix recipe'
  },
  {
    slug: 'cucumber-smoked-salmon-bites',
    name: 'Cucumber Smoked Salmon Bites',
    description: 'A light high-protein snack with cucumber rounds, smoked salmon, and yogurt dill spread.',
    mealType: MealType.SNACK,
    calories: 190,
    proteinG: 18,
    carbsG: 8,
    fatG: 10,
    fiberG: 2,
    prepTimeMin: 8,
    goalTags: ['high-protein', 'low-carb', 'quick', 'snack'],
    dietTags: ['gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1 cucumber',
      '2 oz smoked salmon',
      '2 tbsp Greek yogurt dill spread',
      'capers',
      'lemon zest'
    ],
    steps: [
      'Slice cucumber into rounds.',
      'Top with yogurt dill spread and smoked salmon.',
      'Finish with capers and lemon zest.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'cucumber smoked salmon bites healthy snack recipe'
  },
  {
    slug: 'air-fryer-tofu-bites',
    name: 'Air Fryer Tofu Bites',
    description: 'A vegan protein snack with crispy seasoned tofu bites and dipping sauce.',
    mealType: MealType.SNACK,
    calories: 230,
    proteinG: 20,
    carbsG: 12,
    fatG: 13,
    fiberG: 3,
    prepTimeMin: 18,
    goalTags: ['vegan', 'high-protein', 'snack'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'],
    cuisineTags: ['asian-inspired'],
    ingredients: [
      '5 oz extra-firm tofu',
      '1 tsp cornstarch',
      'garlic powder and paprika',
      'low-sodium soy sauce or tamari',
      'chili garlic dipping sauce'
    ],
    steps: [
      'Press and cube tofu.',
      'Toss with seasoning and cornstarch.',
      'Air fry until crisp and serve with dipping sauce.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'air fryer tofu bites healthy snack recipe'
  },
  {
    slug: 'pear-ricotta-honey-bowl',
    name: 'Pear Ricotta Honey Bowl',
    description: 'A creamy sweet snack with part-skim ricotta, pear, honey, and pistachios.',
    mealType: MealType.SNACK,
    calories: 260,
    proteinG: 17,
    carbsG: 31,
    fatG: 9,
    fiberG: 5,
    prepTimeMin: 5,
    goalTags: ['quick', 'vegetarian', 'snack'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['american'],
    ingredients: [
      '1/2 cup part-skim ricotta',
      '1 small pear',
      '1 tsp honey',
      '1 tbsp pistachios',
      'cinnamon'
    ],
    steps: [
      'Add ricotta to a bowl.',
      'Top with sliced pear, honey, pistachios, and cinnamon.',
      'Serve chilled.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'pear ricotta honey bowl healthy snack recipe'
  },
  {
    slug: 'black-bean-corn-salsa-cups',
    name: 'Black Bean Corn Salsa Cups',
    description: 'A high-fiber snack with black bean corn salsa served in lettuce cups or with baked chips.',
    mealType: MealType.SNACK,
    calories: 240,
    proteinG: 11,
    carbsG: 42,
    fatG: 5,
    fiberG: 11,
    prepTimeMin: 10,
    goalTags: ['vegan', 'high-fiber', 'snack'],
    dietTags: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '1/2 cup black beans',
      '1/3 cup corn',
      'tomato, onion, and cilantro',
      'lime juice',
      'lettuce cups or baked tortilla chips'
    ],
    steps: [
      'Mix beans, corn, tomato, onion, cilantro, and lime.',
      'Chill briefly if desired.',
      'Serve in lettuce cups or with baked chips.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'healthy black bean corn salsa snack recipe'
  },
  {
    slug: 'mini-protein-parfait',
    name: 'Mini Protein Parfait',
    description: 'A small layered parfait with Greek yogurt, berries, and high-fiber cereal.',
    mealType: MealType.SNACK,
    calories: 220,
    proteinG: 22,
    carbsG: 28,
    fatG: 4,
    fiberG: 5,
    prepTimeMin: 5,
    goalTags: ['high-protein', 'quick', 'snack'],
    dietTags: ['vegetarian'],
    cuisineTags: ['american'],
    ingredients: [
      '3/4 cup Greek yogurt',
      '1/3 cup berries',
      '2 tbsp high-fiber cereal',
      'cinnamon',
      'optional: 1 tsp honey'
    ],
    steps: [
      'Layer yogurt and berries in a cup.',
      'Top with cereal and cinnamon.',
      'Add honey if desired.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'mini greek yogurt protein parfait healthy snack recipe'
  },
  {
    slug: 'sweet-potato-toast-almond-butter',
    name: 'Sweet Potato Toast with Almond Butter',
    description: 'A gluten-free sweet snack with roasted sweet potato slices, almond butter, and berries.',
    mealType: MealType.SNACK,
    calories: 270,
    proteinG: 8,
    carbsG: 36,
    fatG: 12,
    fiberG: 7,
    prepTimeMin: 20,
    goalTags: ['vegetarian', 'high-fiber', 'snack'],
    dietTags: ['vegetarian', 'gluten-free', 'dairy-free'],
    cuisineTags: ['american'],
    ingredients: [
      '2 roasted sweet potato slices',
      '1 tbsp almond butter',
      'berries',
      'cinnamon',
      'pinch of salt'
    ],
    steps: [
      'Toast or roast sweet potato slices until tender.',
      'Spread almond butter on top.',
      'Finish with berries and cinnamon.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'sweet potato toast almond butter healthy snack recipe'
  },
  {
    slug: 'cottage-cheese-salsa-bowl',
    name: 'Cottage Cheese Salsa Bowl',
    description: 'A savory high-protein snack with cottage cheese, salsa, avocado, and crunchy vegetables.',
    mealType: MealType.SNACK,
    calories: 230,
    proteinG: 25,
    carbsG: 18,
    fatG: 8,
    fiberG: 5,
    prepTimeMin: 5,
    goalTags: ['high-protein', 'low-calorie', 'quick', 'snack'],
    dietTags: ['vegetarian', 'gluten-free'],
    cuisineTags: ['mexican-inspired'],
    ingredients: [
      '3/4 cup low-fat cottage cheese',
      '1/4 cup salsa',
      '1/4 avocado',
      'cucumber and bell pepper',
      'cilantro and lime'
    ],
    steps: [
      'Add cottage cheese to a bowl.',
      'Top with salsa, avocado, cilantro, and lime.',
      'Serve with cucumber and bell pepper.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80',
    youtubeSearchQuery: 'cottage cheese salsa bowl healthy snack recipe'
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
