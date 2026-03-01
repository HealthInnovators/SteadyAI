import { getApiBaseUrl } from '@/config/env';
import type { ApiClientOptions, ApiErrorPayload, BodyRequestOptions, QueryValue, RequestOptions } from './types';

export class ApiClientError extends Error {
  readonly status: number;
  readonly payload?: ApiErrorPayload | string;

  constructor(message: string, status: number, payload?: ApiErrorPayload | string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.payload = payload;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly token?: ApiClientOptions['token'];
  private readonly defaultHeaders?: HeadersInit;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = stripTrailingSlash(options.baseUrl || getApiBaseUrl(typeof window === 'undefined'));
    this.token = options.token;
    this.defaultHeaders = options.defaultHeaders;
  }

  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  post<T, B = unknown>(path: string, options: BodyRequestOptions<B> = {}): Promise<T> {
    return this.request<T>('POST', path, options);
  }

  put<T, B = unknown>(path: string, options: BodyRequestOptions<B> = {}): Promise<T> {
    return this.request<T>('PUT', path, options);
  }

  patch<T, B = unknown>(path: string, options: BodyRequestOptions<B> = {}): Promise<T> {
    return this.request<T>('PATCH', path, options);
  }

  delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options: RequestOptions | BodyRequestOptions<unknown>
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const token = this.resolveToken();

    const headers = new Headers(this.defaultHeaders);
    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => headers.set(key, value));
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      const devUserId = getDevUserId();
      if (devUserId) {
        headers.set('x-test-user-id', devUserId);
      }
    }

    const hasBody = 'body' in options && options.body !== undefined;
    if (hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      method,
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      throw await this.buildApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return (await response.text()) as T;
    }

    return (await response.json()) as T;
  }

  private resolveToken(): string | undefined {
    if (typeof this.token === 'function') {
      return normalizeToken(this.token());
    }

    return normalizeToken(this.token);
  }

  private buildUrl(path: string, query?: Record<string, QueryValue>): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async buildApiError(response: Response): Promise<ApiClientError> {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as ApiErrorPayload;
      const message = payload.error || payload.message || payload.detail || `Request failed with status ${response.status}`;
      return new ApiClientError(message, response.status, payload);
    }

const textPayload = await response.text();
    return new ApiClientError(textPayload || `Request failed with status ${response.status}`, response.status, textPayload || undefined);
  }
}

const DEV_USER_ID_STORAGE_KEY = 'steadyai.dev-user-id';

function normalizeToken(token: string | undefined | null): string | undefined {
  return token?.trim() || undefined;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function getDevUserId(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const value = window.localStorage.getItem(DEV_USER_ID_STORAGE_KEY);
  return value?.trim() || undefined;
}
