import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { query, run } from "@/lib/db";

async function getCart(userId) {
  return query(
    `SELECT ci.product_id as "productId", ci.qty, p.name, p.price, p.image_url as "imageUrl", p.tags, p.category
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1
     ORDER BY ci.id ASC`,
    [userId]
  );
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([]);
  return NextResponse.json(await getCart(session.user.id));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in to add items to your cart" }, { status: 401 });

  const { productId, qty } = await req.json();
  if (!productId || qty == null) {
    return NextResponse.json({ error: "Missing productId or qty" }, { status: 400 });
  }

  if (qty <= 0) {
    await run("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2", [session.user.id, productId]);
  } else {
    await run(
      `INSERT INTO cart_items (user_id, product_id, qty) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET qty = EXCLUDED.qty`,
      [session.user.id, productId, Math.round(qty)]
    );
  }

  return NextResponse.json(await getCart(session.user.id));
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  await run("DELETE FROM cart_items WHERE user_id = $1", [session.user.id]);
  return NextResponse.json([]);
}
