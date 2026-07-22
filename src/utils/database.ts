import fs from 'node:fs';
import path from 'node:path';
import type { Database } from '../types';

const dataFile = process.env.DATA_FILE || 'data/db.json';
const databasePath = path.resolve(process.cwd(), dataFile);

export function readDatabase(): Database {
  try {
    const content = fs.readFileSync(databasePath, 'utf-8');
    return JSON.parse(content) as Database;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { users: [], tickets: [], comments: [] };
    }
    throw error;
  }
}

export function writeDatabase(database: Database): void {
  const dir = path.dirname(databasePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
}