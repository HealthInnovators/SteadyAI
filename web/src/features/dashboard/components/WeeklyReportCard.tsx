'use client';

import { useAuth } from '@/auth';
import { getReportsOverview, type ReportsOverview } from '@/features/reports';
import { createApiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// This is a simplified version of the StatTile from the original page.
function StatTile({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-lg border border-white/70 bg-white/50 p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[#7a4b28]">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </div>
    );
}

export function WeeklyReportCard() {
    const { token } = useAuth();
    const api = useMemo(() => createApiClient(token ?? undefined), [token]);
    const [reportData, setReportData] = useState<ReportsOverview | null>(null);
    const [reportLoading, setReportLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function loadReport() {
            setReportLoading(true);
            try {
                const next = await getReportsOverview(api, 7);
                if (active) {
                    setReportData(next);
                }
            } catch (error) {
                console.error("Failed to load report overview:", error);
            } finally {
                if (active) {
                    setReportLoading(false);
                }
            }
        }
        void loadReport();
        return () => { active = false; };
    }, [api]);

    if (reportLoading) {
        return (
            <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm">
                <h3 className="text-lg font-semibold">Weekly Report</h3>
                <p className="mt-2 text-sm text-[#5f5145]">Generating your weekly summary...</p>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm">
                <h3 className="text-lg font-semibold">Weekly Report</h3>
                <p className="mt-2 text-sm text-[#5f5145]">Not enough data for a report yet. Keep tracking your progress!</p>
                <Link href="/reports" className="mt-4 inline-block rounded-full bg-[#1d140d] px-4 py-2 text-sm text-white">
                    View Reports
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Weekly Report</h3>
                <Link href="/reports" className="text-sm font-medium text-[#7a4b28] hover:underline">
                Full Report &rarr;
                </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
                <StatTile label="Workouts" value={String(reportData.workout.sessions)} />
                <StatTile label="Streak" value={`${reportData.challenge.currentStreakDays} days`} />
                <StatTile label="Meals Logged" value={String(reportData.nutrition.entries)} />
                <StatTile label="Posts" value={String(reportData.community.posts)} />
            </div>
        </div>
    );
}
