import { fileURLToPath } from 'node:url';
import { openDatabase } from './database.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT deve ser um número entre 1 e 65535.');
const origin = process.env.APP_ORIGIN ? new URL(process.env.APP_ORIGIN).origin : undefined;
if (origin && !/^https?:\/\//.test(origin)) throw new Error('APP_ORIGIN deve usar http ou https.');
const production = process.env.NODE_ENV === 'production';
if (production && (!origin || !origin.startsWith('https://'))) throw new Error('Em produção, configure APP_ORIGIN com a URL HTTPS pública.');
const db = openDatabase(process.env.DATABASE_PATH || fileURLToPath(new URL('../data/sgames.sqlite', import.meta.url)));
const app = createApp(db, { origin, secureCookies: production });
const host = process.env.HOST || '127.0.0.1';
app.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `A porta ${port} está ocupada. Feche o servidor anterior ou configure PORT.` : 'Não foi possível iniciar o servidor.');
  db.close();
  process.exit(1);
});
app.listen(port, host, () => console.log(`SGAMES v2.1: http://${host}:${port} — mantenha este terminal aberto.`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => app.close(() => { db.close(); process.exit(0); }));
}
