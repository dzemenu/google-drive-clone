import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("POSTGRES_URL is not defined");
}

// Parse connection string to get individual components
const url = new URL(connectionString);
const [username, password] = (url.username && url.password) 
  ? [url.username, url.password] 
  : [undefined, undefined];
const database = url.pathname.slice(1); // Remove leading slash

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: url.hostname,
    port: parseInt(url.port || "5432"),
    user: username,
    password: password,
    database: database,
    ssl: {
      rejectUnauthorized: false
    }
  },
} satisfies Config; 