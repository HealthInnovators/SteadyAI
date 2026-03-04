import type { ApiClient } from '@/lib/api';
import type {
  CoachFeedbackListResponse,
  CreateCoachFeedbackRequestInput,
  CreateCoachFeedbackRequestResponse,
  McpUserSummary,
  OptionalProductSuggestionResponse,
  StoreProduct,
  StoreProductsResponse
} from './types';

export async function getStoreProducts(api: ApiClient): Promise<StoreProduct[]> {
  const response = await api.get<StoreProductsResponse>('/api/store/products');
  return Array.isArray(response.items) ? response.items : [];
}

export async function getOptionalProductSuggestions(
  api: ApiClient,
  summary: McpUserSummary
): Promise<OptionalProductSuggestionResponse> {
  return api.post<OptionalProductSuggestionResponse, McpUserSummary>('/api/store/recommendations', {
    body: summary
  });
}

export function listMyCoachFeedbackRequests(api: ApiClient): Promise<CoachFeedbackListResponse> {
  return api.get<CoachFeedbackListResponse>('/api/store/coach-feedback/my');
}

export function createCoachFeedbackRequest(
  api: ApiClient,
  input: CreateCoachFeedbackRequestInput
): Promise<CreateCoachFeedbackRequestResponse> {
  return api.post<CreateCoachFeedbackRequestResponse, CreateCoachFeedbackRequestInput>('/api/store/coach-feedback', {
    body: input
  });
}
