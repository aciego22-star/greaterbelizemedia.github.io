import type { Product } from '../data/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  backSearch?: string;
}

export function ProductGrid({ products, backSearch }: ProductGridProps) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} backSearch={backSearch} />
      ))}
    </div>
  );
}
