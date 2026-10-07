import { fileURLToPath } from 'node:url';
import { openDatabase } from './database.js';
import { createApp } from './app.js';

const db = openDatabase(process.env.DATABASE_PATH || fileURLToPath(new URL('../data/sgames.sqlite', import.meta.url)));
const app = createApp(db);
const port = Number(process.env.PORT || 3000);
app.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`SGAMES iniciado na porta ${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => app.close(() => { db.close(); process.exit(0); }));
}
