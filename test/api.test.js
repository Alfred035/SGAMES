import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../server/database.js';
import { createApp } from '../server/app.js';

test('API, filtros, preços, arquivos públicos e persistência SQLite', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'sgames-test-'));
  const path = join(directory, 'catalog.sqlite');
  let db = openDatabase(path);
  const count = db.prepare('SELECT COUNT(*) AS count FROM catalog').get().count;
  db.prepare("UPDATE catalog SET price_cents = 12345 WHERE id = 'gta-v'").run();
  db.close();
  db = openDatabase(path);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM catalog').get().count, count);
  const app = createApp(db);
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.address().port}`;
  const get = async path => (await fetch(base + path)).json();
  try {
    assert.equal((await get('/api/health')).status, 'ok');
    const all = await get('/api/products');
    assert.equal(all.total, 37);
    assert.equal((await get('/api/promotions')).total, 4);
    const filtered = await get('/api/products?tipo=console&categoria=playstation&ordem=preco-asc');
    assert.equal(filtered.total, 3);
    assert.equal(filtered.data[0].id, 'ps3-slim');
    assert.equal((await get('/api/products?q=CYBER')).total, 2);
    assert.equal((await get('/api/products/gta-v')).data.price, 123.45);
    assert.equal((await fetch(base + '/api/products/missing')).status, 404);
    assert.equal((await fetch(base + '/api/products?ordem=invalid')).status, 400);
    assert.equal((await get('/api/products?categoria=%27%20OR%201=1--')).total, 0);
    assert.equal((await fetch(base + '/api/products', { method: 'POST' })).status, 405);
    for (const path of ['/server/catalog.json', '/data/sgames.sqlite', '/package.json', '/.git/config', '/css/../server/app.js']) {
      assert.equal((await fetch(base + path)).status, 404);
    }
    const home = await fetch(base + '/');
    assert.equal(home.status, 200);
    assert.match(await home.text(), /SGAMES/);
    assert.equal((await fetch(base + '/js/script.js')).status, 200);
    const head = await fetch(base + '/api/products', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal(head.headers.get('x-content-type-options'), 'nosniff');
    assert.match(head.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal((await fetch(base + '/conta.html')).status, 200);
  } finally {
    await new Promise(resolve => app.close(resolve));
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
