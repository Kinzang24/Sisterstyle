import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

function toApi(p) {
  return {
    id: p.id, name: p.name, tags: p.tags,
    price: p.price, category: p.category, imageUrl: p.image_url,
  };
}

export async function GET(req, { params }) {
  const { id } = await params;
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toApi(product));
}

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { id } = await params;
  const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, tags, price, category, imageUrl } = body;
  if (!name?.trim() || price == null || isNaN(price) || price < 0) {
    return NextResponse.json({ error: "Please provide a valid name and price" }, { status: 400 });
  }

  db.prepare(
    "UPDATE products SET name=?, tags=?, price=?, category=?, image_url=? WHERE id=?"
  ).run(name.trim(), tags || "", Math.round(price), category || "new", imageUrl || "", id);

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  return NextResponse.json(toApi(product));
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { id } = await params;
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
