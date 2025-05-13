import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (db) return db;

  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  try {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test the connection
    await pool.query('SELECT NOW()');
    console.log("Database connection successful");

    db = drizzle(pool, { schema });
    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

// Export the drizzle instance
export { db };
