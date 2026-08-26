import { describe, expect, it } from 'vitest';
import {
  filterProducts,
  lettersWithProducts,
  looksLikeMedicalQuestion,
  normalize,
  productsForLetter,
  searchProducts,
  sortProducts
} from '../search';
import { products } from '../catalog';

describe('normalize', () => {
  it('strips accents and case', () => {
    expect(normalize('Animalín')).toBe('animalin');
    expect(normalize('  Beet   Root ')).toBe('beet root');
  });
});

describe('searchProducts', () => {
  it('finds by partial name', () => {
    const hits = searchProducts('centr', products);
    expect(hits.some((p) => p.slug === 'centrum-women-multivitamin')).toBe(true);
  });

  it('finds by brand', () => {
    const hits = searchProducts('surelife', products);
    expect(hits.length).toBe(2);
    expect(hits.every((p) => p.brand === 'SureLife')).toBe(true);
  });

  it('finds by keyword', () => {
    const hits = searchProducts('glucose', products);
    expect(hits.some((p) => p.slug === 'easytouch-glucose-test-strips')).toBe(true);
  });

  it('finds accented brands from unaccented input', () => {
    const hits = searchProducts('animalin', products);
    expect(hits.some((p) => p.slug === 'animalin-soy-protein-vitamin-c-chewables')).toBe(true);
  });

  it('weights name matches above keyword matches', () => {
    const hits = searchProducts('lip', products);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].name.toLowerCase()).toContain('lip');
  });

  it('requires every token to match', () => {
    expect(searchProducts('centrum thermometer', products)).toHaveLength(0);
  });

  it('returns the source unchanged for an empty query', () => {
    expect(searchProducts('   ', products)).toHaveLength(products.length);
  });
});

describe('filterProducts', () => {
  it('filters by category and brand together', () => {
    const hits = filterProducts(products, { category: 'diabetes-monitoring', brand: 'SureLife' });
    expect(hits).toHaveLength(2);
  });

  it('sale-featured pseudo-category collects sale and featured items', () => {
    const hits = filterProducts(products, { category: 'sale-featured' });
    expect(hits.every((p) => p.sale || p.featured)).toBe(true);
    expect(hits.length).toBeGreaterThan(0);
  });

  it('price filter excludes unpriced products', () => {
    const hits = filterProducts(products, { maxPrice: 10 });
    expect(hits.every((p) => typeof p.priceBzd === 'number' && p.priceBzd <= 10)).toBe(true);
  });
});

describe('sortProducts', () => {
  it('sorts by price ascending with unpriced items last', () => {
    const sorted = sortProducts(products, 'price-asc');
    const priced = sorted.filter((p) => typeof p.priceBzd === 'number');
    expect(priced[0].priceBzd).toBeLessThanOrEqual(priced[priced.length - 1].priceBzd as number);
    expect(typeof sorted[sorted.length - 1].priceBzd).not.toBe('number');
  });
});

describe('A–Z browsing', () => {
  it('groups by first letter', () => {
    const cHits = productsForLetter(products, 'c');
    expect(cHits.length).toBeGreaterThan(0);
    expect(cHits.every((p) => normalize(p.name).toUpperCase().startsWith('C'))).toBe(true);
  });

  it('returns an empty list for letters with no products', () => {
    const letters = lettersWithProducts(products);
    const empty = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find((l) => !letters.has(l));
    if (empty) {
      expect(productsForLetter(products, empty)).toHaveLength(0);
    }
  });
});

describe('looksLikeMedicalQuestion', () => {
  it('flags symptom-style questions', () => {
    expect(looksLikeMedicalQuestion('what should i take for a headache')).toBe(true);
    expect(looksLikeMedicalQuestion('medicine for my child has fever')).toBe(true);
  });

  it('does not flag plain product searches', () => {
    expect(looksLikeMedicalQuestion('centrum women')).toBe(false);
    expect(looksLikeMedicalQuestion('lip balm')).toBe(false);
  });
});
