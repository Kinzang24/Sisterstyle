import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { run } from "@/lib/db";

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const { productId } = await params;
  await run("DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2", [
    session.user.id,
    productId,
  ]);

  return NextResponse.json({ ok: true });
}
