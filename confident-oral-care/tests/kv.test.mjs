import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { getStore } from '@netlify/blobs';
import { BlobsServer } from '@netlify/blobs/server';
import { FileKV } from '../src/kv-file.mjs';
import { BlobsKV, MemoryKV } from '../src/kv.mjs';

const blobsServer = new BlobsServer({ directory: await mkdtemp(join(tmpdir(), 'blobs-')), token: 'test-token' });
const { port } = await blobsServer.start();
after(() => blobsServer.stop());

const backends = {
  MemoryKV: async () => new MemoryKV(),
  FileKV: async () => new FileKV(await mkdtemp(join(tmpdir(), 'filekv-'))),
  'BlobsKV (local Netlify Blobs server)': async () => new BlobsKV(getStore({
    name: `test-${Math.random().toString(36).slice(2)}`, siteID: 'test-site', token: 'test-token',
    edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}`, consistency: 'strong',
  })),
};

for (const [name, make] of Object.entries(backends)) {
  test(`${name}: get/set/list and atomic create-if-absent`, async () => {
    const kv = await make();
    assert.equal(await kv.getJSON('events/CD-AAAAAA'), null);
    await kv.setJSON('events/CD-AAAAAA', { a: 1 });
    await kv.setJSON('events/CD-BBBBBB', { b: 2 });
    await kv.setJSON('other/x', { c: 3 });
    assert.deepEqual(await kv.getJSON('events/CD-AAAAAA'), { a: 1 });
    assert.deepEqual(await kv.list('events/'), ['events/CD-AAAAAA', 'events/CD-BBBBBB']);
    // Create-if-absent: the first create wins and later ones are refused without overwriting.
    assert.equal(await kv.createJSON('slots/test-chair-1/1794841200000', { i: 1 }), true);
    assert.equal(await kv.createJSON('slots/test-chair-1/1794841200000', { i: 2 }), false);
    assert.deepEqual(await kv.getJSON('slots/test-chair-1/1794841200000'), { i: 1 });
    if (!name.startsWith('BlobsKV')) {
      // Concurrent claims: exactly one wins. (Netlify's local Blobs emulator does not serialize
      // concurrent conditional writes, so this check is skipped there; production Blobs documents
      // onlyIfNew as a conditional write.)
      const claims = await Promise.all([1, 2, 3, 4].map((i) => kv.createJSON('slots/test-chair-1/1794844800000', { i })));
      assert.equal(claims.filter(Boolean).length, 1);
    }
    await assert.rejects(kv.setJSON('../escape', {}));
  });
}
