import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Helper to find the database file
const getDbPath = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // 1. Vercel Standard Path (Files included via includeFiles are usually at /var/task/src/database/alquran.db)
    const path1 = '/var/task/src/database/alquran.db';
    if (fs.existsSync(path1)) return path1;

    // 2. Relative to process.cwd() (Local and some Vercel environments)
    const path2 = join(process.cwd(), 'src', 'database', 'alquran.db');
    if (fs.existsSync(path2)) return path2;

    // 3. Relative to bundled file location
    const path3 = join(__dirname, '..', 'src', 'database', 'alquran.db');
    if (fs.existsSync(path3)) return path3;

    // 4. Root fallback
    const path4 = join(process.cwd(), 'alquran.db');
    if (fs.existsSync(path4)) return path4;

    return path2; // Default to standard local path
  } catch (e) {
    console.error('Error finding database path:', e);
    return join(process.cwd(), 'src', 'database', 'alquran.db');
  }
};

let db;
try {
  const dbFile = getDbPath();
  console.log(`Initializing database at: ${dbFile}`);
  
  db = new Database(dbFile, { 
    readonly: true, // Paksa readonly di semua lingkungan untuk keamanan
    fileMustExist: false,
    timeout: 5000 
  });
  
  console.log('Database connection established successfully');
  
  // Optimization for better-sqlite3 - NEVER use WAL in production/Vercel
  if (!isProduction) {
    try {
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
    } catch (e) {
      console.warn('Could not set PRAGMA:', e);
    }
  }
} catch (error) {
  console.error('FAILED TO INITIALIZE DATABASE:', error);
  // Create a mock db object that throws on queries to prevent app crash on startup
  db = {
    prepare: () => ({
      all: () => { throw new Error('Database not initialized: ' + error.message) },
      get: () => { throw new Error('Database not initialized: ' + error.message) }
    }),
    pragma: () => {}
  };
}

/**
 * Helper to run a query that returns multiple rows
 */
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const rows = stmt.all(params);
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Helper to run a query that returns a single row
 */
export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const row = stmt.get(params);
      resolve(row);
    } catch (err) {
      reject(err);
    }
  });
};

export default db;
