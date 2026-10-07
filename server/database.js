import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS catalog (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('product', 'promotion')),
      name TEXT NOT NULL,
      price_cents INTEGER CHECK (price_cents >= 0),
      old_price_cents INTEGER CHECK (old_price_cents >= 0),
      image TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY);
  `);
  if (!db.prepare('SELECT version FROM migrations WHERE version = 1').get()) {
    const seed = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'));
    const insert = db.prepare('INSERT INTO catalog VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    db.exec('BEGIN');
    try {
      for (const [key, kind] of [['products', 'product'], ['promotions', 'promotion']]) {
        seed[key].forEach((item, position) => insert.run(
          item.id, kind, item.name,
          item.price == null ? null : Math.round(item.price * 100),
          item.oldPrice == null ? null : Math.round(item.oldPrice * 100),
          item.image, item.type, item.category ?? null, position
        ));
      }
      db.exec('INSERT INTO migrations VALUES (1); COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      db.close();
      throw error;
    }
  }
  return db;
}

export function serializeItem(row) {
  const item = { id: row.id, name: row.name, image: row.image, type: row.type };
  if (row.category != null) item.category = row.category;
  if (row.price_cents != null) item.price = row.price_cents / 100;
  if (row.old_price_cents != null) item.oldPrice = row.old_price_cents / 100;
  return item;
}
