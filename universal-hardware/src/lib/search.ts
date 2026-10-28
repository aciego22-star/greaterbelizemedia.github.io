/**
 * Client-side catalogue search over the source-backed category data.
 * Matches category names, listed sub-types, keywords (incl. common Spanish
 * terms) and brand names. Forgiving of plurals and small typos.
 */
import { CATEGORIES, type Category } from '../data/categories';
import { BRANDS } from '../data/brands';

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stem = (w: string) => w.replace(/(ies)$/, 'y').replace(/(ches|shes|sses|xes)$/, (m) => m.slice(0, -2)).replace(/([^s])s$/, '$1');

const STOP = new Set(['a', 'an', 'the', 'for', 'and', 'or', 'of', 'to', 'in', 'my', 'i', 'need', 'want', 'with', 'de', 'para', 'el', 'la', 'un', 'una', 'y']);

export function tokens(q: string): string[] {
  return normalize(q)
    .split(' ')
    .filter((t) => t && !STOP.has(t))
    .map(stem);
}

function editDistanceLE1(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function wordMatch(qt: string, text: string): number {
  // 3 = whole-word, 2 = prefix, 1 = fuzzy (typo), 0 = none
  const words = text.split(' ').map(stem);
  let best = 0;
  for (const w of words) {
    if (w === qt) return 3;
    if (qt.length >= 3 && w.startsWith(qt)) best = Math.max(best, 2);
    else if (qt.length >= 5 && w.length >= 4 && editDistanceLE1(qt, w)) best = Math.max(best, 1);
  }
  if (!best && qt.length >= 4 && text.replace(/\s/g, '').includes(qt)) best = 1;
  return best;
}

export interface CategoryHit {
  category: Category;
  score: number;
  subMatches: string[];
  brandMatches: string[];
}

interface Indexed {
  category: Category;
  name: string;
  keywords: string;
  summary: string;
  subs: { name: string; text: string }[];
  brands: { name: string; text: string }[];
}

const INDEX: Indexed[] = CATEGORIES.map((c) => ({
  category: c,
  name: normalize(`${c.name} ${c.shortName}`),
  keywords: normalize(c.keywords.join(' ')),
  summary: normalize(c.summary),
  subs: c.subcategories.map((s) => ({ name: s.name, text: normalize(`${s.name} ${s.keywords.join(' ')}`) })),
  brands: BRANDS.filter((b) => b.categories.some((l) => l.slug === c.slug) || c.listedBrands.includes(b.name)).map((b) => ({
    name: b.name,
    text: normalize(`${b.name} ${(b.alsoWritten ?? []).join(' ')}`),
  })),
}));

export function searchCategories(query: string): CategoryHit[] {
  const qts = tokens(query);
  if (!qts.length) return CATEGORIES.map((c) => ({ category: c, score: 0, subMatches: [], brandMatches: [] }));
  const hits: CategoryHit[] = [];
  for (const it of INDEX) {
    let score = 0;
    let allMatched = true;
    const subMatches = new Set<string>();
    const brandMatches = new Set<string>();
    for (const qt of qts) {
      let tokenScore = 0;
      tokenScore = Math.max(tokenScore, wordMatch(qt, it.name) * 4);
      tokenScore = Math.max(tokenScore, wordMatch(qt, it.keywords) * 2);
      for (const s of it.subs) {
        const m = wordMatch(qt, s.text);
        if (m) {
          subMatches.add(s.name);
          tokenScore = Math.max(tokenScore, m * 3);
        }
      }
      for (const b of it.brands) {
        const m = wordMatch(qt, b.text);
        if (m >= 2) {
          brandMatches.add(b.name);
          tokenScore = Math.max(tokenScore, m * 3);
        }
      }
      tokenScore = Math.max(tokenScore, wordMatch(qt, it.summary));
      if (!tokenScore) allMatched = false;
      score += tokenScore;
    }
    // Require every meaningful token to match somewhere (AND semantics),
    // but fall back to partial matches when nothing matches fully.
    if (score > 0) hits.push({ category: it.category, score: allMatched ? score + 100 : score, subMatches: [...subMatches], brandMatches: [...brandMatches] });
  }
  hits.sort((a, b) => b.score - a.score);
  const full = hits.filter((h) => h.score >= 100);
  return full.length ? full : hits.filter((h) => h.score >= 3);
}

export const POPULAR_SEARCHES = ['Generator', 'Water pump', 'Hammer drill', 'MIG welder', 'Chainsaw', 'AC unit', 'Barb wire', 'Makita'];
