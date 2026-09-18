import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

function getWishlist(userId) {
  return db
    .prepare(
      `SELECT p.id, p.name, p.tags, p.price, p.category, p.image_url as imageUrl
       FROM wishlist_items wi JOIN products p ON p.id = wi.product_id
       WHERE wi.user_id = ?
       ORDER BY wi.id DESC`
    )
    .all(userId);
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([]);
  return NextResponse.json(getWishlist(session.user.id));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in to save items" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  db.prepare(
    "INSERT OR IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)"
  ).run(session.user.id, productId);

  return NextResponse.json(getWishlist(session.user.id));
}
