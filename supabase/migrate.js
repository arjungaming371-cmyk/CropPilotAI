/**
 * Supabase Database Migration Runner
 * Executes /supabase/migrations/001_initial_schema.sql directly to Supabase.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server/.env if available
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const migrationFile = path.resolve(__dirname, 'migrations/001_initial_schema.sql');

async function runMigration() {
  console.log('🌱 Starting CropPilotAI database migration...');

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!dbUrl) {
    console.log(`
ℹ️ No direct DATABASE_URL provided.
To execute migrations automatically:
1. Add DATABASE_URL to server/.env:
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
2. Or run Option B from the guide:
   Copy the contents of /supabase/migrations/001_initial_schema.sql
   and paste directly into Supabase Dashboard -> SQL Editor -> Run.
    `);
    process.exit(0);
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(' Connected to Supabase PostgreSQL database.');

    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log(' Applying 001_initial_schema.sql...');
    await client.query(sql);

    console.log(' Migration applied successfully! All tables, policies, and triggers are ready.');
  } catch (error) {
    console.error(' Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
