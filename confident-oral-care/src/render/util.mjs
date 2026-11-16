const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

/** Small SVG icon set (decorative; always paired with visible text). */
const PATHS = {
  phone: '<path d="M5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5.5a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8" fill="currentColor"/>',
  facebook: '<path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9.5h8M8 12.5h5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  play: '<path d="M8 5.5v13l11-6.5-11-6.5Z"/>',
  pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  prev: '<path d="m15 5-7 7 7 7"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  whatsapp: '<path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.6Z"/><path d="M9.2 8.6c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .5-.1.6l-.5.6c-.1.1-.1.3 0 .5a6.2 6.2 0 0 0 2.8 2.6c.2.1.4.1.5 0l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.3.3.6-.1.8-.7 1.6-1.6 1.7-2.5.3-6.9-3.4-7-6.2 0-.9.1-1.4.2-1.9Z"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
};

export function icon(name, cls = 'icon') {
  return `<svg class="${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
}

/** Art-directed responsive photo: portrait crop on narrow screens, landscape otherwise. */
export function picture(photo, {
  alt = photo.alt, sizes = '100vw', portraitSizes = '100vw', className = '', loading = 'lazy', priority = false,
  breakpoint = 700, portraitOnly = false, landscapeOnly = false,
} = {}) {
  const set = (name, widths, ext) => widths.map((w) => `/img/web/${name}-${w}.${ext} ${w}w`).join(', ');
  const [lw, lh] = photo.size.landscape;
  const [pw, ph] = photo.size.portrait;
  const media = `(max-width: ${breakpoint - 1}px)`;
  const portraitSources = landscapeOnly ? '' : `
    <source media="${portraitOnly ? 'all' : media}" type="image/webp" srcset="${set(photo.portrait, photo.portraitWidths, 'webp')}" sizes="${portraitSizes}" width="${pw}" height="${ph}">
    <source media="${portraitOnly ? 'all' : media}" srcset="${set(photo.portrait, photo.portraitWidths, 'jpg')}" sizes="${portraitSizes}" width="${pw}" height="${ph}">`;
  const fallbackWidth = photo.landscapeWidths[1] ?? photo.landscapeWidths[0];
  return `<picture class="${esc(className)}">${portraitSources}
    <source type="image/webp" srcset="${set(photo.landscape, photo.landscapeWidths, 'webp')}" sizes="${sizes}">
    <img src="/img/web/${photo.landscape}-${fallbackWidth}.jpg" srcset="${set(photo.landscape, photo.landscapeWidths, 'jpg')}" sizes="${sizes}" width="${lw}" height="${lh}" alt="${esc(alt)}" ${priority ? 'fetchpriority="high"' : `loading="${loading}"`} decoding="async">
  </picture>`;
}

/** Responsive photo with a single crop (gallery photos without a portrait/landscape pair). */
export function singlePicture(photo, { alt = photo.alt, sizes = '100vw', className = '', loading = 'lazy' } = {}) {
  const set = (ext) => photo.widths.map((w) => `/img/web/${photo.single}-${w}.${ext} ${w}w`).join(', ');
  const [w, h] = photo.size;
  return `<picture class="${esc(className)}">
    <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
    <img src="/img/web/${photo.single}-${photo.widths[0]}.jpg" srcset="${set('jpg')}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" loading="${loading}" decoding="async">
  </picture>`;
}

const ES_DAYS = { Monday: 'lunes', Tuesday: 'martes', Wednesday: 'miércoles', Thursday: 'jueves', Friday: 'viernes', Saturday: 'sábado', Sunday: 'domingo' };

/** "09:00" -> "9 a.m." / "9 a. m."; "12:00" -> "noon" / "mediodía" */
export function formatClock(hhmm, { suffix = true, locale = 'en' } = {}) {
  const [h, m] = hhmm.split(':').map(Number);
  if (h === 12 && m === 0) return locale === 'es' ? 'mediodía' : 'noon';
  const hour = h % 12 === 0 ? 12 : h % 12;
  const base = m ? `${hour}:${String(m).padStart(2, '0')}` : `${hour}`;
  const mer = locale === 'es' ? (h < 12 ? 'a. m.' : 'p. m.') : (h < 12 ? 'a.m.' : 'p.m.');
  return suffix ? `${base} ${mer}` : base;
}

export function formatRange({ opens, closes }, locale = 'en') {
  const sameHalf = (Number(opens.slice(0, 2)) < 12) === (Number(closes.slice(0, 2)) < 12);
  const noon = opens === '12:00' || closes === '12:00';
  if (sameHalf && !noon) return `${formatClock(opens, { suffix: false, locale })}–${formatClock(closes, { locale })}`;
  return `${formatClock(opens, { locale })}–${formatClock(closes, { locale })}`;
}

export function formatDays(days, locale = 'en') {
  const name = (d) => (locale === 'es' ? ES_DAYS[d] : d);
  const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  if (days.length > 2) return locale === 'es' ? `${cap(name(days[0]))} a ${name(days[days.length - 1])}` : `${days[0]}–${days[days.length - 1]}`;
  return cap(days.map(name).join(locale === 'es' ? ' y ' : ' and '));
}

export function formatHours(publicHours, locale = 'en') {
  return publicHours.map((h) => ({
    days: formatDays(h.days, locale),
    time: h.ranges.map((r) => formatRange(r, locale)).join(locale === 'es' ? ' y ' : ' and '),
  }));
}
