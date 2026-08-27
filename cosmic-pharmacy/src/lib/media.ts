/**
 * Resolves catalogue image keys to bundled asset URLs.
 *
 * Records store a stable key ("cosmic-product-041"), never a path. Vite rewrites
 * the glob below at build time, so the same key resolves to a hashed file in the
 * Netlify build and to an inlined data URI in the single-file preview build.
 * Storing paths instead would break the preview, where nothing is served from
 * public/.
 */
const catalogueImages = import.meta.glob(
  ['../assets/catalogue/*.webp', '../assets/hero/*.webp', '../assets/hero/*.mp4'],
  {
    eager: true,
    query: '?url',
    import: 'default'
  }
) as Record<string, string>;

const byKey = new Map<string, string>();
for (const [path, url] of Object.entries(catalogueImages)) {
  // Keys carry no extension, so the same key works whether the asset is a
  // still or the hero video.
  const key = path.split('/').pop()!.replace(/\.[a-z0-9]+$/i, '');
  byKey.set(key, url);
}

/** Returns the bundled URL for an image key, or '' when the key has no asset yet. */
export function mediaUrl(key: string | undefined | null): string {
  if (!key) return '';
  // Real paths supplied later (assets/products/x.jpg) are passed through unchanged.
  if (key.includes('/')) return key;
  return byKey.get(key) ?? '';
}

/** Every image for a product: the primary key first, then any additional views. */
export function mediaUrls(keys: Array<string | undefined | null>): string[] {
  return keys.map(mediaUrl).filter(Boolean);
}

export const catalogueImageCount = byKey.size;
