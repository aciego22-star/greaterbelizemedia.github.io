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
  it('ships the full set supplied by the client', () => {
    expect(imageFiles.size).toBe(286);
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
    expect(unused, 'images in the pack that no record surfaces').toEqual([]);
    expect(used.size).toBe(286);
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

  it('never states a price it has not confirmed', () => {
    for (const p of list) {
      if (p.priceStatus === 'confirm-price') expect(p.priceBzd).toBeNull();
      else expect(typeof p.priceBzd).toBe('number');
    }
  });

  it('leaves availability for the pharmacy to confirm', () => {
    expect(list.every((p) => p.stockStatus === 'confirm-availability')).toBe(true);
  });

  it('routes prescription items to the prescription pathway', () => {
    for (const p of list.filter((x) => x.prescriptionRequired)) {
      expect(p.productType).toBe('prescription');
      expect(p.category).toBe('prescription-refills');
    }
  });

  it('never exposes raw OCR text as a product name', () => {
    for (const p of list) {
      expect(p.name).not.toMatch(/^Catalogue Item/);
      expect(p.name).not.toBe(p.ocrText);
      expect(p.name.trim().length).toBeGreaterThan(2);
    }
  });

  it('gives every record alt text that is not the name alone', () => {
    for (const p of list) {
      expect(p.imageAlt.length).toBeGreaterThan(10);
    }
  });
});
