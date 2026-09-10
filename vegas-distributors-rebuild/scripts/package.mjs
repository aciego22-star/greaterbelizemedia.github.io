/**
 * Packages dist/ as the Netlify upload ZIP.
 *
 * Only the built site goes in: no sources, no node_modules, no caches.
 * Written with Node's own deflate so the build needs no zip binary.
 *
 * A whole build of this site now runs past the size a single upload is
 * accepted at, so it is written as numbered parts when it has to be. Part one
 * is the site; part two is the campaign film, which is already compressed and
 * gains nothing from being zipped alongside everything else. Unpack both into
 * the same folder and the result is the complete site, in one piece.
 *
 * Usage: node scripts/package.mjs
 */
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT_DIR = join(ROOT, 'release');
const LIMIT = 29 * 1024 * 1024;
const OUT = join(OUT_DIR, 'Vegas Distributors Netlify Upload.zip');
const PART1 = join(OUT_DIR, 'Vegas Distributors Netlify Upload - part 1 of 2.zip');
const PART2 = join(OUT_DIR, 'Vegas Distributors Netlify Upload - part 2 of 2.zip');

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html is missing; refusing to package.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const allFiles = walk(DIST).sort();

/* One archive, written with Node's own deflate. */
function writeZip(out, files) {
  const locals = [];
  const central = [];
  let offset = 0;
  let rawTotal = 0;

  for (const file of files) {
    const name = relative(DIST, file).split(sep).join('/');
    const data = readFileSync(file);
    rawTotal += data.length;
    const body = deflateRawSync(data, { level: 9 });
    const nameBytes = Buffer.from(name, 'utf8');
    const sum = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(sum, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBytes, body);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0, 8);
    entry.writeUInt16LE(8, 10);
    entry.writeUInt16LE(0, 12);
    entry.writeUInt16LE(0, 14);
    entry.writeUInt32LE(sum, 16);
    entry.writeUInt32LE(body.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBytes.length, 28);
    entry.writeUInt16LE(0, 30);
    entry.writeUInt16LE(0, 32);
    entry.writeUInt16LE(0, 34);
    entry.writeUInt16LE(0, 36);
    entry.writeUInt32LE(0, 38);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBytes);

    offset += local.length + nameBytes.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(out, Buffer.concat([...locals, centralBuf, end]));
  return { entries: files.length, raw: rawTotal, size: statSync(out).size };
}

const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
const report = (label, out, r) => {
  console.log(`${label}`);
  console.log(`  Entries:      ${r.entries}`);
  console.log(`  Uncompressed: ${mb(r.raw)}`);
  console.log(`  Archive:      ${mb(r.size)}`);
  console.log(`  Written:      ${out}`);
};

const whole = writeZip(OUT, allFiles);

if (whole.size <= LIMIT) {
  report('Netlify upload', OUT, whole);
} else {
  // The film is already compressed, so it is the clean place to divide.
  const isFilm = (f) => relative(DIST, f).split(sep).join('/').startsWith('assets/video/');
  const site = allFiles.filter((f) => !isFilm(f));
  const film = allFiles.filter(isFilm);
  const a = writeZip(PART1, site);
  const b = writeZip(PART2, film);
  rmSync(OUT, { force: true });
  console.log(`A whole build is ${mb(whole.size)}, past the ${mb(LIMIT)} an upload is accepted at.`);
  console.log('Written as two parts. Unpack both into the same folder before uploading.\n');
  report('Part 1 of 2, the site', PART1, a);
  console.log('');
  report('Part 2 of 2, the campaign film', PART2, b);
}
