/**
 * Resolves a root-relative asset path ("site-images/x.jpg") to a URL.
 * Production pages set <html data-root="/">; the private preview copy sets a
 * relative prefix, so islands that render images at runtime work in both.
 */
export function assetUrl(path: string): string {
  if (typeof document === 'undefined') return `/${path}`;
  const root = document.documentElement.dataset.root;
  return `${root ?? '/'}${path}`;
}
