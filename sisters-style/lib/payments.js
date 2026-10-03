// ---------------------------------------------------------------------------
// Payment provider abstraction.
//
// IMPORTANT — read this before going live:
// Stripe only lets businesses open merchant accounts in ~46 countries, and
// Bhutan is not currently one of them (as of this writing). So Stripe here
// works great for testing, or for a business legally registered in a
// supported country — but a Bhutan-based shop will likely need a local
// gateway instead (e.g. a Bank of Bhutan / BNB merchant gateway, or a
// mobile wallet such as myPay). I don't have reliable, current API details
// for those integrations memorized, so I haven't wired one in — check each
// provider's current developer docs when you're ready, and slot the
// implementation in here (createPaymentSession / verifyWebhook) so the rest
// of the app doesn't need to change.
//
// Until then, "Cash on Delivery" is enabled by default and needs no
// external account at all — it's a completely reasonable way to launch.
// ---------------------------------------------------------------------------

export const STRIPE_ENABLED = Boolean(process.env.STRIPE_SECRET_KEY);

let stripeClient = null;
export function getStripe() {
  if (!STRIPE_ENABLED) return null;
  if (!stripeClient) {
    const Stripe = require("stripe");
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// Stripe doesn't support BTN as a presentment currency for most accounts,
// so when Stripe is enabled we charge in USD using an approximate,
// admin-configurable rate — swap this for a live FX rate if it matters to you.
export const NU_PER_USD = Number(process.env.NU_PER_USD || 95);

export function nuToUsdCents(nuAmount) {
  return Math.round((nuAmount / NU_PER_USD) * 100);
}

/**
 * Creates a Stripe Checkout Session for an order already saved (as
 * pending_payment) in the database. Returns the session's hosted URL.
 */
export async function createStripeCheckoutSession({ order, items, baseUrl }) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");

  const line_items = items.map((i) => ({
    price_data: {
      currency: "usd",
      product_data: { name: i.name },
      unit_amount: nuToUsdCents(i.price),
    },
    quantity: i.qty,
  }));
  line_items.push({
    price_data: {
      currency: "usd",
      product_data: { name: "Shipping" },
      unit_amount: nuToUsdCents(order.shipping),
    },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${baseUrl}/checkout/success?order=${order.id}`,
    cancel_url: `${baseUrl}/checkout?order=${order.id}`,
    metadata: { orderId: order.id },
  });

  return session.url;
}
