import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'src', 'database', 'alquran.db');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

db.close();
