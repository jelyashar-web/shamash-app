import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  // @ts-ignore - older drizzle-kit version
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./data/shamash.db',
  },
  verbose: true,
  strict: true,
});
