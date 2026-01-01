import { Pool, PoolClient } from "pg";

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "adexchange",
  user: process.env.DB_USER || process.env.USER,
  password: process.env.DB_PASSWORD || "",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("Executed query", {
    text: text.substring(0, 50),
    duration,
    rows: result.rowCount,
  });
  return result.rows;
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export { pool };
