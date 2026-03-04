import type { ApiClient } from '@/lib/api';
import type { ReportsOverview } from './types';

export function getReportsOverview(api: ApiClient, days = 7): Promise<ReportsOverview> {
  return api.get<ReportsOverview>('/api/reports/overview', {
    query: { days }
  });
}

