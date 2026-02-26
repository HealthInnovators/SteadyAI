const SERVER_FALLBACK_URL = 'http://localhost:3000';

export function getApiBaseUrl(isServer: boolean): string {
  if (isServer) {
    return process.env.STEADY_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || SERVER_FALLBACK_URL;
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL || SERVER_FALLBACK_URL;
}
