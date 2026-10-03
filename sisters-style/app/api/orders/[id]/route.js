import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryOne, query, run } from "@/lib/db";

const ALLOWED_STATUSES = ["pending_payment", "processing", "on_delivery", "delivered", "cancelled"];

export async function GET(req, { params }) {
  const session = await auth();
  const { id } = await params;
  const order = await queryOne("SELECT * FROM orders WHERE id = $1", [id]);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = session?.user?.id && Number(session.user.id) === order.user_id;
  const isAdmin = session?.user?.role === "admin";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  order.items = await query("SELECT name, price, qty FROM order_items WHERE order_id = $1", [id]);
  return NextResponse.json(order);
}

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await run("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
  const order = await queryOne("SELECT * FROM orders WHERE id = $1", [id]);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  order.items = await query("SELECT name, price, qty FROM order_items WHERE order_id = $1", [id]);
  return NextResponse.json(order);
}
