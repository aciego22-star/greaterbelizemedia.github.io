/**
 * Search over the Shop's products (brand, model, description and everyday
 * words in English and Spanish). Shared by site search and Universal AI.
 */
import { SHOP_GROUPS, SHOP_PRODUCTS, type ShopProduct } from '../data/shop';
import { normalize, tokens, wordMatch } from './search';

// Everyday words (English and Spanish) for what each product is.
const SYNONYMS: [RegExp, string][] = [
  [/drill|hammer/i, 'drill taladro rotomartillo'],
  [/grinder/i, 'grinder esmeril amoladora pulidora'],
  [/saw/i, 'saw sierra'],
  [/sander/i, 'sander lijadora'],
  [/trimmer|brushcutter/i, 'trimmer weed eater desbrozadora chapeadora'],
  [/pressure washer/i, 'pressure washer hidrolavadora lavadora a presion'],
  [/battery/i, 'battery bateria'],
  [/charger/i, 'charger cargador'],
  [/scooter/i, 'scooter moto motocicleta'],
  [/bike|street|trail|wheel/i, 'motorcycle motorbike moto motocicleta'],
];
const GROUP_LABEL = Object.fromEntries(SHOP_GROUPS.map((g) => [g.id, g.label]));

const PRODUCT_INDEX = SHOP_PRODUCTS.map((p) => ({
  p,
  text: normalize(
    `${p.brand} ${p.model} ${p.model.replace(/-/g, '')} ${p.name} ${GROUP_LABEL[p.group]} ${SYNONYMS.filter(([re]) => re.test(`${p.name} ${p.group}`))
      .map(([, w]) => w)
      .join(' ')}`,
  ),
}));

export function searchProducts(q: string): ShopProduct[] {
  const qts = tokens(q);
  if (!qts.length) return [];
  return PRODUCT_INDEX.map(({ p, text }) => {
    let score = 0;
    for (const qt of qts) {
      const m = wordMatch(qt, text);
      if (!m) return { p, score: 0 };
      score += m;
    }
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .map((x) => x.p);
}

