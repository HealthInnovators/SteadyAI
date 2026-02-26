import { ApiClient } from './apiClient';

export function createApiClient(token?: string | (() => string | undefined | null)): ApiClient {
  return new ApiClient({ token });
}

export { ApiClient, ApiClientError } from './apiClient';
export * from './types';
