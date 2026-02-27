'use client';

import { useEffect, useMemo, useState } from 'react';

import { createApiClient } from '@/lib/api';
import { getOptionalProductSuggestions } from '../api';
import type { McpUserSummary, OptionalProductSuggestionResponse } from '../types';

interface OptionalProductSuggestionsProps {
  summary: McpUserSummary;
  token?: string;
}

export function OptionalProductSuggestions({ summary, token }: OptionalProductSuggestionsProps) {
  const api = useMemo(() => createApiClient(() => token), [token]);
  const [data, setData] = useState<OptionalProductSuggestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSuggestions() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getOptionalProductSuggestions(api, summary);
        if (isMounted) {
          setData(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load optional suggestions');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, [api, summary]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading optional suggestions...</p>;
  }

  if (error) {
    return <p className="text-sm text-gray-500">Optional suggestions unavailable right now.</p>;
  }

  if (!data || !data.shouldShowSuggestions || data.suggestions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
      <header className="mb-3">
        <h3 className="text-lg font-semibold text-sky-900">Optional Suggestions</h3>
        <p className="text-sm text-sky-800">
          These are optional ideas you can explore if useful. You can ignore them and continue your normal flow.
        </p>
      </header>

      <ul className="space-y-3">
        {data.suggestions.map((suggestion) => (
          <li key={suggestion.productId} className="rounded-xl border border-sky-100 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">{suggestion.name}</p>
            <p className="mt-1 text-sm text-gray-700">{suggestion.explanation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

