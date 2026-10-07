import { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { HttpError, readJson, verifyOrigin } from './http.js';

const deriveKey = promisify(scrypt);
const COOKIE = 'sgames_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const scryptOptions = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const hashToken = token => createHash('sha256').update(token).digest('hex');
const publicUser = row => ({ id: row.id, name: row.name, email: row.email, createdAt: new Date(row.created_at).toISOString() });

function validateCredentials(body, registration) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Informe um e-mail válido.');
  }
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
    throw new HttpError(400, 'A senha deve ter entre 10 e 128 caracteres.');
  }
  const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  if (registration && (name.length < 2 || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name))) {
    throw new HttpError(400, 'O nome deve ter entre 2 e 80 caracteres.');
  }
  return { email, password, name };
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, 64, scryptOptions);
  return `scrypt$${salt}$${key.toString('hex')}`;
}

// Também calcula scrypt para um usuário inexistente, sem distinguir o erro de login.
async function matchesPassword(password, stored) {
  const [, salt, expected] = (stored || `scrypt$${'0'.repeat(32)}$${'0'.repeat(128)}`).split('$');
  const key = await deriveKey(password, salt, 64, scryptOptions);
  const expectedKey = Buffer.from(expected, 'hex');
  return expectedKey.length === key.length && timingSafeEqual(key, expectedKey) && Boolean(stored);
}

function cookieToken(req) {
  const value = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

export function createAuth(db, { origin, secureCookies = false, now = Date.now } = {}) {
  const attempts = new Map();
  const windowMs = 15 * 60 * 1000;

  function throttle(req, res, email) {
    const time = now();
    // Limpeza limita memória mesmo com muitos endereços ou e-mails diferentes.
    for (const [key, entry] of attempts) if (entry.until <= time) attempts.delete(key);
    const keys = [[`ip:${req.socket.remoteAddress}`, 30], [`email:${hashToken(email)}`, 10]];
    for (const [key, limit] of keys) {
      const entry = attempts.get(key);
      if (entry && entry.count >= limit) {
        res.setHeader('Retry-After', Math.ceil((entry.until - time) / 1000));
        throw new HttpError(429, 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      }
    }
    if (attempts.size >= 10000) throw new HttpError(429, 'Serviço ocupado. Tente novamente em alguns minutos.');
    for (const [key] of keys) {
      const entry = attempts.get(key) || { count: 0, until: time + windowMs };
      entry.count += 1;
      attempts.set(key, entry);
    }
  }

  function setCookie(res, token, seconds) {
    res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secureCookies ? '; Secure' : ''}`);
  }

  function invalidate(req) {
    const token = cookieToken(req);
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  }

  function startSession(req, res, userId) {
    const time = now();
    const token = randomBytes(32).toString('hex');
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(time);
    invalidate(req);
    db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(hashToken(token), userId, time + SESSION_MS);
    setCookie(res, token, SESSION_MS / 1000);
  }

  async function handle(req, res, url, json) {
    const routes = new Map([
      ['/api/auth/register', 'POST'], ['/api/auth/login', 'POST'],
      ['/api/auth/logout', 'POST'], ['/api/auth/me', 'GET']
    ]);
    const method = routes.get(url.pathname);
    if (!method) return false;
    if (req.method !== method && !(method === 'GET' && req.method === 'HEAD')) {
      res.setHeader('Allow', method === 'GET' ? 'GET, HEAD' : method);
      throw new HttpError(405, 'Método não permitido.');
    }
    if (method === 'GET') {
      const token = cookieToken(req);
      const user = token ? db.prepare(`
        SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE token_hash = ? AND expires_at > ?
      `).get(hashToken(token), now()) : null;
      if (!user) {
        invalidate(req);
        setCookie(res, '', 0);
        throw new HttpError(401, 'Entre na sua conta para continuar.');
      }
      json(200, { user: publicUser(user) });
      return true;
    }
    verifyOrigin(req, origin);
    const body = await readJson(req);
    if (url.pathname === '/api/auth/logout') {
      invalidate(req);
      setCookie(res, '', 0);
      json(200, { message: 'Você saiu da sua conta.' });
      return true;
    }
    const registration = url.pathname === '/api/auth/register';
    const { email, password, name } = validateCredentials(body, registration);
    throttle(req, res, email);
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (registration) {
      if (user) throw new HttpError(409, 'Já existe uma conta com esse e-mail.');
      const passwordHash = await hashPassword(password);
      user = { id: randomUUID(), name, email, password_hash: passwordHash, created_at: now() };
      try {
        db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?)').run(user.id, user.name, user.email, user.password_hash, user.created_at);
      } catch (error) {
        if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
          throw new HttpError(409, 'Já existe uma conta com esse e-mail.');
        }
        throw error;
      }
    } else if (!await matchesPassword(password, user?.password_hash)) {
      throw new HttpError(401, 'E-mail ou senha incorretos.');
    }
    startSession(req, res, user.id);
    json(registration ? 201 : 200, { user: publicUser(user) });
    return true;
  }
  return { handle };
}
