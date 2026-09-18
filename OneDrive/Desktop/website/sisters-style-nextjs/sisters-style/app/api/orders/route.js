import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);
  const wantsAll = searchParams.get("all") === "1";

  let orders;
  if (wantsAll && session.user.role === "admin") {
    orders = db
      .prepare(
        `SELECT o.*, u.name as buyerName, u.email as buyerEmail
         FROM orders o LEFT JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC`
      )
      .all();
  } else {
    orders = db
      .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
      .all(session.user.id);
  }

  const itemsStmt = db.prepare("SELECT name, price, qty FROM order_items WHERE order_id = ?");
  const withItems = orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));

  return NextResponse.json(withItems);
}
