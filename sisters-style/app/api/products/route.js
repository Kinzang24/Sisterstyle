import { NextResponse } from "next/server";
import { query, run, queryOne } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const rows = await query("SELECT * FROM products ORDER BY id DESC");
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

  const { rows } = await run(
    "INSERT INTO products (name, tags, price, category, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    [name.trim(), tags || "", Math.round(price), category || "new", imageUrl || ""]
  );

  const product = await queryOne("SELECT * FROM products WHERE id = $1", [rows[0].id]);
  return NextResponse.json(
    {
      id: product.id, name: product.name, tags: product.tags,
      price: product.price, category: product.category, imageUrl: product.image_url,
    },
    { status: 201 }
  );
}
