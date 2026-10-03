import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { query } from "@/lib/db";

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);
  const wantsAll = searchParams.get("all") === "1";

  let orders;
  if (wantsAll && session.user.role === "admin") {
    orders = await query(
      `SELECT o.*, u.name as "buyerName", u.email as "buyerEmail"
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
  } else {
    orders = await query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [
      session.user.id,
    ]);
  }

  const withItems = await Promise.all(
    orders.map(async (o) => ({
      ...o,
      items: await query("SELECT name, price, qty FROM order_items WHERE order_id = $1", [o.id]),
    }))
  );

  return NextResponse.json(withItems);
}
