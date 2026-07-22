import fs from 'fs/promises';
import path from 'path';
import type { Database } from '../types';

const dataFile = process.env.DATA_FILE || 'data/db.json';
const databasePath = path.resolve(process.cwd(), dataFile);

export async function readDatabase(): Promise<Database> {
  try {
    const content = await fs.readFile(databasePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return { users: [], tickets: [], comments: [] };
    }
    
    throw error;
  }
}

export async function writeDatabase(database: Database): Promise<void> {
  const dir = path.dirname(databasePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(databasePath, JSON.stringify(database, null, 2));
}