import { createApiClient } from '@/lib/api';

const DEFAULT_ONBOARDED_ROUTE = '/ai-coach';
const DEFAULT_ONBOARDING_ROUTE = '/onboarding';

export function sanitizeAuthRedirect(value: string | null | undefined): string {
  if (!value || !value.trim()) {
    return DEFAULT_ONBOARDING_ROUTE;
  }

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) {
      return DEFAULT_ONBOARDING_ROUTE;
    }

    return `${url.pathname}${url.search}${url.hash}` || DEFAULT_ONBOARDING_ROUTE;
  } catch {
    return value.startsWith('/') && !value.startsWith('//') ? value : DEFAULT_ONBOARDING_ROUTE;
  }
}

export async function resolvePostAuthRedirect(accessToken: string, requestedTarget?: string | null): Promise<string> {
  const target = sanitizeAuthRedirect(requestedTarget);

  try {
    const api = createApiClient(accessToken);
    const context = await api.getPlatformContext();

    if (!context.userIdentity.onboardingCompleted) {
      return DEFAULT_ONBOARDING_ROUTE;
    }

    if (target === DEFAULT_ONBOARDING_ROUTE || target.startsWith('/sign-in')) {
      return DEFAULT_ONBOARDED_ROUTE;
    }

    return target;
  } catch {
    return target;
  }
}
