// Lists English that is still showing with the site switched to Spanish.
// Usage: node scripts/collect-text.cjs --lang=es && node scripts/i18n-check.mjs
import fs from 'node:fs';
const es = JSON.parse(fs.readFileSync('.cache/i18n/text-es.json', 'utf8'));
const dict = JSON.parse(fs.readFileSync('src/i18n/es.json', 'utf8'));
const values = new Set(Object.values(dict));
// Words that only appear in English sentences.
const ENGLISH = /\b(the|and|your|with|for|from|you|this|that|are|is|to|of|in|on|at|or|our|can|will|ask|find|shop|view|more|all|back|open)\b/i;
const NAMES = /^(Makita|Lifan|Meilun|Hisun|True Value|Universal Hardware|Spanish Lookout|Belama|WhatsApp|[A-Z0-9 .,&/·+()–—-]+)$/;
// Strings that read the same in Spanish (names, events, "Total", "Scooters").
const SAME = new Set(['Scooter 125cc Meilun Flash', 'ECHO / Shindaiwa, MTD, Briggs & Stratton, Homelite', 'Denyo, Briggs & Stratton, Honda, Makita, Lincoln Electric, Meilun', 'Total', 'Scooters', 'Friends And Family Day 2026', 'Spanish Lookout Commercial Industrial Expo 2026', 'Universal Mega Sale 2026']);
const misses = es.filter((x) => !SAME.has(x.text)).filter((x) => (x.text in dict) || (!values.has(x.text) && ENGLISH.test(x.text) && !NAMES.test(x.text)));
for (const m of misses) console.log(`${m.pages}p  ${JSON.stringify(m.text).slice(0, 150)}  @ ${m.where[0]}`);
console.log(`${misses.length} possible untranslated strings`);
process.exitCode = misses.length ? 1 : 0;
