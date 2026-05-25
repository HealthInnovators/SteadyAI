import { env } from '../config/env';
import type {
  ApiErrorPayload,
  ApiQueryValue,
  AssistantMessageResponse,
  DailyCheckInReminderScheduleInput,
  DailyCheckInReminderScheduleResponse,
  ExerciseMedia,
  NutritionEntry,
  NutritionIngestInput,
  NutritionIngestResponse,
  OnboardingInput,
  PlatformContext,
  ReportsOverview,
  RequestOptions,
  WorkoutHistorySummary,
  WorkoutPreferences,
  WorkoutSessionSummaryInput
} from './types';

export class ApiClientError extends Error {
  status: number;
  payload?: ApiErrorPayload | string;

  constructor(message: string, status: number, payload?: ApiErrorPayload | string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.payload = payload;
  }
}

type ApiClientConfig = {
  baseUrl?: string;
  token?: string | null | (() => string | null | undefined);
  defaultHeaders?: Record<string, string>;
};

type JsonRequestOptions = RequestOptions & {
  body?: unknown;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly token?: ApiClientConfig['token'];
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = normalizeBaseUrl(config.baseUrl ?? env.apiBaseUrl);
    this.token = config.token;
    this.defaultHeaders = config.defaultHeaders ?? {};
  }

  getPlatformContext(options: RequestOptions = {}): Promise<PlatformContext> {
    return this.get('/api/platform/context', options);
  }

  sendAssistantMessage(message: string, options: RequestOptions = {}): Promise<AssistantMessageResponse> {
    return this.post('/api/assistant/message', {
      ...options,
      body: { message }
    });
  }

  getWorkoutPreferences(options: RequestOptions = {}): Promise<WorkoutPreferences> {
    return this.get('/api/workouts/preferences', options);
  }

  getWorkoutHistory(options: RequestOptions = {}): Promise<WorkoutHistorySummary> {
    return this.get('/api/workouts/history', options);
  }

  getExerciseMedia(options: RequestOptions = {}): Promise<ExerciseMedia[]> {
    return this.get('/api/workouts/exercise-media', options);
  }

  logWorkoutSession(input: WorkoutSessionSummaryInput, options: RequestOptions = {}): Promise<unknown> {
    return this.post('/api/workouts/session-summary', {
      ...options,
      body: input
    });
  }

  ingestNutrition(input: NutritionIngestInput, options: RequestOptions = {}): Promise<NutritionIngestResponse> {
    return this.post('/api/nutrition/ingest', {
      ...options,
      body: input
    });
  }

  getNutritionEntries(limit = 10, options: RequestOptions = {}): Promise<NutritionEntry[]> {
    return this.get('/api/nutrition/entries', {
      ...options,
      query: {
        ...options.query,
        limit
      }
    });
  }

  scheduleDailyCheckInReminder(
    input: DailyCheckInReminderScheduleInput,
    options: RequestOptions = {}
  ): Promise<DailyCheckInReminderScheduleResponse> {
    return this.post('/api/notifications/daily-check-in/schedule', {
      ...options,
      body: input
    });
  }

  completeOnboarding(input: OnboardingInput, options: RequestOptions = {}): Promise<unknown> {
    return this.post('/api/onboarding', {
      ...options,
      body: input
    });
  }

  getReportsOverview(days = 7, options: RequestOptions = {}): Promise<ReportsOverview> {
    return this.get('/api/reports/overview', {
      ...options,
      query: {
        ...options.query,
        days
      }
    });
  }

  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, options: JsonRequestOptions = {}): Promise<T> {
    return this.request<T>('POST', path, options);
  }

  put<T>(path: string, options: JsonRequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', path, options);
  }

  patch<T>(path: string, options: JsonRequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', path, options);
  }

  delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  private async request<T>(method: string, path: string, options: JsonRequestOptions = {}): Promise<T> {
    const headers = new Headers(this.defaultHeaders);
    headers.set('Accept', 'application/json');

    const token = options.token ?? this.resolveToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    for (const [key, value] of Object.entries(options.headers ?? {})) {
      headers.set(key, value);
    }

    const hasBody = Object.prototype.hasOwnProperty.call(options, 'body') && options.body !== undefined;
    if (hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(buildUrl(this.baseUrl, path, options.query), {
      method,
      headers,
      signal: options.signal,
      body: hasBody ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      throw await buildApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return response.text() as Promise<T>;
  }

  private resolveToken(): string | null {
    const value = typeof this.token === 'function' ? this.token() : this.token;
    return value?.trim() || null;
  }
}

export function createApiClient(config: ApiClientConfig = {}): ApiClient {
  return new ApiClient(config);
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, ApiQueryValue>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseAlreadyHasApi = /\/api$/.test(baseUrl);
  const pathWithoutDuplicateApi = baseAlreadyHasApi ? normalizedPath.replace(/^\/api(?=\/|$)/, '') : normalizedPath;
  const url = new URL(`${baseUrl}${pathWithoutDuplicateApi}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function buildApiError(response: Response): Promise<ApiClientError> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as ApiErrorPayload;
    return new ApiClientError(
      payload.error ?? payload.message ?? payload.detail ?? `Request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  const text = await response.text();
  return new ApiClientError(text || `Request failed with status ${response.status}`, response.status, text || undefined);
}
