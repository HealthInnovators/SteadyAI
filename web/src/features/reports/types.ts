export interface ReportsOverview {
  period: {
    days: number;
    from: string;
    to: string;
  };
  challenge: {
    activeParticipation: boolean;
    totalCheckIns: number;
    completed: number;
    partial: number;
    skipped: number;
    completionRate: number;
    currentStreakDays: number;
  };
  nutrition: {
    entries: number;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    avgCaloriesPerEntry: number;
  };
  workout: {
    sessions: number;
    totalMinutes: number;
    avgMinutesPerSession: number;
    avgCompletionRate: number | null;
    feedback: {
      TOO_EASY: number;
      JUST_RIGHT: number;
      TOO_HARD: number;
    };
  };
  community: {
    posts: number;
    postTypes: {
      WIN: number;
      QUESTION: number;
      CHECK_IN: number;
    };
    reactionsGiven: number;
    reactionsReceived: number;
    repliesReceived: number;
  };
  trends: {
    days: number;
    checkInsCompleted: Array<{ date: string; label: string; value: number }>;
    calories: Array<{ date: string; label: string; value: number }>;
    workoutMinutes: Array<{ date: string; label: string; value: number }>;
    communityPosts: Array<{ date: string; label: string; value: number }>;
  };
}
