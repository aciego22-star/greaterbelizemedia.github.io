import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { checkKey } from './kv.mjs';

/** Key-value store as JSON files under a directory (Node server). createJSON uses O_EXCL, so it is atomic. */
export class FileKV {
  constructor(dir) { this.dir = dir; }

  path(key) { return `${join(this.dir, ...checkKey(key))}.json`; }

  async getJSON(key) {
    try {
      return JSON.parse(await readFile(this.path(key), 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  async setJSON(key, value) {
    const file = this.path(key);
    await mkdir(dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(value, null, 2));
    await rename(tmp, file);
  }

  async createJSON(key, value) {
    const file = this.path(key);
    await mkdir(dirname(file), { recursive: true });
    try {
      await writeFile(file, JSON.stringify(value, null, 2), { flag: 'wx' });
      return true;
    } catch (err) {
      if (err.code === 'EEXIST') return false;
      throw err;
    }
  }

  async list(prefix) {
    const base = join(this.dir, ...checkKey(prefix.replace(/\/$/, '')));
    const out = [];
    const walk = async (dir) => {
      let entries;
      try { entries = await readdir(dir, { withFileTypes: true }); } catch (err) { if (err.code === 'ENOENT') return; throw err; }
      for (const e of entries) {
        const full = join(dir, e.name);
        if (e.isDirectory()) await walk(full);
        else if (e.name.endsWith('.json')) out.push(relative(this.dir, full).slice(0, -5).split(sep).join('/'));
      }
    };
    await walk(base);
    return out.sort();
  }
}
