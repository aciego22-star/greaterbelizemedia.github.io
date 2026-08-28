import rawProducts from '../data/products.json';
import type { Product } from '../data/types';

export const products = rawProducts as Product[];

export const productById = new Map(products.map((p) => [p.id, p]));
export const productBySlug = new Map(products.map((p) => [p.slug, p]));

export function productsInCategory(categorySlug: string): Product[] {
  if (categorySlug === 'sale-featured') {
    return products.filter((p) => p.sale || p.featured);
  }
  return products.filter((p) => p.category === categorySlug);
}

export function productsInCategories(slugs: string[]): Product[] {
  const set = new Set(slugs);
  return products.filter((p) => set.has(p.category));
}

export const featuredProducts = products.filter((p) => p.featured);
export const saleProducts = products.filter((p) => p.sale);

export const allBrands = [...new Set(products.map((p) => p.brand).filter((b): b is string => !!b))].sort((a, b) =>
  a.localeCompare(b)
);

/** True when the product must go through the pharmacist pathway instead of plain add-to-basket. */
export function requiresReview(p: Product): boolean {
  return p.prescriptionRequired || p.pharmacistGuidanceRequired || p.category === 'prescription-refills';
}

/** True when the product carries a numeric price usable in subtotals. */
export function hasNumericPrice(p: Product): boolean {
  return typeof p.priceBzd === 'number' && p.priceStatus !== 'confirm-price';
}
