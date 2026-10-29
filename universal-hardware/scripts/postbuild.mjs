// Post-build safety checks for the concept deployment. Fails the build if any
// page is missing the noindex directive or the independent-concept disclaimer,
// if required Netlify files are missing, or if anything resembling a secret
// ends up in the output.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const errors = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist);
const html = files.filter((f) => f.endsWith('.html'));

for (const req of ['index.html', '404.html', 'robots.txt', '_headers', 'products/index.html', 'brands/index.html', 'locations/index.html', 'about/index.html', 'concept/index.html', 'find/index.html', 'shop/index.html', 'cart/index.html', 'checkout/index.html']) {
  if (!fs.existsSync(path.join(dist, req))) errors.push(`missing ${req}`);
}
for (const f of html) {
  const s = fs.readFileSync(f, 'utf8');
  const rel = path.relative(dist, f);
  if (!/<meta name="robots" content="noindex/.test(s)) errors.push(`${rel}: missing noindex meta`);
  if (!s.includes('Not commissioned, approved or affiliated with Universal Hardware Company Ltd.')) errors.push(`${rel}: missing disclaimer`);
}
const secretPatterns = [/sk-[A-Za-z0-9]{20,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /ghp_[A-Za-z0-9]{30,}/, /xox[bap]-[A-Za-z0-9-]{10,}/, /AIza[0-9A-Za-z_-]{35}/];
for (const f of files.filter((x) => /\.(html|js|css|json|txt|webmanifest)$/.test(x))) {
  const s = fs.readFileSync(f, 'utf8');
  for (const p of secretPatterns) if (p.test(s)) errors.push(`${path.relative(dist, f)}: matches secret pattern ${p}`);
}
// Remove internal dev-only pages from the deployable output.
for (const dev of ['dev-art']) fs.rmSync(path.join(dist, dev), { recursive: true, force: true });

if (errors.length) {
  console.error('\n[postbuild] FAILED:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`[postbuild] OK — ${html.length} HTML pages, noindex + disclaimer present, no secret patterns found.`);
