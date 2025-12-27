import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'src', 'database', 'alquran.db');
const db = new Database(dbPath);

const tables = ['surah', 'ayah', 'doa', 'hadits', 'asmaul_husna', 'dzikir'];

for (const table of tables) {
  const count = db.prepare(`SELECT count(*) as total FROM ${table}`).get().total;
  const sample = db.prepare(`SELECT * FROM ${table} LIMIT 1`).get();
  console.log(`Table: ${table} (Total: ${count})`);
  console.log('Sample:', JSON.stringify(sample, null, 2));
  console.log('---');
}

db.close();
