import { ApiClientError, createApiClient } from '../api';

export type PostAuthRoute = '/(tabs)' | '/onboarding';

export async function resolvePostAuthRoute(token: string | null | undefined): Promise<PostAuthRoute> {
  if (!token) {
    return '/(tabs)';
  }

  try {
    const context = await createApiClient({ token }).getPlatformContext();
    return context.userIdentity.onboardingCompleted ? '/(tabs)' : '/onboarding';
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return '/onboarding';
    }
    return '/(tabs)';
  }
}
