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
