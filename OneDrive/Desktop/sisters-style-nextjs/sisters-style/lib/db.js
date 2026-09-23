import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Vercel's Neon/Postgres integration can name the connection string a few
// different things depending on the custom prefix you chose when connecting
// the database (e.g. STORAGE_URL) — check all the common ones so this keeps
// working regardless.
const connectionString =
  process.env.STORAGE_URL ||
  process.env.STORAGE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  console.warn(
    "[db] No Postgres connection string found. Set STORAGE_URL (or DATABASE_URL) in your environment variables."
  );
}

// Reuse a single pool across hot-reloads in dev / across invocations on the
// same serverless instance.
const globalForDb = globalThis;
export const pool =
  globalForDb.__pgPool ||
  new Pool({
    connectionString,
    ssl: connectionString ? { rejectUnauthorized: false } : undefined,
  });
if (process.env.NODE_ENV !== "production") globalForDb.__pgPool = pool;

/** Run a query, get back all rows. */
export async function query(sql, params = []) {
  await ready;
  const res = await pool.query(sql, params);
  return res.rows;
}

/** Run a query, get back the first row (or undefined). */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0];
}

/** Run an INSERT/UPDATE/DELETE. Returns { rowCount, rows }. Add "RETURNING
 *  *" (or specific columns) to your SQL if you need the affected row back. */
export async function run(sql, params = []) {
  await ready;
  const res = await pool.query(sql, params);
  return { rowCount: res.rowCount, rows: res.rows };
}

/** Wrap several queries in one transaction using a dedicated client. */
export async function withTransaction(fn) {
  await ready;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      address_line TEXT DEFAULT '',
      address_city TEXT DEFAULT '',
      address_zip TEXT DEFAULT '',
      email_updates INTEGER NOT NULL DEFAULT 1,
      newsletter INTEGER NOT NULL DEFAULT 1,
      sms_alerts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      tags TEXT DEFAULT '',
      price INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'new',
      image_url TEXT DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      subtotal INTEGER NOT NULL,
      shipping INTEGER NOT NULL,
      total INTEGER NOT NULL,
      ship_name TEXT DEFAULT '',
      ship_address TEXT DEFAULT '',
      ship_city TEXT DEFAULT '',
      ship_zip TEXT DEFAULT '',
      ship_phone TEXT DEFAULT '',
      payment_provider TEXT DEFAULT '',
      payment_ref TEXT DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      qty INTEGER NOT NULL
    );
  `);
}

// One-time seed: an admin account + the original catalog, only if empty.
async function seed() {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM products");
  if (rows[0].n === 0) {
    const products = [
      ["Vivid Red Dress", "#Dress #Feminine #Girl", 3800, "trending", ""],
      ["Stylish Hoodie", "#Hoodie #Unisex", 2800, "trending", ""],
      ["Velora White Sneakers", "#Sneakers #Shoes #Stylish", 5100, "bestseller", ""],
      ["Kivora Slim Jeans", "#Jeans #Pants #Unisex", 4400, "new", ""],
      ["Beige Crewneck", "#Sweater #Unisex", 2200, "bestseller", ""],
      ["Cozy Silk Scarf", "#Scarf #Feminine #Girl", 1900, "new", ""],
      ["Terracotta Blazer", "#Blazer #Formal", 6500, "trending", ""],
      ["Linen Sun Hat", "#Accessory #Summer", 1750, "new", ""],
    ];
    for (const [name, tags, price, category, image_url] of products) {
      await pool.query(
        "INSERT INTO products (name, tags, price, category, image_url) VALUES ($1,$2,$3,$4,$5)",
        [name, tags, price, category, image_url]
      );
    }
  }

  const { rows: userRows } = await pool.query("SELECT COUNT(*)::int AS n FROM users");
  if (userRows[0].n === 0) {
    const passwordHash = bcrypt.hashSync("admin1234", 10);
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin')",
      ["Admin", "admin@sistersstyle.shop", passwordHash]
    );
  }
}

// Resolves once tables exist and starter data is seeded. Every exported
// query helper awaits this first, so callers don't need to think about it.
export const ready = (async () => {
  if (!connectionString) return; // don't crash at import time if unset
  await createSchema();
  await seed();
})().catch((err) => {
  console.error("[db] Failed to initialize database:", err);
});
