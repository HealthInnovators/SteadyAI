export type ChallengeCheckInStatus = 'COMPLETED' | 'PARTIAL' | 'SKIPPED';

export interface ChallengeCheckInRequest {
  status: ChallengeCheckInStatus;
}

export interface ChallengeCheckInCounts {
  total: number;
  completed: number;
  partial: number;
  skipped: number;
}

export interface ChallengeLatestCheckIn {
  date: string;
  status: ChallengeCheckInStatus;
}

export interface ChallengeCheckInResponse {
  participationId: string;
  challengeId: string;
  participationStatus: string;
  latestCheckIn?: ChallengeLatestCheckIn | null;
  counts: ChallengeCheckInCounts;
}
