import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "sisters-style.db");

// Reuse a single connection across hot-reloads in dev.
const globalForDb = globalThis;
export const db = globalForDb.__db || new DatabaseSync(DB_PATH);
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// node:sqlite's DatabaseSync has no built-in `.transaction()` helper (unlike
// better-sqlite3), so this wraps a function in BEGIN/COMMIT/ROLLBACK.
export function transaction(fn) {
  return (...args) => {
    db.exec("BEGIN");
    try {
      const result = fn(...args);
      db.exec("COMMIT");
      return result;
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  };
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tags TEXT DEFAULT '',
    price INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'new',
    image_url TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  );

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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    qty INTEGER NOT NULL
  );
`);

// ---------------------------------------------------------------------------
// One-time seed: an admin account + the original catalog, only if empty.
// ---------------------------------------------------------------------------
function seed() {
  const productCount = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  if (productCount === 0) {
    const insert = db.prepare(`
      INSERT INTO products (name, tags, price, category, image_url)
      VALUES (@name, @tags, @price, @category, @image_url)
    `);
    const products = [
      { name: "Vivid Red Dress", tags: "#Dress #Feminine #Girl", price: 3800, category: "trending", image_url: "" },
      { name: "Stylish Hoodie", tags: "#Hoodie #Unisex", price: 2800, category: "trending", image_url: "" },
      { name: "Velora White Sneakers", tags: "#Sneakers #Shoes #Stylish", price: 5100, category: "bestseller", image_url: "" },
      { name: "Kivora Slim Jeans", tags: "#Jeans #Pants #Unisex", price: 4400, category: "new", image_url: "" },
      { name: "Beige Crewneck", tags: "#Sweater #Unisex", price: 2200, category: "bestseller", image_url: "" },
      { name: "Cozy Silk Scarf", tags: "#Scarf #Feminine #Girl", price: 1900, category: "new", image_url: "" },
      { name: "Terracotta Blazer", tags: "#Blazer #Formal", price: 6500, category: "trending", image_url: "" },
      { name: "Linen Sun Hat", tags: "#Accessory #Summer", price: 1750, category: "new", image_url: "" },
    ];
    const insertMany = transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(products);
  }

  const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  if (userCount === 0) {
    const passwordHash = bcrypt.hashSync("admin1234", 10);
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, 'admin')
    `).run("Admin", "admin@sistersstyle.shop", passwordHash);
  }
}
seed();

export default db;
