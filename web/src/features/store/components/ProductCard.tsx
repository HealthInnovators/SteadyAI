import { useMemo, useState } from 'react';
import type { StoreProduct } from '../types';

interface ProductCardProps {
  product: StoreProduct;
  isSaved: boolean;
  inCompare: boolean;
  onToggleSaved: (productId: string) => void;
  onToggleCompare: (productId: string) => void;
}

function estimateCommitment(product: StoreProduct): string {
  const content = `${product.name} ${product.description}`.toLowerCase();
  if (content.includes('10') || content.includes('quick') || content.includes('short')) {
    return '10-15 min/day';
  }
  if (content.includes('meal') || content.includes('plan')) {
    return '20-30 min prep';
  }
  return '15-20 min/day';
}

function formatPrice(priceCents?: number, currency?: string): string {
  if (typeof priceCents !== 'number') {
    return 'Included';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0
  }).format(priceCents / 100);
}

export function ProductCard({ product, isSaved, inCompare, onToggleSaved, onToggleCompare }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const commitment = useMemo(() => estimateCommitment(product), [product]);
  const priceLabel = useMemo(() => formatPrice(product.priceCents, product.currency), [product.priceCents, product.currency]);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">Estimated commitment: {commitment}</p>
          <p className="mt-1 text-sm font-semibold text-indigo-700">{priceLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggleSaved(product.id)}
            className={`rounded-md border px-3 py-1 text-xs ${
              isSaved ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-300 text-gray-700'
            }`}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            className={`rounded-md border px-3 py-1 text-xs ${
              inCompare ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'
            }`}
          >
            {inCompare ? 'In compare' : 'Compare'}
          </button>
        </div>
      </header>

      <p className="mb-4 text-sm leading-6 text-gray-700">{product.description}</p>

      <dl className="grid gap-3 rounded-xl bg-gray-50 p-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Who it&apos;s for</dt>
          <dd className="mt-1 text-sm text-gray-800">{product.whoItsFor}</dd>
        </div>
        {expanded ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-600">Not for</dt>
            <dd className="mt-1 text-sm text-gray-700">{product.whoItsNotFor}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-3">
        <button type="button" onClick={() => setExpanded((prev) => !prev)} className="text-sm font-medium text-blue-700">
          {expanded ? 'Show less' : 'See fit details'}
        </button>
      </div>
    </article>
  );
}
