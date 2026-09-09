/**
 * Fails the build if internal or review language reaches a visitor.
 *
 * Checks rendered text (tags stripped) and the raw HTML of every page, plus
 * robots.txt and the shipped CSS and JS.
 *
 * Usage: node scripts/scan-language.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

// Phrases that must never appear in anything a visitor can read.
const BANNED = [
  'concept rebuild', 'sitio conceptual', 'unapproved concept', 'concepto no aprobado',
  'provisional', 'provisionales', 'published listings', 'listados publicados',
  'information published by', 'preview', 'review', 'deployable', 'backend',
  'static build', 'implementation', 'netlify', 'route selector', 'inert links',
  'visual reset', 'subset of routes',
];

// "route" and "routes" are banned as visitor copy, but the word legitimately
// appears in the referrerpolicy attribute value and in CSS custom properties,
// so the raw-HTML pass uses a narrower list than the rendered-text pass.
const BANNED_TEXT_ONLY = ['route', 'routes'];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ');

/** Metadata a visitor sees in a tab, a search result or a share card. */
const metaText = (html) =>
  [...html.matchAll(/<title>([^<]*)<\/title>/gi)].map((m) => m[1])
    .concat([...html.matchAll(/<meta[^>]+content="([^"]*)"[^>]*>/gi)].map((m) => m[1]))
    .join(' | ');

const problems = [];

for (const file of walk(DIST)) {
  const rel = relative(DIST, file);
  const isHtml = file.endsWith('.html');
  const isAsset = /\.(css|js|txt|xml)$/.test(file);
  if (!isHtml && !isAsset) continue;

  const raw = readFileSync(file, 'utf8');
  const haystacks = isHtml
    ? [['rendered text', strip(raw)], ['metadata', metaText(raw)], ['raw html', raw]]
    : [['file', raw]];

  // Em dashes are not wanted anywhere a visitor can read them. They are
  // checked separately from the phrase list because they are punctuation
  // rather than a word, so the whole-word rule below does not apply.
  for (const [where, text] of haystacks) {
    if (where !== 'raw html') {
      const dash = text.indexOf('\u2014');
      if (dash !== -1) {
        problems.push(
          `${rel} [${where}] em dash ... ${text.slice(Math.max(0, dash - 50), dash + 60).trim()}`
        );
      }
    }
  }

  for (const [where, text] of haystacks) {
    const lower = text.toLowerCase();
    const list = where === 'raw html' ? BANNED : BANNED.concat(BANNED_TEXT_ONLY);
    for (const phrase of list) {
      let i = lower.indexOf(phrase);
      while (i !== -1) {
        // Whole-word match, so "preview" does not fire inside a longer token.
        const before = lower[i - 1] ?? ' ';
        const after = lower[i + phrase.length] ?? ' ';
        if (!/[a-z]/.test(before) && !/[a-z]/.test(after)) {
          problems.push(`${rel} [${where}] "${phrase}" ... ${text.slice(Math.max(0, i - 50), i + 60).trim()}`);
          break;
        }
        i = lower.indexOf(phrase, i + 1);
      }
    }
  }
}

console.log(`Scanned ${walk(DIST).filter((f) => /\.(html|css|js|txt|xml)$/.test(f)).length} files.`);
if (problems.length) {
  console.log(`\nBanned language found (${problems.length}):`);
  for (const p of problems.slice(0, 30)) console.log('  - ' + p);
  if (problems.length > 30) console.log(`  ... ${problems.length - 30} more`);
  process.exit(1);
}
console.log('No internal or review language reaches a visitor.');
