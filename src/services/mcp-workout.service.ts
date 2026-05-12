import { createLlmClientFromEnv } from './llm';
import { getWorkoutPreferences, getWorkoutHistorySummary, getLatestWorkoutSessionInsight } from './workout-session.service';

// This function is moved from apps-mcp.ts to be reusable.
export async function generateWorkoutPlan(options: { userId: string; prompt: string; currentPlan?: any }) {
    const llm = createLlmClientFromEnv();
    const prefs = await getWorkoutPreferences(options.userId);
    const history = await getWorkoutHistorySummary(options.userId, 7);
    const weeklyInsight = await getLatestWorkoutSessionInsight(options.userId);

    const result = await llm.generateObject({
      prompt: `Generate a workout plan. ${options.prompt}`,
      schema: {} as any, 
    });

    return {
        plan: result,
        preferences: prefs,
        history7d: history,
        weeklyInsight: weeklyInsight,
        userId: options.userId,
    };
}
