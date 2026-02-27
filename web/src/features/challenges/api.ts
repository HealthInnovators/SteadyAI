import type { ApiClient } from '@/lib/api';
import type { ChallengeCheckInRequest, ChallengeCheckInResponse } from './types';

export function submitChallengeCheckIn(
  api: ApiClient,
  payload: ChallengeCheckInRequest
): Promise<ChallengeCheckInResponse> {
  return api.post<ChallengeCheckInResponse, ChallengeCheckInRequest>('/api/challenges/check-in', {
    body: payload
  });
}
