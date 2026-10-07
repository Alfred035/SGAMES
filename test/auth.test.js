import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../server/database.js';
import { createApp } from '../server/app.js';

const account = { name: 'Jogador SGAMES', email: 'player@example.com', password: 'senha de teste segura' };
const cookieOf = response => response.headers.get('set-cookie').split(';')[0];

async function fixture(t, options = {}, database) {
  const db = database || openDatabase(':memory:');
  const app = createApp(db, options);
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.address().port}`;
  t.after(async () => {
    await new Promise(resolve => app.close(resolve));
    db.close();
  });
  const request = (path, { body, cookie, method = body === undefined ? 'GET' : 'POST', headers = {} } = {}) => fetch(base + path, {
    method,
    headers: { Origin: base, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { db, request, base };
}

test('cadastro protege a senha e cria uma sessão HttpOnly', async t => {
  const { request, db } = await fixture(t);
  const response = await request('/api/auth/register', { body: { ...account, email: ' PLAYER@EXAMPLE.COM ' } });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.user.email, account.email);
  assert.deepEqual(Object.keys(body.user).sort(), ['createdAt', 'email', 'id', 'name']);
  assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Lax; Max-Age=604800/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const stored = db.prepare('SELECT * FROM users').get();
  assert.notEqual(stored.password_hash, account.password);
  assert.match(stored.password_hash, /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
  const session = db.prepare('SELECT * FROM sessions').get();
  assert.notEqual(session.token_hash, cookieOf(response).split('=')[1]);
  assert.equal((await request('/api/auth/me', { cookie: cookieOf(response) })).status, 200);
  assert.equal((await request('/api/auth/me')).status, 401);
});

test('login, rotação da sessão, logout e credenciais incorretas', async t => {
  const { request } = await fixture(t);
  const registered = await request('/api/auth/register', { body: account });
  const oldCookie = cookieOf(registered);
  const wrong = await request('/api/auth/login', { body: { ...account, password: 'senha incorreta 1234' } });
  const missing = await request('/api/auth/login', { body: { ...account, email: 'missing@example.com' } });
  assert.equal(wrong.status, 401);
  assert.deepEqual(await wrong.json(), await missing.json());
  const loggedIn = await request('/api/auth/login', { body: account, cookie: oldCookie });
  assert.equal(loggedIn.status, 200);
  const cookie = cookieOf(loggedIn);
  assert.notEqual(cookie, oldCookie);
  assert.equal((await request('/api/auth/me', { cookie: oldCookie })).status, 401);
  assert.equal((await request('/api/auth/me', { cookie })).status, 200);
  const logout = await request('/api/auth/logout', { body: {}, cookie });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await request('/api/auth/me', { cookie })).status, 401);
  assert.equal((await request('/api/auth/logout', { body: {} })).status, 200);
});

test('validação e e-mail duplicado sem distinção de maiúsculas', async t => {
  const { request } = await fixture(t);
  for (const body of [null, [], { ...account, email: 'invalido' }, { ...account, name: 'A' }, { ...account, password: '123' }, { ...account, password: 'x'.repeat(129) }]) {
    assert.equal((await request('/api/auth/register', { body })).status, 400);
  }
  assert.equal((await request('/api/auth/register', { body: account })).status, 201);
  assert.equal((await request('/api/auth/register', { body: { ...account, email: 'PLAYER@example.com' } })).status, 409);
});

test('rejeita origem externa, origem ausente, tipos inválidos e corpos excessivos', async t => {
  const { request, base } = await fixture(t);
  assert.equal((await request('/api/auth/register', { body: account, headers: { Origin: 'https://outro-site.example' } })).status, 403);
  assert.equal((await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(account) })).status, 403);
  assert.equal((await request('/api/auth/register', { body: account, headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
  assert.equal((await request('/api/auth/register', { body: account, headers: { 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await request('/api/auth/register', { body: { ...account, name: 'x'.repeat(20000) } })).status, 413);
  assert.equal((await fetch(base + '/api/auth/register', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{broken' })).status, 400);
  const method = await request('/api/auth/register');
  assert.equal(method.status, 405);
  assert.equal(method.headers.get('allow'), 'POST');
});

test('sessões expiram no banco e cookies de produção usam Secure', async t => {
  let time = Date.now();
  const { request } = await fixture(t, { secureCookies: true, now: () => time });
  const registration = await request('/api/auth/register', { body: account });
  assert.match(registration.headers.get('set-cookie'), /; Secure/);
  const cookie = cookieOf(registration);
  assert.equal((await request('/api/auth/me', { cookie })).status, 200);
  time += 7 * 24 * 60 * 60 * 1000;
  assert.equal((await request('/api/auth/me', { cookie })).status, 401);
});

test('origem pública configurada funciona atrás de um proxy e rejeita a origem local', async t => {
  const origin = 'https://sgames.example';
  const { request } = await fixture(t, { origin, secureCookies: true });
  assert.equal((await request('/api/auth/register', { body: account })).status, 403);
  const response = await request('/api/auth/register', { body: account, headers: { Origin: origin } });
  assert.equal(response.status, 201);
  assert.match(response.headers.get('set-cookie'), /; Secure/);
});

test('cadastros concorrentes não duplicam o mesmo e-mail', async t => {
  const { request, db } = await fixture(t);
  const responses = await Promise.all([
    request('/api/auth/register', { body: account }),
    request('/api/auth/register', { body: account })
  ]);
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM users').get().count, 1);
});

test('limite de tentativas bloqueia abuso e libera após a janela', async t => {
  let time = Date.now();
  const { request } = await fixture(t, { now: () => time });
  for (let n = 0; n < 10; n++) {
    assert.equal((await request('/api/auth/login', { body: account })).status, 401);
  }
  const blocked = await request('/api/auth/login', { body: account });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('retry-after'), '900');
  time += 15 * 60 * 1000;
  assert.equal((await request('/api/auth/login', { body: account })).status, 401);
});

test('contas e sessões persistem ao reabrir o banco sem alterar catálogo', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'sgames-auth-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, 'db.sqlite');
  const db = openDatabase(path);
  db.prepare("UPDATE catalog SET price_cents = 12345 WHERE id = 'gta-v'").run();
  const app = createApp(db);
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.address().port}`;
  const registered = await fetch(base + '/api/auth/register', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify(account) });
  const cookie = cookieOf(registered);
  await new Promise(resolve => app.close(resolve));
  db.close();
  const reopened = openDatabase(path);
  const { request } = await fixture(t, {}, reopened);
  assert.equal((await request('/api/auth/me', { cookie })).status, 200);
  assert.equal((await request('/api/products/gta-v')).status, 200);
  assert.equal(reopened.prepare("SELECT price_cents FROM catalog WHERE id = 'gta-v'").get().price_cents, 12345);
});
