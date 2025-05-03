import "dotenv/config"; // Ensure .env is loaded outside Next.js
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const adminDbUrl = process.env.POSTGRES_URL;
const dbName = process.env.POSTGRES_DB;

if (!adminDbUrl || !dbName) {
  throw new Error(
    "Missing POSTGRES_URL or POSTGRES_DB in environment variables"
  );
}

console.log("🔌 Admin DB URL:", adminDbUrl);
console.log("📁 Admin DB Name:", dbName);

let db: NodePgDatabase<typeof schema> & { $client: Pool; };

async function ensureDatabaseExists() {
  const adminPool = new Pool({ connectionString: adminDbUrl , ssl: {
    rejectUnauthorized: false, // <== Required for Supabase's self-signed SSL cert
  },});

  try {
    const client = await adminPool.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`🛠️ Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created.`);
    } else {
      console.log(`✅ Database "${dbName}" already exists.`);
    }

    client.release();
  } catch (err) {
    console.error("❌ Error checking/creating database:", err);
    throw err;
  } finally {
    await adminPool.end();
  }
}

async function connectToDatabase() {
  await ensureDatabaseExists();

  const appDbUrl = adminDbUrl?.replace(/\/[^/]+$/, `/${dbName}`);
  const appPool = new Pool({ connectionString: appDbUrl });

  db = drizzle(appPool, { schema });
  console.log("✅ Connected to application database via Drizzle.");
}

connectToDatabase().catch((err) => {
  console.error("❌ Failed to initialize DB:", err);
  process.exit(1);
});

export { db };
