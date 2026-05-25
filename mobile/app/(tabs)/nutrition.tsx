import { Link } from 'expo-router';
import * as LinkingApi from 'expo-linking';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { ApiClientError, createApiClient, type MealOption, type MealPlan, type NutritionEntry } from '../../src/api';
import { useAuth } from '../../src/auth';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors } from '../../src/theme/colors';

const promptChips = [
  'Help me create a low-calorie lunch with chicken.',
  'Suggest a high-protein vegetarian breakfast.',
  'Create a simple dinner idea under 500 calories.',
  'Give me three healthy snack ideas with Greek yogurt.'
];

export default function NutritionTab() {
  const { isAuthenticated, token } = useAuth();
  const api = useMemo(() => createApiClient({ token: () => token }), [token]);
  const [prompt, setPrompt] = useState(promptChips[0]);
  const [manualMealText, setManualMealText] = useState('');
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setEntries([]);
      return;
    }

    let active = true;
    async function loadNutritionEntries() {
      try {
        const nextEntries = await api.getNutritionEntries(5);
        if (active) {
          setEntries(nextEntries);
        }
      } catch {
        if (active) {
          setStatus('Recent nutrition entries are unavailable. You can still create meal ideas.');
        }
      }
    }

    void loadNutritionEntries();
    return () => {
      active = false;
    };
  }, [api, isAuthenticated]);

  async function generateMeals(nextPrompt = prompt): Promise<void> {
    const trimmed = nextPrompt.trim();
    if (!trimmed || isGenerating) {
      return;
    }

    setPrompt(trimmed);
    setError(null);
    setStatus(null);
    setIsGenerating(true);
    try {
      const response = await api.sendAssistantMessage(trimmed);
      if (!response.mealPlan) {
        throw new Error('The coach did not return meal recommendations. Try asking specifically for breakfast, lunch, dinner, or snacks.');
      }
      setMealPlan(response.mealPlan);
      setStatus('Meal recommendations generated.');
    } catch (generateError) {
      setError(formatError(generateError, 'Meal request failed.'));
    } finally {
      setIsGenerating(false);
    }
  }

  async function logMealOption(meal: MealOption): Promise<void> {
    if (!isAuthenticated) {
      setError('Sign in before logging nutrition.');
      return;
    }

    setIsLogging(true);
    setError(null);
    setStatus(null);
    try {
      await api.ingestNutrition({
        inputType: 'TEXT',
        rawText: buildMealDescription(meal),
        consumedAt: new Date().toISOString(),
        items: [
          {
            name: meal.name,
            quantity: 1,
            unit: 'serving',
            calories: meal.calories,
            proteinG: meal.proteinG,
            confidence: 0.9
          }
        ]
      });
      setStatus(`${meal.name} logged.`);
      await refreshEntries();
    } catch (logError) {
      setError(formatError(logError, 'Could not log that meal.'));
    } finally {
      setIsLogging(false);
    }
  }

  async function logManualMeal(): Promise<void> {
    const trimmed = manualMealText.trim();
    if (!trimmed || isLogging) {
      return;
    }
    if (!isAuthenticated) {
      setError('Sign in before logging nutrition.');
      return;
    }

    setIsLogging(true);
    setError(null);
    setStatus(null);
    try {
      await api.ingestNutrition({
        inputType: 'TEXT',
        rawText: trimmed,
        consumedAt: new Date().toISOString()
      });
      setManualMealText('');
      setStatus('Meal logged from description.');
      await refreshEntries();
    } catch (logError) {
      setError(formatError(logError, 'Could not log that meal.'));
    } finally {
      setIsLogging(false);
    }
  }

  async function refreshEntries(): Promise<void> {
    if (!isAuthenticated) {
      return;
    }
    const nextEntries = await api.getNutritionEntries(5).catch(() => null);
    if (nextEntries) {
      setEntries(nextEntries);
    }
  }

  const todayCalories = entries.reduce((sum, entry) => sum + (entry.totalCalories ?? 0), 0);
  const latestEntry = entries[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={styles.eyebrow}>Nutrition</Text>
          <Text style={styles.title}>Plan meals, open recipe videos, and log intake.</Text>
          <Text style={styles.subtitle}>
            Ask for a meal idea by goal, ingredient, or meal type. Save meals to your nutrition history when signed in.
          </Text>
        </View>

        <View style={styles.contextRow}>
          <MetricCard label="Recent logs" value={isAuthenticated ? String(entries.length) : 'Sign in'} />
          <MetricCard label="Recent cal" value={isAuthenticated ? String(Math.round(todayCalories)) : '-'} />
          <MetricCard label="Latest" value={latestEntry ? formatCalories(latestEntry.totalCalories) : '-'} />
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.cardTitle}>Meal request</Text>
          <TextInput
            multiline
            onChangeText={setPrompt}
            placeholder="Example: low-calorie lunch with chicken"
            placeholderTextColor="#9a897a"
            style={styles.promptInput}
            value={prompt}
          />
          <View style={styles.chipWrap}>
            {promptChips.map((chip) => (
              <Pressable
                disabled={isGenerating}
                key={chip}
                onPress={() => {
                  void generateMeals(chip);
                }}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton disabled={isGenerating || !prompt.trim()} onPress={() => void generateMeals()}>
            {isGenerating ? 'Generating...' : 'Generate Meals'}
          </PrimaryButton>
        </View>

        <View style={styles.manualLogCard}>
          <Text style={styles.cardTitle}>Quick log</Text>
          <Text style={styles.helperText}>Type what you ate. SteadyAI will estimate calories and macros.</Text>
          <TextInput
            multiline
            onChangeText={setManualMealText}
            placeholder="Example: grilled chicken salad with avocado and lemon dressing"
            placeholderTextColor="#9a897a"
            style={styles.promptInput}
            value={manualMealText}
          />
          {isAuthenticated ? (
            <PrimaryButton disabled={isLogging || !manualMealText.trim()} onPress={() => void logManualMeal()}>
              {isLogging ? 'Logging...' : 'Log Meal'}
            </PrimaryButton>
          ) : (
            <Link href="/sign-in" asChild>
              <PrimaryButton variant="secondary">Sign In to Log Meals</PrimaryButton>
            </Link>
          )}
        </View>

        {isGenerating ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.ink} />
            <Text style={styles.loadingText}>Building meal recommendations...</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {status ? <Text style={styles.statusText}>{status}</Text> : null}

        {mealPlan ? (
          <View style={styles.planCard}>
            <Text style={styles.planKicker}>Meal plan</Text>
            <Text style={styles.planTitle}>{mealPlan.title}</Text>
            <Text style={styles.planMeta}>
              {mealPlan.goal} - {mealPlan.options.length} option{mealPlan.options.length === 1 ? '' : 's'}
            </Text>

            <View style={styles.mealList}>
              {mealPlan.options.map((meal, index) => (
                <MealOptionCard
                  index={index}
                  isLogging={isLogging}
                  isAuthenticated={isAuthenticated}
                  key={`${meal.name}-${index}`}
                  meal={meal}
                  onLog={() => void logMealOption(meal)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {entries.length > 0 ? (
          <View style={styles.recentCard}>
            <Text style={styles.planKicker}>Recent nutrition logs</Text>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View>
                  <Text style={styles.entryTitle}>{formatEntryDate(entry.consumedAt)}</Text>
                  <Text style={styles.entrySubtext}>
                    {formatCalories(entry.totalCalories)} - {formatMacro(entry.totalProteinG)} protein - {entry.itemCount} item
                    {entry.itemCount === 1 ? '' : 's'}
                  </Text>
                </View>
                <Text style={styles.entryStatus}>{entry.status}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MealOptionCard({
  index,
  isAuthenticated,
  isLogging,
  meal,
  onLog
}: {
  index: number;
  isAuthenticated: boolean;
  isLogging: boolean;
  meal: MealOption;
  onLog: () => void;
}) {
  const videoUrl = getMealVideoUrl(meal);

  return (
    <View style={styles.mealCard}>
      {meal.imageUrl ? (
        <Image
          accessibilityLabel={`${meal.name} recipe image`}
          resizeMode="cover"
          source={{ uri: meal.imageUrl }}
          style={styles.mealImage}
        />
      ) : (
        <View style={styles.mealImagePlaceholder}>
          <Text style={styles.mealImageText}>Meal {index + 1}</Text>
        </View>
      )}

      <View style={styles.mealBody}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealMeta}>
          {meal.calories} cal - {meal.proteinG}g protein - {meal.prepTimeMin} min
        </Text>

        <View style={styles.tagWrap}>
          {meal.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Ingredients</Text>
        {meal.ingredients.slice(0, 6).map((ingredient) => (
          <Text key={ingredient} style={styles.bulletText}>
            - {ingredient}
          </Text>
        ))}

        <Text style={styles.sectionLabel}>Steps</Text>
        {meal.steps.slice(0, 4).map((step, stepIndex) => (
          <Text key={`${step}-${stepIndex}`} style={styles.bulletText}>
            {stepIndex + 1}. {step}
          </Text>
        ))}

        {meal.note ? <Text style={styles.mealNote}>{meal.note}</Text> : null}

        <View style={styles.mealActions}>
          {videoUrl ? (
            <Pressable
              onPress={() => {
                void LinkingApi.openURL(videoUrl);
              }}
              style={styles.videoButton}
            >
              <Text style={styles.videoButtonText}>{meal.videoUrls?.[0] ? 'Open video' : 'Search YouTube'}</Text>
            </Pressable>
          ) : null}

          {isAuthenticated ? (
            <Pressable disabled={isLogging} onPress={onLog} style={styles.logButton}>
              <Text style={styles.logButtonText}>{isLogging ? 'Logging...' : 'Log this meal'}</Text>
            </Pressable>
          ) : (
            <Link href="/sign-in" asChild>
              <Pressable style={styles.logButtonSecondary}>
                <Text style={styles.logButtonSecondaryText}>Sign in to log</Text>
              </Pressable>
            </Link>
          )}
        </View>
      </View>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getMealVideoUrl(meal: MealOption): string | null {
  if (meal.videoUrls?.[0]) {
    return meal.videoUrls[0];
  }
  if (meal.youtubeSearchQuery?.trim()) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(meal.youtubeSearchQuery.trim())}`;
  }
  return null;
}

function buildMealDescription(meal: MealOption): string {
  const ingredients = meal.ingredients.length > 0 ? ` Ingredients: ${meal.ingredients.join(', ')}.` : '';
  return `${meal.name}. ${meal.calories} calories, ${meal.proteinG} grams protein.${ingredients}`;
}

function formatCalories(value: number | null): string {
  return value === null ? '-' : `${Math.round(value)} cal`;
}

function formatMacro(value: string | number | null): string {
  if (value === null) {
    return '-';
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? `${Math.round(numeric)}g` : `${value}g`;
}

function formatEntryDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Meal log';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatError(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.linen
  },
  content: {
    flexGrow: 1,
    gap: 18,
    padding: 20,
    paddingTop: 36,
    paddingBottom: 40
  },
  eyebrow: {
    color: colors.copper,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  title: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1
  },
  subtitle: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24
  },
  contextRow: {
    flexDirection: 'row',
    gap: 10
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 14
  },
  metricLabel: {
    color: colors.copper,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  metricValue: {
    marginTop: 6,
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800'
  },
  promptCard: {
    gap: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 18
  },
  manualLogCard: {
    gap: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.cream,
    padding: 18
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800'
  },
  helperText: {
    color: colors.coffee,
    fontSize: 14,
    lineHeight: 20
  },
  promptInput: {
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
    padding: 14,
    textAlignVertical: 'top'
  },
  chipWrap: {
    gap: 8
  },
  chip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  chipText: {
    color: colors.coffee,
    fontSize: 13,
    fontWeight: '700'
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 22,
    backgroundColor: colors.cream,
    padding: 14
  },
  loadingText: {
    color: colors.coffee,
    fontSize: 14,
    fontWeight: '700'
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20
  },
  statusText: {
    color: colors.copper,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20
  },
  planCard: {
    gap: 14,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 18
  },
  planKicker: {
    color: colors.copper,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase'
  },
  planTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6
  },
  planMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  mealList: {
    gap: 14
  },
  mealCard: {
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white
  },
  mealImage: {
    width: '100%',
    height: 170,
    backgroundColor: colors.cream
  },
  mealImagePlaceholder: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream
  },
  mealImageText: {
    color: colors.copper,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  mealBody: {
    padding: 15
  },
  mealName: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  mealMeta: {
    marginTop: 6,
    color: colors.copper,
    fontSize: 14,
    fontWeight: '800'
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12
  },
  tag: {
    borderRadius: 999,
    backgroundColor: colors.cream,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    color: colors.coffee,
    fontSize: 12,
    fontWeight: '800'
  },
  sectionLabel: {
    marginTop: 14,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  bulletText: {
    marginTop: 5,
    color: colors.coffee,
    fontSize: 14,
    lineHeight: 20
  },
  mealNote: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19
  },
  mealActions: {
    gap: 10,
    marginTop: 16
  },
  videoButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.cream,
    paddingHorizontal: 16
  },
  videoButtonText: {
    color: colors.coffee,
    fontSize: 14,
    fontWeight: '800'
  },
  logButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.ink,
    paddingHorizontal: 16
  },
  logButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800'
  },
  logButtonSecondary: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    paddingHorizontal: 16
  },
  logButtonSecondaryText: {
    color: colors.coffee,
    fontSize: 14,
    fontWeight: '800'
  },
  recentCard: {
    gap: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 18
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 14
  },
  entryTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800'
  },
  entrySubtext: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13
  },
  entryStatus: {
    color: colors.copper,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  }
});
