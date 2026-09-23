import { NextResponse } from "next/server";
import { queryOne, run } from "@/lib/db";
import { auth } from "@/auth";

function toApi(p) {
  return {
    id: p.id, name: p.name, tags: p.tags,
    price: p.price, category: p.category, imageUrl: p.image_url,
  };
}

export async function GET(req, { params }) {
  const { id } = await params;
  const product = await queryOne("SELECT * FROM products WHERE id = $1", [id]);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toApi(product));
}

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { id } = await params;
  const existing = await queryOne("SELECT id FROM products WHERE id = $1", [id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, tags, price, category, imageUrl } = body;
  if (!name?.trim() || price == null || isNaN(price) || price < 0) {
    return NextResponse.json({ error: "Please provide a valid name and price" }, { status: 400 });
  }

  const { rows } = await run(
    "UPDATE products SET name=$1, tags=$2, price=$3, category=$4, image_url=$5 WHERE id=$6 RETURNING *",
    [name.trim(), tags || "", Math.round(price), category || "new", imageUrl || "", id]
  );

  return NextResponse.json(toApi(rows[0]));
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { id } = await params;
  await run("DELETE FROM products WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
