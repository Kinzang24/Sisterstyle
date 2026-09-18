import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const rows = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
  const products = rows.map((p) => ({
    id: p.id,
    name: p.name,
    tags: p.tags,
    price: p.price,
    category: p.category,
    imageUrl: p.image_url,
  }));
  return NextResponse.json(products);
}

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { name, tags, price, category, imageUrl } = body;
  if (!name?.trim() || price == null || isNaN(price) || price < 0) {
    return NextResponse.json({ error: "Please provide a valid name and price" }, { status: 400 });
  }

  const info = db
    .prepare("INSERT INTO products (name, tags, price, category, image_url) VALUES (?, ?, ?, ?, ?)")
    .run(name.trim(), tags || "", Math.round(price), category || "new", imageUrl || "");

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(
    {
      id: product.id, name: product.name, tags: product.tags,
      price: product.price, category: product.category, imageUrl: product.image_url,
    },
    { status: 201 }
  );
}
