import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { serializeItem } from './database.js';
import { createAuth } from './auth.js';
import { HttpError } from './http.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const pages = new Set(['index.html', 'jogos.html', 'console.html', 'acessorios.html', 'contato.html', 'produto.html', 'conta.html']);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2' };
const orders = { padrao: 'position', 'nome-asc': 'name ASC', 'nome-desc': 'name DESC', 'preco-asc': 'price_cents ASC', 'preco-desc': 'price_cents DESC' };

export function createApp(db, options = {}) {
  const auth = createAuth(db, options);
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'");
    const json = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify(body));
    };
    try {
      const url = new URL(req.url, 'http://localhost');
      if (await auth.handle(req, res, url, json)) return;
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.setHeader('Allow', 'GET, HEAD');
        return json(405, { error: 'Método não permitido' });
      }
      if (url.pathname === '/api/health') {
        db.prepare('SELECT 1').get();
        return json(200, { status: 'ok' });
      }
      if (url.pathname === '/api/products' || url.pathname === '/api/promotions') {
        const kind = url.pathname.endsWith('products') ? 'product' : 'promotion';
        const order = url.searchParams.get('ordem') || 'padrao';
        if (!Object.hasOwn(orders, order)) return json(400, { error: 'Ordenação inválida' });
        const conditions = ['kind = ?'];
        const values = [kind];
        for (const [param, column] of [['tipo', 'type'], ['categoria', 'category']]) {
          if (url.searchParams.has(param)) { conditions.push(`${column} = ?`); values.push(url.searchParams.get(param)); }
        }
        const rows = db.prepare(`SELECT * FROM catalog WHERE ${conditions.join(' AND ')} ORDER BY ${orders[order]}`).all(...values);
        const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase('pt-BR');
        const data = rows.filter(row => row.name.toLocaleLowerCase('pt-BR').includes(query));
        if (order.startsWith('nome-')) {
          const direction = order === 'nome-asc' ? 1 : -1;
          data.sort((a, b) => direction * a.name.localeCompare(b.name, 'pt-BR'));
        }
        return json(200, { data: data.map(serializeItem), total: data.length });
      }
      if (url.pathname.startsWith('/api/products/')) {
        const id = decodeURIComponent(url.pathname.slice('/api/products/'.length));
        const row = db.prepare("SELECT * FROM catalog WHERE id = ? AND kind = 'product'").get(id);
        return row ? json(200, { data: serializeItem(row) }) : json(404, { error: 'Produto não encontrado' });
      }
      if (url.pathname.startsWith('/api/')) return json(404, { error: 'Endpoint não encontrado' });
      const path = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
      if (!pages.has(path) && !/^(css|js|img|fonts)\/[\w.-]+$/.test(path)) return json(404, { error: 'Arquivo não encontrado' });
      const content = await readFile(resolve(root, path));
      res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (error instanceof HttpError) return json(error.status, { error: error.message });
      if (error.code === 'ENOENT') return json(404, { error: 'Arquivo não encontrado' });
      if (error instanceof URIError) return json(400, { error: 'URL inválida' });
      console.error(error);
      json(500, { error: 'Erro interno do servidor' });
    }
  });
}
