/**
 * Spanish for the site. `ES` maps each English string, exactly as it appears
 * on the page with whitespace collapsed, to its Spanish version; `PATTERNS`
 * covers strings built at runtime (counts, prices, product names).
 * Loaded only when a visitor chooses Spanish (see src/lib/i18n.ts).
 */
import ES from './es.json';
import { SHOP_ABOUT } from '../data/shop-about';

const COLOURS: Record<string, string> = { Black: 'Negro', Blue: 'Azul', Red: 'Rojo', White: 'Blanco', Green: 'Verde' };
const dict: Record<string, string> = { ...(ES as Record<string, string>) };
// Shop product descriptions ("Ask AI about this") keep their Spanish next to the English.
for (const [en, es] of Object.values(SHOP_ABOUT)) dict[en] = es;
const word = (s: string) => dict[s] ?? s;
const plural = (n: string, one: string, many: string) => (n === '1' ? one : many);

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(\d+) products?$/, (m) => `${m[1]} ${plural(m[1], 'producto', 'productos')}`],
  [/^(\d+) items?$/, (m) => `${m[1]} ${plural(m[1], 'artículo', 'artículos')}`],
  [/^(\d+) product types$/, (m) => `${m[1]} tipos de producto`],
  [/^(\d+) images?$/, (m) => `${m[1]} ${plural(m[1], 'imagen', 'imágenes')}`],
  [/^Qty (\d+)$/, (m) => `Cant. ${m[1]}`],
  [/^Cart \((\d+) items?\)$/, (m) => `Carrito (${m[1]} ${plural(m[1], 'artículo', 'artículos')})`],
  [/^Cart \((\d+)\)$/, (m) => `Carrito (${m[1]})`],
  [/^(.+?)(?: \((Black|Blue|Red|White|Green)\))? added to your cart$/, (m) => `${m[1]}${m[2] ? ` (${COLOURS[m[2]]})` : ''} se agregó a su carrito`],
  [/^Quantity of (.+)$/, (m) => `Cantidad de ${m[1]}`],
  [/^One fewer (.+)$/, (m) => `Uno menos: ${m[1]}`],
  [/^One more (.+)$/, (m) => `Uno más: ${m[1]}`],
  [/^Remove (.+)$/, (m) => `Quitar ${m[1]}`],
  [/^Colour for (.+)$/, (m) => `Color para ${m[1]}`],
  [/^About the ((?:Makita|Lifan|Meilun) .+)$/, (m) => `Acerca de ${m[1]}`],
  [/^(Black|Blue|Red|White|Green) ·$/, (m) => `${COLOURS[m[1]]} ·`],
  [/^Simulate payment · (BZ\$[\d,.]+)$/, (m) => `Simular pago · ${m[1]}`],
  [/^Demo reference ((?:TEST|UH)-[A-Z0-9]+)$/, (m) => `Referencia de demostración ${m[1]}`],
  [
    /^Thanks, (.+?)\. This checkout was a demonstration: no card was charged and nothing was sent to Universal Hardware\. Once live, this page would show the real order reference, an email receipt would follow and the branch would be alerted to prepare the order for collection\.$/,
    (m) => `Gracias, ${m[1]}. Este pago fue una demostración: no se cobró ninguna tarjeta y no se envió nada a Universal Hardware. Una vez en funcionamiento, esta página mostraría la referencia real del pedido, llegaría un recibo por correo y se avisaría a la sucursal para preparar el pedido para su recogida.`,
  ],
  [/^Showing all (\d+) brands\.$/, (m) => `Mostrando las ${m[1]} marcas.`],
  [/^Showing (\d+) brands? in (.+)\.$/, (m) => `Mostrando ${m[1]} ${plural(m[1], 'marca', 'marcas')} en ${word(m[2])}.`],
  [/^(\d+) of (\d+): (.+)$/, (m) => `${m[1]} de ${m[2]}: ${word(m[3])}`],
  [/^Image (\d+): (.+)$/, (m) => `Imagen ${m[1]}: ${word(m[2])}`],
  [/^(.+) selected as your preferred branch\.$/, (m) => `${word(m[1])} seleccionada como su sucursal preferida.`],
  [
    /^(\d+) (?:category|categories)(?: · (\d+) matching product types?)?$/,
    (m) => `${m[1]} ${plural(m[1], 'categoría', 'categorías')}${m[2] ? ` · ${m[2]} ${plural(m[2], 'tipo de producto coincidente', 'tipos de producto coincidentes')}` : ''}`,
  ],
  [/^Collect at (.+)$/, (m) => `Recoger en ${word(m[1])}`],
  [/^Add (.+) in (Black|Blue|Red|White|Green) to cart$/, (m) => `Agregar ${m[1]} en ${COLOURS[m[2]].toLowerCase()} al carrito`],
  [/^Add (.+) to cart in$/, (m) => `Agregar ${m[1]} al carrito en`],
  [/^Add (.+) to cart$/, (m) => `Agregar ${m[1]} al carrito`],
  [
    /^Thanks, (.+?)\. This request was a demonstration and was not sent to Universal Hardware\. Once live, the branch would confirm the price and availability and contact the customer before payment\.$/,
    (m) => `Gracias, ${m[1]}. Esta solicitud fue una demostración y no se envió a Universal Hardware. Una vez en funcionamiento, la sucursal confirmaría el precio y la disponibilidad y contactaría al cliente antes del pago.`,
  ],
  [/^View (.+)$/, (m) => `Ver ${word(m[1])}`],
  // Page titles: "Makita HP1630 — 5/8″ Hammer Drill 710W · Universal Hardware", "Brands · Universal Hardware".
  [/^(.+?) — (.+) · Universal Hardware$/, (m) => `${m[1]} — ${word(m[2])} · Universal Hardware`],
  [/^(.+) · Universal Hardware$/, (m) => `${word(m[1])} · Universal Hardware`],
];

export function translateEs(text: string): string | null {
  const key = text.replace(/\s+/g, ' ').trim();
  if (!key) return null;
  const hit = dict[key];
  if (hit !== undefined) return hit;
  // Lists joined with " · " (e.g. matching product types in search): translate when every part is known.
  if (key.includes(' · ')) {
    const parts = key.split(' · ');
    if (parts.every((p) => dict[p] !== undefined)) return parts.map((p) => dict[p]).join(' · ');
  }
  for (const [re, fn] of PATTERNS) {
    const m = key.match(re);
    if (m) return fn(m);
  }
  return null;
}
