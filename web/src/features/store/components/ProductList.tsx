import type { StoreProduct } from '../types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  items: StoreProduct[];
  savedIds: string[];
  compareIds: string[];
  onToggleSaved: (productId: string) => void;
  onToggleCompare: (productId: string) => void;
}

export function ProductList({ items, savedIds, compareIds, onToggleSaved, onToggleCompare }: ProductListProps) {
  return (
    <>
      <section className="grid gap-5 md:grid-cols-2">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSaved={savedIds.includes(product.id)}
            inCompare={compareIds.includes(product.id)}
            onToggleSaved={onToggleSaved}
            onToggleCompare={onToggleCompare}
          />
        ))}
      </section>

      {compareIds.length > 0 ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Compare tray</h3>
          <p className="mt-1 text-sm text-blue-800">Selected products: {compareIds.length} (max 3)</p>
        </section>
      ) : null}
    </>
  );
}
