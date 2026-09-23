import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";
import { auth } from "@/auth";

function toApi(p) {
  return {
    id: p.id,
    name: p.name,
    tags: p.tags,
    price: p.price,
    category: p.category,
    imageUrl: p.image_url,
  };
}

export async function GET() {
  const rows = await query("SELECT * FROM products ORDER BY id DESC");
  return NextResponse.json(rows.map(toApi));
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
    "INSERT INTO products (name, tags, price, category, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [name.trim(), tags || "", Math.round(price), category || "new", imageUrl || ""]
  );

  return NextResponse.json(toApi(rows[0]), { status: 201 });
}
