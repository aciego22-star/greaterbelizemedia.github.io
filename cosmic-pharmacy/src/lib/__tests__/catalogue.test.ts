import { describe, expect, it } from 'vitest';
import products from '../../data/products.json';
import gallery from '../../data/gallery.json';
import type { GalleryItem, Product } from '../../data/types';

// Enumerated the same way lib/media.ts does, so this asserts against exactly
// what the build will resolve rather than against a directory listing.
const imageFiles = new Set<string>(
  Object.keys(import.meta.glob('../../assets/catalogue/*.webp')).map(
    (path) => path.split('/').pop()!.replace(/\.webp$/, '')
  )
);

const list = products as Product[];
const galleryList = gallery as GalleryItem[];

/** Every image key a product claims, primary plus extra views. */
const productKeys = (p: Product) => (p.images?.length ? p.images : p.image ? [p.image] : []);

describe('catalogue images', () => {
  it('ships the 100-product catalogue plus the gallery assets', () => {
    // 100 product images from the client's demo catalogue, plus the 29
    // editorial graphics the gallery still uses.
    expect(imageFiles.size).toBe(129);
  });

  it('uses every supplied image exactly once, with nothing orphaned', () => {
    const used = new Map<string, string>();
    const claim = (key: string, owner: string) => {
      expect(used.has(key), `${key} claimed by both ${used.get(key)} and ${owner}`).toBe(false);
      used.set(key, owner);
    };
    for (const p of list) for (const k of productKeys(p)) claim(k, p.slug);
    for (const g of galleryList) if (g.src) claim(g.src, g.id);

    const unused = [...imageFiles].filter((k) => !used.has(k)).sort();
    expect(unused, 'images that no record surfaces').toEqual([]);
    expect(used.size).toBe(129);
  });

  it('points every key at a file that exists', () => {
    const missing: string[] = [];
    for (const p of list) for (const k of productKeys(p)) if (!imageFiles.has(k)) missing.push(`${p.slug} -> ${k}`);
    for (const g of galleryList) if (g.src && !imageFiles.has(g.src)) missing.push(`${g.id} -> ${g.src}`);
    expect(missing).toEqual([]);
  });

  it('repeats the primary image first in every multi-view list', () => {
    for (const p of list.filter((x) => x.images)) {
      expect(p.images!.length).toBeGreaterThan(1);
      expect(p.images![0]).toBe(p.image);
    }
  });
});

describe('catalogue records', () => {
  it('has unique ids and slugs', () => {
    expect(new Set(list.map((p) => p.id)).size).toBe(list.length);
    expect(new Set(list.map((p) => p.slug)).size).toBe(list.length);
  });

  it('carries the client\'s demo price on every record, marked as a demo price', () => {
    expect(list).toHaveLength(100);
    for (const p of list) {
      expect(typeof p.priceBzd, p.slug).toBe('number');
      expect(p.priceBzd!, p.slug).toBeGreaterThan(0);
      expect(p.priceStatus, p.slug).toBe('demo-only');
    }
  });

  it('marks every demo item in stock, as the pack specifies', () => {
    expect(list.every((p) => p.stockStatus === 'in-stock')).toBe(true);
  });

  it('asserts nothing about prescription status, which the pack leaves unconfirmed', () => {
    // The supplied pack states prescription status is unconfirmed for every
    // item, so no record claims one either way and every card offers the
    // basket. The catalogue-wide notice carries the caveat instead.
    expect(list.some((p) => p.prescriptionRequired)).toBe(false);
    expect(list.some((p) => p.pharmacistGuidanceRequired)).toBe(false);
    expect(list.some((p) => p.productType === 'prescription')).toBe(false);
  });

  it('keeps image provenance out of the shipped bundle', () => {
    // The pack forbids exposing image-source URLs or verification fields.
    const blob = JSON.stringify(list);
    for (const banned of ['imageSourceUrl', 'imageSourcePageUrl', 'sourceScreenshot', 'walmartimages', 'http']) {
      expect(blob.includes(banned), `products.json leaks ${banned}`).toBe(false);
    }
  });

  it('never exposes raw OCR text as a product name', () => {
    for (const p of list) {
      expect(p.name).not.toMatch(/^Catalogue Item/);
      expect(p.name.trim().length).toBeGreaterThan(2);
    }
  });

  it('gives every record alt text that is not the name alone', () => {
    for (const p of list) {
      expect(p.imageAlt.length).toBeGreaterThan(10);
    }
  });
});
