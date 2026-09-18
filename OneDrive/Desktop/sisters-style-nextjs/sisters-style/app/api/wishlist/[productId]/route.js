import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const { productId } = await params;
  db.prepare("DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?").run(
    session.user.id,
    productId
  );

  return NextResponse.json({ ok: true });
}
