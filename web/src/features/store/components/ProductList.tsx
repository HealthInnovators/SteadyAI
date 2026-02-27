import type { StoreProduct } from '../types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  items: StoreProduct[];
}

export function ProductList({ items }: ProductListProps) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}

