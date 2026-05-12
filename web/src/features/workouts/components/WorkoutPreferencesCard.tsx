'use client';

import { useAuth } from '@/auth';
import { createApiClient, type WorkoutPreferences } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

function PreferenceItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-[#7a4b28]">{label}</p>
      <p className="text-base text-[#4e4035]">{value || 'Not set'}</p>
    </div>
  );
}

export function WorkoutPreferencesCard() {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [preferences, setPreferences] = useState<WorkoutPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        setLoading(true);
        const prefs = await api.getWorkoutPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to load workout preferences:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPreferences();
  }, [api]);

  if (loading) {
    return <div className="p-4 text-center">Loading preferences...</div>;
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Workout Preferences</h3>
      {preferences ? (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <PreferenceItem label="Preferred Duration" value={preferences.preferredDurationMinutes ? `${preferences.preferredDurationMinutes} min` : null} />
          <PreferenceItem label="Preferred Impact" value={preferences.preferredImpact} />
          <PreferenceItem label="Equipment" value={preferences.equipment} />
          <PreferenceItem label="Auto-post Check-in" value={preferences.autoPostCheckIn ? 'Enabled' : 'Disabled'} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#5f5145]">You haven&apos;t set any workout preferences yet.</p>
      )}
    </div>
  );
}
