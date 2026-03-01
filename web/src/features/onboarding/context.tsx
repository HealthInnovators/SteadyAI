'use client';

import { createApiClient } from '@/lib/api';
import { useAuth } from '@/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type { OnboardingDraft, OnboardingPayload, OnboardingResponse } from './types';

const STORAGE_KEY = 'steadyai.onboarding.draft';

const initialDraft: OnboardingDraft = {
  primaryGoal: '',
  experienceLevel: '',
  dietaryPreferences: [],
  timeAvailability: ''
};

interface OnboardingContextValue {
  draft: OnboardingDraft;
  isHydrated: boolean;
  isSubmitting: boolean;
  error: string | null;
  setPrimaryGoal: (value: string) => void;
  setExperienceLevel: (value: string) => void;
  toggleDietaryPreference: (value: string) => void;
  setTimeAvailability: (value: string) => void;
  clearError: () => void;
  submit: () => Promise<OnboardingResponse>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, loginAsDevUser } = useAuth();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
        setDraft({
          primaryGoal: parsed.primaryGoal || '',
          experienceLevel: parsed.experienceLevel || '',
          dietaryPreferences: parsed.dietaryPreferences || [],
          timeAvailability: parsed.timeAvailability || ''
        });
      }
    } catch {
      setDraft(initialDraft);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, isHydrated]);

  const setPrimaryGoal = useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, primaryGoal: value }));
    setError(null);
  }, []);

  const setExperienceLevel = useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, experienceLevel: value }));
    setError(null);
  }, []);

  const toggleDietaryPreference = useCallback((value: string) => {
    setDraft((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(value)
        ? prev.dietaryPreferences.filter((item) => item !== value)
        : [...prev.dietaryPreferences, value]
    }));
    setError(null);
  }, []);

  const setTimeAvailability = useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, timeAvailability: value }));
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(async () => {
    if (isSubmitting) {
      throw new Error('Submission in progress');
    }

    const payload: OnboardingPayload = {
      primaryGoal: draft.primaryGoal.trim(),
      experienceLevel: draft.experienceLevel.trim(),
      dietaryPreferences: draft.dietaryPreferences,
      timeAvailability: draft.timeAvailability.trim()
    };

    if (!payload.primaryGoal || !payload.experienceLevel || !payload.timeAvailability) {
      const message = 'Please complete all onboarding fields before submitting.';
      setError(message);
      throw new Error(message);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const api = createApiClient(() => token || undefined);
      const response = await api.post<OnboardingResponse, OnboardingPayload>('/api/onboarding', {
        body: payload
      });
      const resolvedUserId =
        typeof response.userId === 'string'
          ? response.userId
          : typeof response.id === 'string'
            ? response.id
            : null;

      if (!token && resolvedUserId) {
        loginAsDevUser(resolvedUserId);
      }
      window.localStorage.removeItem(STORAGE_KEY);
      return response;
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Failed to submit onboarding';
      setError(message);
      throw submissionError;
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, isSubmitting, loginAsDevUser, token]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      draft,
      isHydrated,
      isSubmitting,
      error,
      setPrimaryGoal,
      setExperienceLevel,
      toggleDietaryPreference,
      setTimeAvailability,
      clearError,
      submit
    }),
    [clearError, draft, error, isHydrated, isSubmitting, setExperienceLevel, setPrimaryGoal, setTimeAvailability, submit, toggleDietaryPreference]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>.');
  }

  return context;
}
