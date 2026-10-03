import { NextResponse } from "next/server";
import { run } from "@/lib/db";
import { getStripe } from "@/lib/payments";

// Stripe needs the raw request body to verify the webhook signature.
export async function POST(req) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await run("UPDATE orders SET status = 'processing', payment_ref = $1 WHERE id = $2", [
        session.id,
        orderId,
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
