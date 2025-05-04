import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

// Create a pool for application operations
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize drizzle with the pool
const db = drizzle(pool, { schema });

// Function to connect to the database
async function connectToDatabase() {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to database via Drizzle");
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    throw err;
  }
}

// Initialize the database connection
let dbInitialized = false;

export async function getDb() {
  if (!dbInitialized) {
    await connectToDatabase();
    dbInitialized = true;
  }
  return db;
}

// Export the drizzle instance
export { db };
