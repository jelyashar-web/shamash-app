import Database from 'better-sqlite3';
import { config } from 'dotenv';

config();

const db = new Database('./data/shamash.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'gabbai' CHECK(role IN ('admin', 'gabbai')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'yisrael' CHECK(role IN ('kohen', 'levi', 'yisrael')),
    yahrzeit_date TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS aliyot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date INTEGER NOT NULL,
    type TEXT NOT NULL,
    parasha TEXT,
    assigned INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    description TEXT,
    paid INTEGER NOT NULL DEFAULT 0,
    date INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date INTEGER NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'general' CHECK(type IN ('service', 'holiday', 'meeting', 'general')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
  CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
  CREATE INDEX IF NOT EXISTS idx_aliyot_member ON aliyot(member_id);
  CREATE INDEX IF NOT EXISTS idx_aliyot_date ON aliyot(date);
  CREATE INDEX IF NOT EXISTS idx_donations_member ON donations(member_id);
  CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date);
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
`);

console.log('Database tables created successfully!');
db.close();
