/**
 * Builds the review file at the best picture size that still fits.
 *
 * The whole site travels as one document, so it has a ceiling: it is refused
 * above 16 MB. Rather than leave that to be discovered when handing it over,
 * this builds at the size pictures deserve and, only if the result is too
 * large, builds again a step smaller until it fits. What it settled on is
 * reported, so a file that had to give up detail says so.
 *
 * Usage: node scripts/preview-fit.mjs
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'release', 'preview.html');
const LIMIT = 15.4 * 1024 * 1024;

// Campaign artwork carries its own headline, so it is the last to be reduced.
const STEPS = [
  { art: 800, hero: 960 },
  { art: 720, hero: 960 },
  { art: 600, hero: 960 },
  { art: 520, hero: 960 },
  { art: 480, hero: 960 },
  { art: 440, hero: 840 },
  { art: 400, hero: 720 },
];

let last;
for (const [i, step] of STEPS.entries()) {
  execFileSync('node', [join(ROOT, 'scripts', 'preview.mjs')], {
    stdio: i === 0 ? 'inherit' : ['inherit', 'ignore', 'inherit'],
    env: { ...process.env, PREVIEW_ART: String(step.art), PREVIEW_HERO: String(step.hero) },
  });
  last = { ...step, size: statSync(OUT).size };
  if (last.size <= LIMIT) break;
  if (i < STEPS.length - 1) {
    console.log(`  ${(last.size / 1048576).toFixed(2)} MB is too large to hand over; ` +
      `building again with pictures at ${STEPS[i + 1].art}px.`);
  }
}

const mb = (last.size / 1048576).toFixed(2);
if (last.size > LIMIT) {
  console.log(`\nReview file: ${mb} MB at the smallest pictures available. It may be refused.`);
} else {
  console.log(`\nReview file: ${mb} MB, pictures at ${last.art}px, campaign artwork at ${last.hero}px.`);
}
