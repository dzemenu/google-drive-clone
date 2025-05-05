import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as schema from "./schema";
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const runMigrate = async () => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Ensure we're connected
    const client = await pool.connect();
    
    // Create the schema if it doesn't exist
    await client.query('CREATE SCHEMA IF NOT EXISTS "public";');
    console.log('Ensured schema "public" exists');

    // Get the latest migration file
    const migrationsDir = path.join(process.cwd(), 'drizzle', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      throw new Error('No migration files found');
    }

    const latestMigration = migrationFiles[migrationFiles.length - 1];
    const migrationPath = path.join(migrationsDir, latestMigration);
    console.log(`Using migration file: ${latestMigration}`);

    // Read and execute the migration SQL directly
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split on statement-breakpoint and execute each statement
    const statements = migrationSQL.split('--> statement-breakpoint');
    
    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement);
        console.log('Executed SQL:', statement.trim().slice(0, 50) + '...');
      }
    }

    // Verify tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Existing tables:", tables.rows.map(r => r.table_name));

    client.release();
    console.log("✅ Migration completed successfully");
  } catch (err) {
    console.error("❌ Migration failed");
    console.error(err);
    throw err;
  } finally {
    await pool.end();
  }
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
}); 