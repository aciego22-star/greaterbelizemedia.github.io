import type { Product } from '../data/types';
import { categoryName } from '../data/categories';

/** Lowercase, strip accents, collapse whitespace — so "Animalín" matches "animalin". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s+/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ScoredProduct {
  product: Product;
  score: number;
}

/**
 * Weighted partial matching: exact/prefix hits on name and brand outrank
 * category, subcategory and keyword hits. Every query token must match
 * somewhere for the product to qualify.
 */
export function searchProducts(query: string, source: Product[]): Product[] {
  const q = normalize(query);
  if (!q) return source;
  const tokens = q.split(' ').filter(Boolean);

  const scored: ScoredProduct[] = [];
  for (const product of source) {
    const name = normalize(product.name);
    const brand = normalize(product.brand ?? '');
    const category = normalize(categoryName(product.category));
    const subcategory = normalize(product.subcategory ?? '');
    const keywords = product.keywords.map(normalize);

    let score = 0;
    let allTokensMatch = true;

    for (const token of tokens) {
      let tokenScore = 0;
      if (name === token) tokenScore = Math.max(tokenScore, 120);
      if (name.startsWith(token)) tokenScore = Math.max(tokenScore, 100);
      if (name.includes(token)) tokenScore = Math.max(tokenScore, 80);
      if (brand && brand.startsWith(token)) tokenScore = Math.max(tokenScore, 90);
      if (brand && brand.includes(token)) tokenScore = Math.max(tokenScore, 70);
      if (keywords.some((k) => k === token)) tokenScore = Math.max(tokenScore, 50);
      if (keywords.some((k) => k.includes(token))) tokenScore = Math.max(tokenScore, 35);
      if (category.includes(token)) tokenScore = Math.max(tokenScore, 30);
      if (subcategory.includes(token)) tokenScore = Math.max(tokenScore, 30);
      if (tokenScore === 0) {
        allTokensMatch = false;
        break;
      }
      score += tokenScore;
    }

    if (allTokensMatch) {
      // Full-phrase name match gets a decisive boost.
      if (name.includes(q)) score += 60;
      if (brand && brand.includes(q)) score += 40;
      scored.push({ product, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
  return scored.map((s) => s.product);
}

export interface CatalogueFilters {
  category?: string;
  brand?: string;
  productType?: string;
  saleOnly?: boolean;
  availability?: string;
  maxPrice?: number;
}

export function filterProducts(source: Product[], f: CatalogueFilters): Product[] {
  return source.filter((p) => {
    if (f.category && f.category !== 'sale-featured' && p.category !== f.category) return false;
    if (f.category === 'sale-featured' && !(p.sale || p.featured)) return false;
    if (f.brand && p.brand !== f.brand) return false;
    if (f.productType && p.productType !== f.productType) return false;
    if (f.saleOnly && !p.sale) return false;
    if (f.availability && p.stockStatus !== f.availability) return false;
    if (typeof f.maxPrice === 'number') {
      if (typeof p.priceBzd !== 'number' || p.priceBzd > f.maxPrice) return false;
    }
    return true;
  });
}

export type SortKey = 'featured' | 'name-asc' | 'price-asc' | 'price-desc' | 'new';

export function sortProducts(source: Product[], sort: SortKey): Product[] {
  const list = [...source];
  const price = (p: Product) => (typeof p.priceBzd === 'number' ? p.priceBzd : Number.POSITIVE_INFINITY);
  switch (sort) {
    case 'name-asc':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'price-asc':
      list.sort((a, b) => price(a) - price(b) || a.name.localeCompare(b.name));
      break;
    case 'price-desc':
      list.sort((a, b) => {
        const pa = typeof a.priceBzd === 'number' ? a.priceBzd : -1;
        const pb = typeof b.priceBzd === 'number' ? b.priceBzd : -1;
        return pb - pa || a.name.localeCompare(b.name);
      });
      break;
    case 'new':
      list.sort((a, b) => Number(!!b.newArrival) - Number(!!a.newArrival) || a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      list.sort(
        (a, b) =>
          Number(!!b.featured) - Number(!!a.featured) ||
          Number(!!b.sale) - Number(!!a.sale) ||
          (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
          a.name.localeCompare(b.name)
      );
  }
  return list;
}

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Products whose display name starts with the given letter (case-insensitive). */
export function productsForLetter(source: Product[], letter: string): Product[] {
  const l = letter.toUpperCase();
  return source
    .filter((p) => normalize(p.name).toUpperCase().startsWith(l))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Letters that have at least one product, for de-emphasising empty index entries. */
export function lettersWithProducts(source: Product[]): Set<string> {
  const set = new Set<string>();
  for (const p of source) {
    const first = normalize(p.name).charAt(0).toUpperCase();
    if (first >= 'A' && first <= 'Z') set.add(first);
  }
  return set;
}

const MEDICAL_QUESTION_HINTS = [
  'what should i take',
  'what can i take',
  'best medicine for',
  'medicine for',
  'treatment for',
  'cure',
  'symptom',
  'diagnos',
  'is it safe',
  'can i take',
  'pregnant',
  'pregnancy',
  'dosage for',
  'side effect',
  'infection',
  'my child has',
  'i have'
];

/**
 * Heuristic only: detects queries that read like medical questions so the UI
 * can surface the pharmacist-guidance card. Never used to answer the question.
 */
export function looksLikeMedicalQuestion(query: string): boolean {
  const q = normalize(query);
  if (!q) return false;
  if (q.split(' ').length >= 5 && /\b(for|help|should|safe)\b/.test(q)) return true;
  return MEDICAL_QUESTION_HINTS.some((hint) => q.includes(hint));
}
