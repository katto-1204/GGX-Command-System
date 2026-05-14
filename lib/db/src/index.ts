import { drizzle } from "drizzle-orm/node-postgres";
import pg, { type PoolConfig } from "pg";
import * as schema from "./schema";
import { loadRootEnv } from "./load-env";

const { Pool } = pg;

loadRootEnv();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = normalizeConnectionString(process.env.DATABASE_URL);

const poolConfig: PoolConfig = {
  connectionString,
};

if (requiresSsl(process.env.DATABASE_URL)) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });

export * from "./schema";

function requiresSsl(connectionString: string) {
  return (
    connectionString.includes("sslmode=require") ||
    connectionString.includes("supabase.co")
  );
}

function normalizeConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);

    if (url.searchParams.get("sslmode") === "require") {
      url.searchParams.delete("sslmode");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}
