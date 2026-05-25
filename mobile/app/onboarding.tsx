import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiClientError, createApiClient } from '../src/api';
import { useAuth } from '../src/auth';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors } from '../src/theme/colors';

const goalOptions = [
  'Build consistency',
  'Improve nutrition habits',
  'Increase energy for daily life',
  'Stay accountable with community'
];

const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];

const dietOptions = ['No preference', 'Vegetarian', 'Vegan', 'High protein', 'Low carb', 'Gluten free'];

const timeOptions = ['10-15 minutes/day', '20-30 minutes/day', '30-45 minutes/day', '60+ minutes/day'];

type StepKey = 'goal' | 'experience' | 'diet' | 'time';

const steps: Array<{ key: StepKey; title: string; subtitle: string }> = [
  {
    key: 'goal',
    title: 'What should SteadyAI help you with first?',
    subtitle: 'Pick the main outcome you want the coach to optimize for.'
  },
  {
    key: 'experience',
    title: 'How familiar are you with fitness routines?',
    subtitle: 'This helps SteadyAI keep workout guidance practical and safe.'
  },
  {
    key: 'diet',
    title: 'Any nutrition preferences?',
    subtitle: 'Select all that apply. You can change this later.'
  },
  {
    key: 'time',
    title: 'How much time can you realistically commit?',
    subtitle: 'SteadyAI will tailor workouts, meals, and check-ins around this.'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, token } = useAuth();
  const api = useMemo(() => createApiClient({ token: () => token }), [token]);
  const [stepIndex, setStepIndex] = useState(0);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [timeAvailability, setTimeAvailability] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      return;
    }

    let active = true;
    async function checkExistingOnboarding() {
      setIsChecking(true);
      try {
        const context = await api.getPlatformContext();
        if (active && context.userIdentity.onboardingCompleted) {
          router.replace('/(tabs)');
        }
      } catch (checkError) {
        if (active && !(checkError instanceof ApiClientError && checkError.status === 404)) {
          setError(formatError(checkError, 'Could not check onboarding status.'));
        }
      } finally {
        if (active) {
          setIsChecking(false);
        }
      }
    }

    void checkExistingOnboarding();
    return () => {
      active = false;
    };
  }, [api, isAuthenticated, isHydrated, router]);

  const currentStep = steps[stepIndex];
  const canContinue = isStepComplete(currentStep.key, {
    primaryGoal,
    experienceLevel,
    dietaryPreferences,
    timeAvailability
  });

  function toggleDiet(option: string) {
    setDietaryPreferences((current) => {
      if (option === 'No preference') {
        return current.includes(option) ? [] : [option];
      }
      const withoutNoPreference = current.filter((item) => item !== 'No preference');
      return withoutNoPreference.includes(option)
        ? withoutNoPreference.filter((item) => item !== option)
        : withoutNoPreference.concat(option);
    });
  }

  async function submitOnboarding() {
    if (!canContinue || isSubmitting) {
      return;
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await api.completeOnboarding({
        primaryGoal,
        experienceLevel,
        dietaryPreferences,
        timeAvailability
      });
      router.replace('/(tabs)');
    } catch (submitError) {
      setError(formatError(submitError, 'Could not complete onboarding.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isHydrated || isChecking) {
    return (
      <SafeAreaView style={styles.centeredSafeArea}>
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.ink} size="large" />
          <Text style={styles.loadingTitle}>Preparing your setup</Text>
          <Text style={styles.loadingBody}>Checking your SteadyAI profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.centeredSafeArea}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Sign in to set up SteadyAI</Text>
          <Text style={styles.loadingBody}>Onboarding saves your goals, preferences, and time availability to your account.</Text>
          <Link href="/sign-in" asChild>
            <PrimaryButton>Sign In</PrimaryButton>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.eyebrow}>Step {stepIndex + 1} of 4</Text>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((stepIndex + 1) / steps.length) * 100}%` }]} />
        </View>

        <View style={styles.optionCard}>
          {currentStep.key === 'goal'
            ? goalOptions.map((option) => (
                <OptionButton key={option} label={option} selected={primaryGoal === option} onPress={() => setPrimaryGoal(option)} />
              ))
            : null}

          {currentStep.key === 'experience'
            ? experienceOptions.map((option) => (
                <OptionButton
                  key={option}
                  label={option}
                  selected={experienceLevel === option}
                  onPress={() => setExperienceLevel(option)}
                />
              ))
            : null}

          {currentStep.key === 'diet'
            ? dietOptions.map((option) => (
                <OptionButton
                  key={option}
                  label={option}
                  selected={dietaryPreferences.includes(option)}
                  onPress={() => toggleDiet(option)}
                />
              ))
            : null}

          {currentStep.key === 'time'
            ? timeOptions.map((option) => (
                <OptionButton
                  key={option}
                  label={option}
                  selected={timeAvailability === option}
                  onPress={() => setTimeAvailability(option)}
                />
              ))
            : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          {stepIndex > 0 ? (
            <PrimaryButton disabled={isSubmitting} onPress={() => setStepIndex((current) => current - 1)} variant="secondary">
              Back
            </PrimaryButton>
          ) : null}
          <PrimaryButton disabled={!canContinue || isSubmitting} onPress={() => void submitOnboarding()}>
            {stepIndex === steps.length - 1 ? (isSubmitting ? 'Saving...' : 'Finish Setup') : 'Continue'}
          </PrimaryButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionButton({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.optionButton, selected ? styles.optionButtonSelected : null]}>
      <View style={[styles.optionMarker, selected ? styles.optionMarkerSelected : null]} />
      <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function isStepComplete(
  step: StepKey,
  values: {
    primaryGoal: string;
    experienceLevel: string;
    dietaryPreferences: string[];
    timeAvailability: string;
  }
): boolean {
  switch (step) {
    case 'goal':
      return Boolean(values.primaryGoal);
    case 'experience':
      return Boolean(values.experienceLevel);
    case 'diet':
      return values.dietaryPreferences.length > 0;
    case 'time':
      return Boolean(values.timeAvailability);
    default:
      return false;
  }
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
  centeredSafeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.linen,
    padding: 20
  },
  content: {
    flexGrow: 1,
    gap: 22,
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
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -1
  },
  subtitle: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: colors.sand
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.ink
  },
  optionCard: {
    gap: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 16
  },
  optionButton: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    padding: 14
  },
  optionButtonSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.cream
  },
  optionMarker: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper
  },
  optionMarkerSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.ink
  },
  optionText: {
    flex: 1,
    color: colors.coffee,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22
  },
  optionTextSelected: {
    color: colors.ink
  },
  actions: {
    gap: 12
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20
  },
  loadingCard: {
    width: '100%',
    gap: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 24
  },
  loadingTitle: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center'
  },
  loadingBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  }
});
