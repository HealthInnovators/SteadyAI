import type { ApiClient } from '@/lib/api';
import type {
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
