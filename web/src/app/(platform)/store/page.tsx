'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/auth';
import { createApiClient } from '@/lib/api';
import {
  createCoachFeedbackRequest,
  getStoreProducts,
  listMyCoachFeedbackRequests,
  ProductList,
  type CoachFeedbackRequestItem,
  type StoreProduct
} from '@/features/store';
import { DUMMY_STORE_PRODUCTS } from '@/features/store/dummyProducts';

type StoreCategory = 'ALL' | 'NUTRITION' | 'HABITS' | 'COMMUNITY' | 'TRAINING';

function inferCategory(product: StoreProduct): StoreCategory {
  const content = `${product.name} ${product.description}`.toLowerCase();
  if (content.includes('meal') || content.includes('grocery') || content.includes('nutrition')) {
    return 'NUTRITION';
  }
  if (content.includes('community') || content.includes('post') || content.includes('prompt')) {
    return 'COMMUNITY';
  }
  if (content.includes('strength') || content.includes('workout') || content.includes('training')) {
    return 'TRAINING';
  }
  return 'HABITS';
}

function sortProducts(items: StoreProduct[], mode: 'relevance' | 'a-z' | 'for-new-users'): StoreProduct[] {
  const next = [...items];
  if (mode === 'a-z') {
    next.sort((a, b) => a.name.localeCompare(b.name));
    return next;
  }
  if (mode === 'for-new-users') {
    next.sort((a, b) => {
      const aBeginner = `${a.name} ${a.description}`.toLowerCase().includes('beginner') ? 0 : 1;
      const bBeginner = `${b.name} ${b.description}`.toLowerCase().includes('beginner') ? 0 : 1;
      return aBeginner - bBeginner || a.name.localeCompare(b.name);
    });
    return next;
  }
  return next;
}

