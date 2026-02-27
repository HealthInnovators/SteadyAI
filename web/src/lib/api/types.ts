export type QueryValue = string | number | boolean | undefined | null;

export interface ApiClientOptions {
  baseUrl?: string;
  token?: string | (() => string | undefined | null);
  defaultHeaders?: HeadersInit;
}

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  query?: Record<string, QueryValue>;
  headers?: HeadersInit;
}

export interface BodyRequestOptions<B> extends RequestOptions {
  body?: B;
}

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}
