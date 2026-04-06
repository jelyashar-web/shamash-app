import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import { config } from 'dotenv';

config();

async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
