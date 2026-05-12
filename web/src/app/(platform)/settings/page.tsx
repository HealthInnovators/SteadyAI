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
        <section>
            <h2 className="text-2xl font-bold text-[#1d140d] mb-4">{title}</h2>
            <div className="space-y-6">
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
    return <div className="p-6 text-center">Loading settings...</div>;
  }

  if (error || !context) {
    return <div className="p-6 text-center text-red-600">{error || 'Could not load platform context.'}</div>;
  }

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d140d]">Settings</h1>
        <p className="text-base text-[#5f5145]">Manage your account, privacy, and notification settings.</p>
      </header>

      <div className="space-y-12">
        <SettingsSection title="Account">
            <ProfileCard context={context} />
        </SettingsSection>
        
        <SettingsSection title="Privacy & Data">
            <PrivacyCard />
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
  );
}
