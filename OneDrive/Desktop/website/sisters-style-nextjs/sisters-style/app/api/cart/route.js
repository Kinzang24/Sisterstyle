import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

function getCart(userId) {
  return db
    .prepare(
      `SELECT ci.product_id as productId, ci.qty, p.name, p.price, p.image_url as imageUrl, p.tags, p.category
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.id ASC`
    )
    .all(userId);
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([]);
  return NextResponse.json(getCart(session.user.id));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in to add items to your cart" }, { status: 401 });

  const { productId, qty } = await req.json();
  if (!productId || qty == null) {
    return NextResponse.json({ error: "Missing productId or qty" }, { status: 400 });
  }

  if (qty <= 0) {
    db.prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?").run(session.user.id, productId);
  } else {
    db.prepare(
      `INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET qty = excluded.qty`
    ).run(session.user.id, productId, Math.round(qty));
  }

  return NextResponse.json(getCart(session.user.id));
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(session.user.id);
  return NextResponse.json([]);
}
