import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { config } from 'dotenv';
import * as schema from './schema';

config();

const sqlite = new Database('./data/shamash.db');

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite, { schema });

export { schema };
export * from './schema';
