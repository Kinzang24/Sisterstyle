import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db, { transaction } from "@/lib/db";
import { SHIPPING_FEE } from "@/lib/currency";
import { STRIPE_ENABLED, createStripeCheckoutSession } from "@/lib/payments";

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in to check out" }, { status: 401 });

  const { shipTo, method } = await req.json();
  if (!shipTo?.name?.trim() || !shipTo?.address?.trim()) {
    return NextResponse.json({ error: "Please fill in your shipping name and address" }, { status: 400 });
  }
  if (!["cod", "stripe"].includes(method)) {
    return NextResponse.json({ error: "Please choose a payment method" }, { status: 400 });
  }
  if (method === "stripe" && !STRIPE_ENABLED) {
    return NextResponse.json(
      { error: "Card payment isn't set up yet on this store — please choose Cash on Delivery." },
      { status: 400 }
    );
  }

  const cartRows = db
    .prepare(
      `SELECT ci.product_id as productId, ci.qty, p.name, p.price
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`
    )
    .all(session.user.id);

  if (cartRows.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  const subtotal = cartRows.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = SHIPPING_FEE;
  const total = subtotal + shipping;
  const orderId = "SS-" + Math.floor(100000 + Math.random() * 899999);
  const status = method === "stripe" ? "pending_payment" : "processing";

  const insertOrder = db.prepare(`
    INSERT INTO orders
      (id, user_id, status, subtotal, shipping, total, ship_name, ship_address, ship_city, ship_zip, ship_phone, payment_provider)
    VALUES
      (@id, @user_id, @status, @subtotal, @shipping, @total, @ship_name, @ship_address, @ship_city, @ship_zip, @ship_phone, @payment_provider)
  `);
  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)"
  );

  const run = transaction(() => {
    insertOrder.run({
      id: orderId,
      user_id: session.user.id,
      status,
      subtotal,
      shipping,
      total,
      ship_name: shipTo.name,
      ship_address: shipTo.address,
      ship_city: shipTo.city || "",
      ship_zip: shipTo.zip || "",
      ship_phone: shipTo.phone || "",
      payment_provider: method,
    });
    cartRows.forEach((i) => insertItem.run(orderId, i.productId, i.name, i.price, i.qty));
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(session.user.id);
  });
  run();

  if (method === "stripe") {
    const baseUrl = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    try {
      const url = await createStripeCheckoutSession({
        order: { id: orderId, shipping },
        items: cartRows,
        baseUrl,
      });
      return NextResponse.json({ orderId, redirectUrl: url });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ orderId, redirectUrl: `/checkout/success?order=${orderId}` });
}
