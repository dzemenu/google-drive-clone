import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const resetDatabase = async () => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("⏳ Dropping existing tables...");
    
    // Drop tables in correct order due to foreign key constraints
    await pool.query("DROP TABLE IF EXISTS files CASCADE");
    await pool.query("DROP TABLE IF EXISTS folders CASCADE");

    console.log("✅ Tables dropped successfully");
  } catch (err) {
    console.error("❌ Error dropping tables:", err);
    throw err;
  } finally {
    await pool.end();
  }
};

resetDatabase().catch((err) => {
  console.error("❌ Reset failed");
  console.error(err);
  process.exit(1);
}); 