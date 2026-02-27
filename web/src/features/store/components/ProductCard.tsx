import type { StoreProduct } from '../types';

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
      </header>

      <p className="mb-5 text-sm leading-6 text-gray-700">{product.description}</p>

      <dl className="grid gap-3 rounded-xl bg-gray-50 p-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Who it&apos;s for</dt>
          <dd className="mt-1 text-sm text-gray-800">{product.whoItsFor}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-600">Not for</dt>
          <dd className="mt-1 text-sm text-gray-700">{product.whoItsNotFor}</dd>
        </div>
      </dl>
    </article>
  );
}

