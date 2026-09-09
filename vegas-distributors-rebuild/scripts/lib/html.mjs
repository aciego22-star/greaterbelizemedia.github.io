/** Shared rendering helpers for the static build. */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes text for use in element content or a double-quoted attribute. */
export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Joins class names, dropping falsy entries. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Renders an attribute list from an object, skipping null/undefined/false. */
export const attrs = (map) =>
  Object.entries(map)
    .filter(([, v]) => v !== null && v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
    .join('');

/** Interpolates {token} placeholders in a translation string. */
export const t = (template, values = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, key) => (key in values ? String(values[key]) : `{${key}}`));

/**
 * Builds a <picture> from an images.json entry.
 *
 * Width and height always come from the manifest so the browser can reserve
 * the box before the file arrives, which keeps cumulative layout shift at zero.
 */
export function picture(entry, { alt = '', sizes, className, loading = 'lazy', fetchpriority, decoding = 'async' } = {}) {
  if (!entry) return '';

  // Most entries live under assets/images/<dir>; campaign artwork carries its
  // own base because it is emitted by the hero pipeline.
  const base = entry.base ?? `assets/images/${entry.dir}`;
  const srcset = (list) => list.map((s) => `{{BASE}}${base}/${s.file} ${s.width}w`).join(', ');
  const largest = entry.fallback[entry.fallback.length - 1];

  // Decorative images take an empty alt and are hidden from assistive tech.
  const decorative = alt === '';

  return (
    `<picture${className ? ` class="${esc(className)}"` : ''}>` +
    (entry.avif?.length
      ? `<source type="image/avif" srcset="${srcset(entry.avif)}"${sizes ? ` sizes="${esc(sizes)}"` : ''}>`
      : '') +
    `<source type="image/webp" srcset="${srcset(entry.webp)}"${sizes ? ` sizes="${esc(sizes)}"` : ''}>` +
    `<img src="{{BASE}}${base}/${largest.file}" srcset="${srcset(entry.fallback)}"` +
    (sizes ? ` sizes="${esc(sizes)}"` : '') +
    ` width="${entry.width}" height="${entry.height}"` +
    ` alt="${esc(alt)}"${decorative ? ' aria-hidden="true"' : ''}` +
    ` loading="${esc(loading)}" decoding="${esc(decoding)}"` +
    (fetchpriority ? ` fetchpriority="${esc(fetchpriority)}"` : '') +
    '>' +
    '</picture>'
  );
}

/** A telephone link, or plain text plus a note when no number is published. */
export function telLink(phone, label) {
  if (!phone) return '';
  const dial = phone.replace(/[^\d+]/g, '');
  return `<a class="action-link phone" href="tel:${esc(dial)}">${esc(label ?? phone)}</a>`;
}

export function mailLink(email, label) {
  if (!email) return '';
  return `<a class="action-link" href="mailto:${esc(email)}">${esc(label ?? email)}</a>`;
}

/** Renders a JSON-LD block. */
export const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
