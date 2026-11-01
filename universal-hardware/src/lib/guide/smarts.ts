/**
 * Helpers that make Universal AI more capable while staying local: no network,
 * no model. Parsing quantities and colours, finding the product a visitor
 * means, sizing an air conditioner from Sankey's chart, and telling whether a
 * branch is open from its listed hours (in Belize time).
 */
import { PRODUCT_BY_ID, SHOP_PRODUCTS, type ShopProduct } from '../../data/shop';
import { BRANCH_BY_ID, type BranchId } from '../../data/branches';
import { AC_CHART, LISTED_MODELS, type ListedModel } from '../../data/live-site';
import { searchProducts } from '../product-search';

export const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, pair: 2, couple: 2,
  un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
};

/** "add 2 …", "three of those", "x2". Ignores numbers that are part of a model code or a size. */
export function parseQty(t: string): number {
  const x = t.match(/(?:^|\s)x\s?(\d)(?:\s|$)/) || t.match(/(?:^|\s)(\d)\s?x(?:\s|$)/);
  if (x) return Number(x[1]);
  const d = t.match(/(?:add|put|want|need|take|buy|get|agregar|agregue|anadir|anada|quiero|comprar|dame|deme)\s+(\d{1,2})(?=\s+(?!cc\b|v\b|ah\b|in\b|inch\b|mm\b|hp\b|w\b))/);
  if (d) return Math.max(1, Math.min(9, Number(d[1])));
  const w = t.match(/(?:add|put|want|need|take|buy|get|agregar|agregue|anadir|anada|quiero|comprar|dame|deme)\s+(a|an|one|two|three|four|five|six|seven|eight|nine|pair|couple|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/);
  if (w) return NUMBER_WORDS[w[1]];
  return 1;
}

const COLOURS: Record<string, string> = {
  black: 'Black', negro: 'Black', negra: 'Black', negros: 'Black', negras: 'Black',
  blue: 'Blue', azul: 'Blue', azules: 'Blue',
  red: 'Red', rojo: 'Red', roja: 'Red', rojos: 'Red', rojas: 'Red',
  white: 'White', blanco: 'White', blanca: 'White', blancos: 'White', blancas: 'White',
  green: 'Green', verde: 'Green', verdes: 'Green',
};
export function parseColour(t: string): string | undefined {
  for (const [w, c] of Object.entries(COLOURS)) if (new RegExp(`(^|\\s)${w}(\\s|$)`).test(t)) return c;
  return undefined;
}

export const isAddIntent = (t: string) =>
  /(^|\s)(add|put|throw)\s.+(cart|basket|order)/.test(t) ||
  /^(add|put)\s/.test(t) ||
  /^(i ll|i will|i want to|i d like to|let me|i would like to) (take|buy|order) /.test(t) ||
  /^buy /.test(t) ||
  /(i ll take (it|that|this|one|those|them)|add (it|this|that|them|those))/.test(t) ||
  /(agrega|agregue|agregar|anade|anadir|anada|pon|ponga|meter)\s.*(carrito|canasta|pedido)/.test(t) ||
  /^(agrega|agregue|agregar|anade|anada|anadir)\s/.test(t) ||
  /(lo quiero|la quiero|quiero comprar|me lo llevo|me la llevo)/.test(t);

export const isCartView = (t: string) =>
  /(what s|whats|what is|show|view|see|check|open)\s+(in\s+)?(my\s+)?(cart|basket)/.test(t) ||
  /^(my\s+)?(cart|basket)\??$/.test(t) ||
  /(que hay en|ver|mostrar|muestrame|mi)\s+(mi\s+)?carrito/.test(t);

const ORDINALS: [RegExp, number][] = [
  [/(first|1st|primer|primero|primera)/, 0],
  [/(second|2nd|segundo|segunda)/, 1],
  [/(third|3rd|tercer|tercero|tercera)/, 2],
  [/(fourth|4th|cuarto|cuarta)/, 3],
  [/(last|ultimo|ultima)/, -1],
];

/** Words that are about the request, not the product. */
const NOISE =
  /\b(please|pls|can|could|you|i|i ll|id|d|want|would|like|to|add|put|throw|in|into|on|my|the|a|an|of|those|these|that|this|it|them|cart|basket|order|buy|take|get|one|ones|two|three|four|five|six|seven|eight|nine|pair|couple|x\d|\d|for|me|and|also|too|too|black|blue|red|white|green|negros|negras|rojos|rojas|azules|blancos|blancas|verdes|por favor|quiero|agrega|agregue|agregar|anade|anadir|anada|al|el|la|los|las|un|una|uno|dos|tres|mi|carrito|canasta|pedido|comprar|negro|negra|azul|rojo|roja|blanco|blanca|verde|de|en|lo|me|llevo)\b/g;
export const productWords = (t: string) => t.replace(NOISE, ' ').replace(/\s+/g, ' ').trim();

/** Words for a catalogue search: product words minus question words ("how much is", "do you have"…). */
const QUESTION =
  /\b(how|much|many|is|are|was|what|which|whats|does|do|did|have|has|any|price|prices|cost|costs|sell|carry|stock|available|where|when|can|could|show|see|find|need|looking|look|got|about|tell|info|there|your|you|we|us|cuanto|cuesta|cuestan|tienen|tiene|venden|vende|donde|precio|precios|hay|busco|necesito|muestrame|que|cual)\b/g;
export const searchWords = (t: string) => productWords(t).replace(QUESTION, ' ').replace(/\s+/g, ' ').trim();

/** The item as the visitor wrote it, without "add", the quantity and "to my cart": "add 3 bags of cement to my cart" → "bags of cement". */
export function requestText(t: string): string {
  return t
    .replace(/^(please |pls |can you |could you |i want to |i d like to |i would like to )?(add|put|throw|buy|get|agrega|agregue|agregar|anade|anada|anadir|pon|ponga|quiero)\s+/, '')
    .replace(/^(\d{1,2}|a|an|one|two|three|four|five|six|seven|eight|nine|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\s+/, '')
    .replace(/\s+(to|in|into|on)\s+(my |the )?(cart|basket|order)\b.*$/, '')
    .replace(/\s+(al|a mi|en mi|en el)\s+(carrito|pedido)\b.*$/, '')
    .replace(/\s+(please|por favor)$/, '')
    .replace(/^(the|el|la|los|las)\s+/, '')
    .trim();
}

export interface Resolved {
  product?: ShopProduct;
  candidates: ShopProduct[];
  listed?: ListedModel;
  /** What the visitor typed, minus request words: used for a requested item. */
  text: string;
}

/** Which product does the visitor mean? Model codes first, then "the second one", then a search. */
export function resolveProduct(t: string, lastShown: string[] = []): Resolved {
  const c = compact(t);
  const text = productWords(t);
  // A Shop model code anywhere in the message.
  const byModel = SHOP_PRODUCTS.filter((p) => c.includes(compact(p.model)));
  if (byModel.length) return { product: byModel.sort((a, b) => b.model.length - a.model.length)[0], candidates: byModel, text };
  // A model the live site lists but the Shop doesn't.
  const listed = LISTED_MODELS.filter((m) => c.includes(compact(m.model))).sort((a, b) => b.model.length - a.model.length)[0];
  if (listed) return { listed, candidates: [], text };
  // "the second one", "it", "that" after a list of products.
  if (lastShown.length) {
    for (const [re, i] of ORDINALS) if (re.test(t)) {
      const id = lastShown[i < 0 ? lastShown.length - 1 : i];
      if (id && PRODUCT_BY_ID[id]) return { product: PRODUCT_BY_ID[id], candidates: [PRODUCT_BY_ID[id]], text };
    }
    if (!text || /^(it|that|this|them|those|that one|this one|lo|la|ese|esa|este|esta)$/.test(text)) {
      if (lastShown.length === 1) return { product: PRODUCT_BY_ID[lastShown[0]], candidates: [PRODUCT_BY_ID[lastShown[0]]], text };
      return { candidates: lastShown.map((id) => PRODUCT_BY_ID[id]).filter(Boolean), text };
    }
  }
  if (!text) return { candidates: [], text };
  const hits = searchProducts(text);
  if (hits.length === 1) return { product: hits[0], candidates: hits, text };
  return { candidates: hits, text };
}

/* ---------------- Air conditioner sizing (Sankey's chart) ---------------- */

export interface AcSizing {
  sqft: number;
  base: number;
  adjusted: number;
  notes: [string, string][];
}

export function acSizing(t: string): AcSizing | null {
  let sqft: number | null = null;
  const metric = /(\d+(?:\.\d+)?)\s*(?:m|mts|meters|metres|metros)?\s*(?:x|by|por|\*)\s*(\d+(?:\.\d+)?)\s*(m|mts|meters|metres|metros)\b/.exec(t);
  const dims = /(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|pies)?\s*(?:x|by|por|\*)\s*(\d+(?:\.\d+)?)/.exec(t);
  const area = /(\d+(?:\.\d+)?)\s*(sq ?ft|square f(ee|oo)t|ft2|pies cuadrados|sqft)/.exec(t);
  const areaM = /(\d+(?:\.\d+)?)\s*(m2|sq ?m\b|square met|metros cuadrados)/.exec(t);
  if (metric) sqft = Number(metric[1]) * Number(metric[2]) * 10.764;
  else if (areaM) sqft = Number(areaM[1]) * 10.764;
  else if (area) sqft = Number(area[1]);
  else if (dims) sqft = Number(dims[1]) * Number(dims[2]);
  if (!sqft || sqft < 30 || sqft > 5000) return null;
  sqft = Math.round(sqft);
  const row = AC_CHART.find(([max]) => sqft! <= max) ?? AC_CHART[AC_CHART.length - 1];
  const base = row[1];
  let adjusted = base;
  const notes: [string, string][] = [];
  if (/(sunny|sun|west facing|soleado|mucho sol)/.test(t)) {
    adjusted *= 1.1;
    notes.push(['very sunny: +10%', 'muy soleado: +10%']);
  } else if (/(shade|shaded|shady|sombra)/.test(t)) {
    adjusted *= 0.9;
    notes.push(['heavily shaded: −10%', 'con mucha sombra: −10%']);
  }
  const people = /(\d+)\s*(people|persons|occupants|personas)/.exec(t);
  if (people && Number(people[1]) > 2) {
    adjusted += 600 * (Number(people[1]) - 2);
    notes.push([`${people[1]} people: +600 BTU for each person over two`, `${people[1]} personas: +600 BTU por cada persona después de dos`]);
  }
  if (/(kitchen|cocina)/.test(t)) {
    adjusted += 4000;
    notes.push(['kitchen: +4,000 BTU', 'cocina: +4,000 BTU']);
  }
  return { sqft, base, adjusted: Math.round(adjusted / 100) * 100, notes };
}

export const isAcQuestion = (t: string) =>
  /(\bac\b|a\/c|air ?con|aircon|air condition|btu|split|aire acondicionado|aire)/.test(t) &&
  /(size|sized|what|which|how big|how many|btu|room|bedroom|living|office|sq|square|feet|ft|x|by|tamano|cuarto|habitacion|sala|oficina|metros|pies|que)/.test(t);

/* ---------------- Open now (listed hours, Belize time) ---------------- */

const toMinutes = (h: string) => {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(h)!;
  let hh = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') hh += 12;
  return hh * 60 + Number(m[2]);
};

export interface OpenStatus {
  open: boolean;
  /** "5:00 PM" when open; the next opening day and time when closed. */
  closes?: string;
  opensDay?: string;
  opensTime?: string;
}

/** Belize is UTC−6 all year (no daylight saving time). */
function belizeNow(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Belize', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function openStatus(id: BranchId, now: Date): OpenStatus {
  const b = BRANCH_BY_ID[id];
  const [week, sat] = b.hours; // "Monday – Friday", "Saturday"
  const windowFor = (day: number) => (day >= 1 && day <= 5 ? week : day === 6 ? sat : null);
  const { day, minutes } = belizeNow(now);
  const today = windowFor(day);
  if (today) {
    const [from, to] = today.time.split(/\s*[–-]\s*/);
    if (minutes >= toMinutes(from) && minutes < toMinutes(to)) return { open: true, closes: to };
    if (minutes < toMinutes(from)) return { open: false, opensDay: 'today', opensTime: from };
  }
  for (let k = 1; k <= 7; k++) {
    const d = (day + k) % 7;
    const w = windowFor(d);
    if (w) return { open: false, opensDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d], opensTime: w.time.split(/\s*[–-]\s*/)[0] };
  }
  return { open: false };
}
