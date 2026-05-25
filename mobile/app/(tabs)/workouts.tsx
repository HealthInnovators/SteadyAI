import { Link } from 'expo-router';
import * as LinkingApi from 'expo-linking';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { ApiClientError, createApiClient, type ExerciseMedia, type WorkoutHistorySummary, type WorkoutPlan } from '../../src/api';
import { useAuth } from '../../src/auth';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors } from '../../src/theme/colors';

type WorkoutFeedback = 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD';

const promptChips = [
  'Create a lower body workout for today at the gym.',
  'Create a 20-minute low-impact workout with no equipment.',
  'Create an upper body strength workout for beginners.'
];

export default function WorkoutsTab() {
  const { isAuthenticated, token, userId } = useAuth();
  const api = useMemo(() => createApiClient({ token: () => token }), [token]);
  const [prompt, setPrompt] = useState(promptChips[0]);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [history, setHistory] = useState<WorkoutHistorySummary | null>(null);
  const [mediaByName, setMediaByName] = useState<Record<string, ExerciseMedia>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setHistory(null);
      setMediaByName({});
      return;
    }

    let active = true;
    async function loadWorkoutContext() {
      try {
        const [nextHistory, media] = await Promise.all([
          api.getWorkoutHistory().catch(() => null),
          api.getExerciseMedia().catch(() => [])
        ]);

        if (!active) {
          return;
        }

        setHistory(nextHistory);
        setMediaByName(
          Object.fromEntries(
            media.map((item) => [normalizeExerciseName(item.displayName), item])
          )
        );
      } catch {
        if (active) {
          setStatus('Workout context is unavailable. You can still generate a plan.');
        }
      }
    }

    void loadWorkoutContext();
    return () => {
      active = false;
    };
  }, [api, isAuthenticated]);

  async function generateWorkout(nextPrompt = prompt): Promise<void> {
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
      if (!response.workoutPlan) {
        throw new Error('The coach did not return a workout plan. Try asking specifically for a workout.');
      }
      setPlan(response.workoutPlan);
      setCompleted({});
      setStatus('Workout generated.');
    } catch (generateError) {
      setError(formatError(generateError));
    } finally {
      setIsGenerating(false);
    }
  }

  async function logWorkout(feedback: WorkoutFeedback): Promise<void> {
    if (!plan || !userId) {
      setError('Sign in before logging workouts.');
      return;
    }

    setIsLogging(true);
    setError(null);
    setStatus(null);
    try {
      const completedCount = plan.exercises.filter((exercise) => completed[exercise.name]).length;
      await api.logWorkoutSession({
        userId,
        sessionId: plan.planId,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        totalDurationMinutes: plan.estimatedTotalMin,
        completedExercises: completedCount || plan.exercises.length,
        totalExercises: plan.exercises.length,
        workoutPlan: plan as unknown as Record<string, unknown>,
        feedback,
        sourceApp: 'steadyai-expo-mobile'
      });
      setStatus('Workout logged.');
      const nextHistory = await api.getWorkoutHistory().catch(() => null);
      if (nextHistory) {
        setHistory(nextHistory);
      }
    } catch (logError) {
      setError(formatError(logError));
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={styles.eyebrow}>Workouts</Text>
          <Text style={styles.title}>Generate, follow, and log today&apos;s workout.</Text>
          <Text style={styles.subtitle}>
            Ask for the workout you want. SteadyAI returns sets, reps, timing, and exercise media links when available.
          </Text>
        </View>

        <View style={styles.contextRow}>
          <MetricCard label="Sessions" value={history ? String(history.sessions) : isAuthenticated ? '-' : 'Sign in'} />
          <MetricCard label="Streak" value={history ? `${history.streakDays}d` : '-'} />
          <MetricCard label="Avg min" value={history ? String(Math.round(history.avgDurationMinutes)) : '-'} />
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.cardTitle}>Workout request</Text>
          <TextInput
            multiline
            onChangeText={setPrompt}
            placeholder="Example: lower body workout at the gym"
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
                  void generateWorkout(chip);
                }}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton disabled={isGenerating || !prompt.trim()} onPress={() => void generateWorkout()}>
            {isGenerating ? 'Generating...' : 'Generate Workout'}
          </PrimaryButton>
        </View>

        {isGenerating ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.ink} />
            <Text style={styles.loadingText}>Building your workout...</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {status ? <Text style={styles.statusText}>{status}</Text> : null}

        {plan ? (
          <View style={styles.planCard}>
            <Text style={styles.planKicker}>Workout plan</Text>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planMeta}>
              {plan.focus} · {plan.estimatedTotalMin} minutes · {plan.exercises.length} exercises
            </Text>

            <View style={styles.exerciseList}>
              {plan.exercises.map((exercise, index) => (
                <ExerciseCard
                  completed={Boolean(completed[exercise.name])}
                  index={index}
                  key={`${exercise.name}-${index}`}
                  media={mediaByName[normalizeExerciseName(exercise.name)]}
                  onToggle={() =>
                    setCompleted((current) => ({
                      ...current,
                      [exercise.name]: !current[exercise.name]
                    }))
                  }
                  planExercise={exercise}
                />
              ))}
            </View>

            {isAuthenticated ? (
              <View style={styles.logActions}>
                <PrimaryButton disabled={isLogging} onPress={() => void logWorkout('TOO_EASY')} variant="secondary">
                  Too Easy
                </PrimaryButton>
                <PrimaryButton disabled={isLogging} onPress={() => void logWorkout('JUST_RIGHT')}>
                  {isLogging ? 'Logging...' : 'Log Workout'}
                </PrimaryButton>
                <PrimaryButton disabled={isLogging} onPress={() => void logWorkout('TOO_HARD')} variant="secondary">
                  Too Hard
                </PrimaryButton>
              </View>
            ) : (
              <View style={styles.signInCard}>
                <Text style={styles.signInText}>Sign in to save workout logs and progress history.</Text>
                <Link href="/sign-in" asChild>
                  <PrimaryButton variant="secondary">Sign In</PrimaryButton>
                </Link>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ExerciseCard({
  completed,
  index,
  media,
  onToggle,
  planExercise
}: {
  completed: boolean;
  index: number;
  media?: ExerciseMedia;
  onToggle: () => void;
  planExercise: WorkoutPlan['exercises'][number];
}) {
  const mediaUrl = planExercise.videoUrl || planExercise.gifUrl || planExercise.demoUrl || media?.videoUrl || media?.gifUrl || media?.demoUrl;

  return (
    <Pressable onPress={onToggle} style={[styles.exerciseCard, completed ? styles.exerciseCompleted : null]}>
      <View style={styles.exerciseIndex}>
        <Text style={styles.exerciseIndexText}>{completed ? '✓' : index + 1}</Text>
      </View>
      <View style={styles.exerciseBody}>
        <Text style={styles.exerciseName}>{planExercise.name}</Text>
        <Text style={styles.exercisePrescription}>
          {planExercise.durationMin} min · {planExercise.reps}
        </Text>
        <Text style={styles.exerciseNote}>{planExercise.note}</Text>
        {mediaUrl ? (
          <Pressable
            onPress={() => {
              void LinkingApi.openURL(mediaUrl);
            }}
            style={styles.mediaButton}
          >
            <Text style={styles.mediaButtonText}>Open exercise media</Text>
          </Pressable>
        ) : (
          <Text style={styles.mediaMuted}>No media link yet</Text>
        )}
      </View>
    </Pressable>
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

function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^finisher:\s*/i, '')
    .replace(/[+]/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Workout request failed.';
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
    fontSize: 22,
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
  cardTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800'
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
  exerciseList: {
    gap: 12
  },
  exerciseCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    padding: 14
  },
  exerciseCompleted: {
    backgroundColor: colors.cream
  },
  exerciseIndex: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.ink
  },
  exerciseIndexText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800'
  },
  exerciseBody: {
    flex: 1
  },
  exerciseName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800'
  },
  exercisePrescription: {
    marginTop: 4,
    color: colors.copper,
    fontSize: 13,
    fontWeight: '800'
  },
  exerciseNote: {
    marginTop: 6,
    color: colors.coffee,
    fontSize: 13,
    lineHeight: 19
  },
  mediaButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  mediaButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800'
  },
  mediaMuted: {
    marginTop: 8,
    color: '#9a897a',
    fontSize: 12,
    fontStyle: 'italic'
  },
  logActions: {
    gap: 10
  },
  signInCard: {
    gap: 10,
    borderRadius: 22,
    backgroundColor: colors.cream,
    padding: 14
  },
  signInText: {
    color: colors.coffee,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700'
  }
});
