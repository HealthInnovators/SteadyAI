'use client';

import { useAuth } from '@/auth';
import { createApiClient, type ReportsOverview } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';
import { CommunityReport } from '@/features/reports/components/CommunityReport';
import { NutritionReport } from '@/features/reports/components/NutritionReport';
import { WorkoutReport } from '@/features/reports/components/WorkoutReport';

export default function ReportsPage() {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [reportData, setReportData] = useState<ReportsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);
        const data = await api.getReportsOverview(30); // Fetch 30 days of data
        setReportData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    }
    fetchReportData();
  }, [api]);

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d140d]">Reports</h1>
        <p className="text-base text-[#5f5145]">Review your progress and trends over the last 30 days.</p>
      </header>

      {loading && <div className="p-8 text-center">Generating your reports...</div>}
      {error && <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-lg">{error}</div>}

      {reportData ? (
        <div className="space-y-12">
          <WorkoutReport data={{ ...reportData.workout, trend: reportData.trends.workoutMinutes }} />
          <NutritionReport data={{ ...reportData.nutrition, trend: reportData.trends.calories }} />
          <CommunityReport data={{ ...reportData.community, trend: reportData.trends.communityPosts }} />
        </div>
      ) : (
        !loading && !error && (
            <div className="text-center p-8 rounded-lg border-2 border-dashed border-[#ead9ca]">
                <p className="text-sm text-[#5f5145]">Not enough data to generate reports yet.</p>
                <p className="mt-1 text-xs text-[#7a4b28]">Keep logging your activities to see your progress here.</p>
            </div>
        )
      )}
    </div>
  );
}
