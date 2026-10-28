// Packages dist/ as a Netlify drag-and-drop ZIP with index.html at the root.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const outDir = path.resolve('deliverables');
const out = path.join(outDir, 'universal-hardware-concept-netlify.zip');
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found — run `npm run build` first.');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
fs.rmSync(out, { force: true });
execFileSync('zip', ['-r', '-q', '-X', out, '.', '-x', '*.DS_Store'], { cwd: dist, stdio: 'inherit' });
const list = execFileSync('unzip', ['-Z1', out], { encoding: 'utf8' }).split('\n').filter(Boolean);
if (!list.includes('index.html') || list.some((f) => f.startsWith('dist/'))) {
  console.error('ZIP is not rooted correctly.');
  process.exit(1);
}
console.log(`Wrote ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${list.length} entries, index.html at root).`);
