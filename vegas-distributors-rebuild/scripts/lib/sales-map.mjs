/**
 * The Belize district map for the sales network page.
 *
 * The artwork ships as one SVG file and is written straight into the page
 * rather than fetched, for three reasons: the map is then part of the document
 * a visitor already has, so it draws with no second request and survives a
 * page opened from a file rather than a server; a browser running no script
 * still sees the whole country; and the single-file review copy of the site
 * carries it like any other markup.
 *
 * Two things have to be rewritten on the way in. Every label is English in the
 * source, so the district names and the spoken labels are swapped for the
 * locale being built. And because the review copy holds both language versions
 * of the page in one document, the identifiers inside the artwork are given a
 * per-locale prefix so the two maps cannot reach into each other's shapes.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = join(ROOT, 'src', 'assets', 'maps', 'belize-sales-map.svg');

/** The six districts, as the artwork names them. */
const DISTRICTS = {
  corozal: { en: 'Corozal', es: 'Corozal' },
  'orange-walk': { en: 'Orange Walk', es: 'Orange Walk' },
  belize: { en: 'Belize', es: 'Belice' },
  cayo: { en: 'Cayo', es: 'Cayo' },
  'stann-creek': { en: 'Stann Creek', es: 'Stann Creek' },
  toledo: { en: 'Toledo', es: 'Toledo' },
};

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let cached = null;
const source = () => (cached ??= readFileSync(SOURCE, 'utf8').replace(/^<\?xml[^>]*\?>\s*/, ''));

/**
 * @param {object} args
 * @param {'en'|'es'} args.locale
 * @param {object} args.i18n
 * @param {Array} args.territories  Every territory, carrying its map placement.
 */
export function belizeMap({ locale, i18n, territories }) {
  const c = i18n.network;
  let svg = source();

  // Identifiers are local to one map. Prefixing them keeps the English and the
  // Spanish page apart wherever both are loaded at once.
  const tag = `n${locale}-`;
  svg = svg
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${tag}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${tag}${id})`)
    .replace(/((?:xlink:)?href)="#([^"]+)"/g, (_, attr, id) => `${attr}="#${tag}${id}"`)
    .replace(/aria-labelledby="([^"]+)"/g, (_, ids) =>
      `aria-labelledby="${ids.split(/\s+/).map((id) => tag + id).join(' ')}"`);

  // The map speaks for itself before any of its parts are described.
  svg = svg
    .replace(/(<title id="[^"]*">)[^<]*(<\/title>)/, `$1${escText(c.mapTitle)}$2`)
    .replace(/(<desc id="[^"]*">)[^<]*(<\/desc>)/, `$1${escText(c.mapDesc)}$2`);

  // District names drawn on the artwork, and the label a screen reader speaks.
  svg = svg.replace(
    /<text([^>]*class="district-label[^"]*district-label--([a-z-]+)"[^>]*)>[^<]*<\/text>/g,
    (whole, attrs, id) => {
      const name = DISTRICTS[id]?.[locale];
      return name ? `<text${attrs}>${escText(name)}</text>` : whole;
    }
  );
  svg = svg.replace(/(<use\b[^>]*\bdata-district="([a-z-]+)"[^>]*aria-label=")[^"]*(")/g, (whole, before, id, after) => {
    const name = DISTRICTS[id]?.[locale];
    // A template rather than a suffix, because Spanish puts the word first.
    return name ? `${before}${escAttr(c.districtLabel.replace('{name}', name))}${after}` : whole;
  });

  // Each pin speaks its representative and the territory they cover.
  const byPin = new Map(territories.filter((t) => t.mapPin).map((t) => [t.mapPin, t]));
  const pinLabel = (t) => `${t.rep}, ${t[locale] ?? t.en}`;
  svg = svg
    .replace(/(<g\b[^>]*\bdata-rep="([a-z]+)"[^>]*aria-label=")[^"]*(")/g, (whole, before, pin, after) => {
      const t = byPin.get(pin);
      return t ? `${before}${escAttr(pinLabel(t))}${after}` : whole;
    })
    .replace(/(<g\b[^>]*\bdata-rep="([a-z]+)"[^>]*>\s*<title>)[^<]*(<\/title>)/g, (whole, before, pin, after) => {
      const t = byPin.get(pin);
      return t ? `${before}${escText(pinLabel(t))}${after}` : whole;
    });

  /* Before the script binds it, the map is a picture: one image with a title
     and a description. The parts are not controls yet, so they do not claim to
     be, and they are not in the tab order for a keyboard to land on. The script
     puts all of that on when it takes charge. */
  svg = svg
    .replace(/\s+role="button"/g, '')
    .replace(/(<use\b[^>]*\bdata-district="[^"]*"[^>]*?)\s+tabindex="0"/g, '$1')
    .replace(/(<g\b[^>]*\bdata-rep="[^"]*"[^>]*?)\s+tabindex="0"/g, '$1');

  return svg;
}
