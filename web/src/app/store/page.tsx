'use client';

import { useEffect, useMemo, useState } from 'react';

import { createApiClient } from '@/lib/api';
import { getStoreProducts, ProductList, type StoreProduct } from '@/features/store';

export default function StorePage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useMemo(() => createApiClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const items = await getStoreProducts(api);
        if (isMounted) {
          setProducts(items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Store</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Browse practical resources at your own pace. This page avoids countdowns or urgency prompts and is meant to help you
          choose what fits your current routine.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-gray-600">Loading products...</p>
      ) : null}

      {!isLoading && error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {!isLoading && !error && products.length === 0 ? (
        <p className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">No products are available right now.</p>
      ) : null}

      {!isLoading && !error && products.length > 0 ? <ProductList items={products} /> : null}
    </main>
  );
}

