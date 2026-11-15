import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * A small persistent JSON collection. Writes are serialized and atomic (temp file + rename).
 * Suitable for the preview and a single server process; use a database for multi-instance hosting.
 */
export class JsonStore {
  constructor(file) {
    this.file = file;
    this.cache = null;
    this.queue = Promise.resolve();
  }

  async load() {
    if (this.cache) return this.cache;
    try {
      this.cache = JSON.parse(await readFile(this.file, 'utf8'));
      if (!Array.isArray(this.cache.items)) this.cache.items = [];
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      this.cache = { items: [] };
    }
    return this.cache;
  }

  async all() {
    return [...(await this.load()).items];
  }

  async find(predicate) {
    return (await this.load()).items.find(predicate) ?? null;
  }

  /** Append an item and persist before resolving. */
  append(item) {
    const run = this.queue.then(async () => {
      const data = await this.load();
      data.items.push(item);
      await this.persist(data);
      return item;
    });
    this.queue = run.catch(() => {});
    return run;
  }

  async persist(data) {
    await mkdir(dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2));
    await rename(tmp, this.file);
  }
}
