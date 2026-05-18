'use client';

import { useAuth } from '@/auth';
import { createApiClient, type WorkoutPreferences } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

function PreferenceItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-[20px] border border-white/80 bg-white/72 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a4b28]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[#4e4035]">{value || 'Not set'}</p>
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
    return (
      <div className="animate-pulse rounded-[32px] border border-white/80 bg-white/60 p-5">
        <div className="h-4 w-32 rounded-full bg-[#ead9ca]" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-20 rounded-[20px] bg-[#f3e7da]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Personalization</p>
        <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Workout Preferences</h3>
      </div>
      {preferences ? (
        <div className="grid grid-cols-2 gap-3">
          <PreferenceItem label="Preferred Duration" value={preferences.preferredDurationMinutes ? `${preferences.preferredDurationMinutes} min` : null} />
          <PreferenceItem label="Preferred Impact" value={preferences.preferredImpact} />
          <PreferenceItem label="Equipment" value={preferences.equipment} />
          <PreferenceItem label="Auto-post Check-in" value={preferences.autoPostCheckIn ? 'Enabled' : 'Disabled'} />
        </div>
      ) : (
        <p className="rounded-[24px] border border-dashed border-[#d8c4b3] bg-white/60 p-5 text-sm leading-6 text-[#5f5145]">
          You haven&apos;t set any workout preferences yet. Ask SteadyAI to remember your preferred duration, impact, and equipment.
        </p>
      )}
    </section>
  );
}
