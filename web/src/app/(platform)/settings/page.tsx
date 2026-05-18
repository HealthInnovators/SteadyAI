'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/auth';
import { createApiClient, type PlatformContext } from '@/lib/api';
import { ProfileCard } from '@/features/settings/components/ProfileCard';
import { LegalLinksCard } from '@/features/settings/components/LegalLinksCard';
import { PrivacyCard } from '@/features/settings/components/PrivacyCard';
import { ConnectedServicesCard } from '@/features/settings/components/ConnectedServicesCard';
import { NotificationsCard } from '@/features/settings/components/NotificationsCard';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <h2 className="px-1 text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">{title}</h2>
            <div className="space-y-4">
                {children}
            </div>
        </section>
    );
}


export default function SettingsPage() {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [context, setContext] = useState<PlatformContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContext() {
      try {
        setLoading(true);
        const platformContext = await api.getPlatformContext();
        setContext(platformContext);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    }
    fetchContext();
  }, [api]);

  if (loading) {
    return <SettingsLoading />;
  }

  if (error || !context) {
    return (
      <div className="min-h-screen px-4 pb-28 pt-4 sm:px-6 md:p-8">
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
          {error || 'Could not load platform context.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-28 pt-4 sm:px-6 md:p-8">
      <header className="mb-5 rounded-[34px] border border-white/80 bg-[#fffaf5]/84 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.1)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#8a4b22]">Account controls</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#1d140d] sm:text-4xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5145] sm:text-base">
          Manage your profile, privacy choices, connected devices, notifications, and legal information.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <SettingsSection title="Account">
            <ProfileCard context={context} />
          </SettingsSection>

          <SettingsSection title="Privacy & Data">
            <PrivacyCard />
          </SettingsSection>
        </div>

        <div className="space-y-5">
          <SettingsSection title="Connected Devices">
            <ConnectedServicesCard />
          </SettingsSection>

          <SettingsSection title="Notifications">
            <NotificationsCard />
          </SettingsSection>

          <SettingsSection title="Legal">
            <LegalLinksCard />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

function SettingsLoading() {
  return (
    <div className="min-h-screen px-4 pb-28 pt-4 sm:px-6 md:p-8">
      <div className="animate-pulse rounded-[34px] border border-white/80 bg-white/60 p-5">
        <div className="h-4 w-36 rounded-full bg-[#ead9ca]" />
        <div className="mt-4 h-8 w-44 rounded-full bg-[#ead9ca]" />
        <div className="mt-3 h-4 w-2/3 rounded-full bg-[#f3e7da]" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-56 animate-pulse rounded-[32px] border border-white/80 bg-white/60 p-5">
            <div className="h-4 w-28 rounded-full bg-[#ead9ca]" />
            <div className="mt-4 space-y-3">
              <div className="h-14 rounded-[20px] bg-[#f3e7da]" />
              <div className="h-14 rounded-[20px] bg-[#f3e7da]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
