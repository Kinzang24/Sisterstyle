import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { query, run } from "@/lib/db";

async function getWishlist(userId) {
  return query(
    `SELECT p.id, p.name, p.tags, p.price, p.category, p.image_url as "imageUrl"
     FROM wishlist_items wi JOIN products p ON p.id = wi.product_id
     WHERE wi.user_id = $1
     ORDER BY wi.id DESC`,
    [userId]
  );
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([]);
  return NextResponse.json(await getWishlist(session.user.id));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in to save items" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  await run(
    "INSERT INTO wishlist_items (user_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [session.user.id, productId]
  );

  return NextResponse.json(await getWishlist(session.user.id));
}