export default function StorePage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<StoreCategory>('ALL');
  const [sortMode, setSortMode] = useState<'relevance' | 'a-z' | 'for-new-users'>('relevance');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [coachTopic, setCoachTopic] = useState('');
  const [coachContext, setCoachContext] = useState('');
  const [coachOutcome, setCoachOutcome] = useState('');
  const [selectedCoachProductId, setSelectedCoachProductId] = useState('');
  const [isCoachSubmitting, setIsCoachSubmitting] = useState(false);
  const [coachMessage, setCoachMessage] = useState<string | null>(null);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [coachRequests, setCoachRequests] = useState<CoachFeedbackRequestItem[]>([]);
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const items = await getStoreProducts(api);
        if (isMounted) {
          if (items.length > 0) {
            setProducts(items);
            setUsingDummyData(false);
          } else {
            setProducts(DUMMY_STORE_PRODUCTS);
            setUsingDummyData(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
          setProducts(DUMMY_STORE_PRODUCTS);
          setUsingDummyData(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();
    return () => {
      isMounted = false;
    };
  }, [api]);

  useEffect(() => {
    let isMounted = true;
    async function loadCoachRequests() {
      try {
        const data = await listMyCoachFeedbackRequests(api);
        if (isMounted) {
          setCoachRequests(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        if (isMounted) {
          setCoachRequests([]);
        }
      }
    }
    void loadCoachRequests();
    return () => {
      isMounted = false;
    };
  }, [api]);

  const displayedProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      if (category !== 'ALL' && inferCategory(product) !== category) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const content = `${product.name} ${product.description} ${product.whoItsFor}`.toLowerCase();
      return content.includes(normalizedQuery);
    });
    return sortProducts(filtered, sortMode);
  }, [products, category, query, sortMode]);

  const coachProducts = useMemo(
    () =>
      products.filter((product) => {
        const content = `${product.name} ${product.description}`.toLowerCase();
        return content.includes('coach') || content.includes('review') || content.includes('plan');
      }),
    [products]
  );

  useEffect(() => {
    if (!selectedCoachProductId && coachProducts.length > 0) {
      setSelectedCoachProductId(coachProducts[0].id);
    }
  }, [coachProducts, selectedCoachProductId]);

  function toggleSaved(productId: string) {
    setSavedIds((current) => (current.includes(productId) ? current.filter((x) => x !== productId) : [...current, productId]));
  }

  function toggleCompare(productId: string) {
    setCompareIds((current) => {
      if (current.includes(productId)) {
        return current.filter((x) => x !== productId);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, productId];
    });
  }

  async function submitCoachRequest() {
    setCoachError(null);
    setCoachMessage(null);
    if (!selectedCoachProductId) {
      setCoachError('Select a coach service product.');
      return;
    }
    if (coachTopic.trim().length < 5) {
      setCoachError('Topic must be at least 5 characters.');
      return;
    }

    try {
      setIsCoachSubmitting(true);
      const response = await createCoachFeedbackRequest(api, {
        productId: selectedCoachProductId,
        topic: coachTopic.trim(),
        context: coachContext.trim() || undefined,
        preferredOutcome: coachOutcome.trim() || undefined
      });
      setCoachMessage(response.message || 'Request submitted.');
      setCoachTopic('');
      setCoachContext('');
      setCoachOutcome('');
      const latest = await listMyCoachFeedbackRequests(api);
      setCoachRequests(Array.isArray(latest.items) ? latest.items : []);
    } catch (err) {
      setCoachError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setIsCoachSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Store</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Browse practical resources at your own pace. This page avoids countdowns or urgency prompts and is meant to help you
          choose what fits your current routine.
        </p>
      </header>

      <section className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-3">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by goal, format, or use case"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Sort</span>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as 'relevance' | 'a-z' | 'for-new-users')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="a-z">Name A-Z</option>
            <option value="for-new-users">New user friendly</option>
          </select>
        </label>
        <div className="md:col-span-3 flex flex-wrap gap-2">
          {(['ALL', 'NUTRITION', 'HABITS', 'COMMUNITY', 'TRAINING'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-3 py-1 text-xs ${
                category === item ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Visible products</p>
          <p className="text-xl font-semibold text-gray-900">{displayedProducts.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Saved</p>
          <p className="text-xl font-semibold text-gray-900">{savedIds.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Compare tray</p>
          <p className="text-xl font-semibold text-gray-900">{compareIds.length} / 3</p>
        </div>
      </section>

      {isLoading ? (
        <p className="text-sm text-gray-600">Loading products...</p>
      ) : null}

      {!isLoading && error ? <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</p> : null}

      {!isLoading && usingDummyData ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          Showing demo catalog data so you can explore the store experience interactively.
        </p>
      ) : null}

      {!isLoading && displayedProducts.length === 0 ? (
        <p className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">No products are available right now.</p>
      ) : null}

      {!isLoading && displayedProducts.length > 0 ? (
        <ProductList
          items={displayedProducts}
          savedIds={savedIds}
          compareIds={compareIds}
          onToggleSaved={toggleSaved}
          onToggleCompare={toggleCompare}
        />
      ) : null}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">1:1 Async Coach Feedback</h2>
          <p className="text-sm text-gray-600">
            Submit your topic and context. A coach can review asynchronously and respond in this request thread.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Service</span>
            <select
              value={selectedCoachProductId}
              onChange={(event) => setSelectedCoachProductId(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {coachProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Topic</span>
            <input
              value={coachTopic}
              onChange={(event) => setCoachTopic(event.target.value)}
              placeholder="Example: I missed 4 check-ins this week and want a reset plan."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Context</span>
            <textarea
              value={coachContext}
              onChange={(event) => setCoachContext(event.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Share recent behavior patterns, blockers, and schedule constraints."
            />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Preferred outcome</span>
            <textarea
              value={coachOutcome}
              onChange={(event) => setCoachOutcome(event.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="What would make this coaching response most useful for you?"
            />
          </label>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void submitCoachRequest()}
            disabled={isCoachSubmitting || coachProducts.length === 0}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isCoachSubmitting ? 'Submitting...' : 'Submit feedback request'}
          </button>
          {coachMessage ? <p className="text-sm text-emerald-700">{coachMessage}</p> : null}
          {coachError ? <p className="text-sm text-red-700">{coachError}</p> : null}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-900">Your recent requests</h3>
          {coachRequests.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">No requests yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {coachRequests.slice(0, 5).map((item) => (
                <li key={item.id} className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-900">{item.topic}</p>
                  <p className="text-gray-600">
                    {item.product.name} • {item.status} • {new Date(item.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
