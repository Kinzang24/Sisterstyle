"use client";

import Link from "next/link";
import TitleCard from "@/components/TitleCard";
import { useCart } from "@/components/CartContext";
import { formatPrice, SHIPPING_FEE } from "@/lib/currency";

export default function CartPage() {
  const { cart, loading, setQty, removeFromCart } = useCart();

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = cart.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  return (
    <div>
      <TitleCard crumb="Cart" title="Your Cart" />

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : cart.length === 0 ? (
        <div className="py-16 text-center text-ink-soft">
          <div className="mb-2.5 text-4xl">🛍</div>
          Your cart is empty.
          <br />
          <Link href="/" className="font-bold text-clay-warm">
            Go find something beautiful →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-3.5"
              >
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">👕</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display m-0 mb-0.5 truncate text-[14.5px] font-semibold">
                    {item.name}
                  </h4>
                  <div className="mb-1.5 text-[11.5px] text-ink-soft">
                    {formatPrice(item.price)} each
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full bg-cream px-2 py-1">
                      <button
                        onClick={() => setQty(item.productId, item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-xs font-extrabold text-clay-deep shadow"
                      >
                        −
                      </button>
                      <span className="min-w-[16px] text-center text-[13px] font-bold">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.productId, item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-clay-warm text-xs font-extrabold text-white shadow"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-[11.5px] font-bold text-clay-warm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-line bg-paper p-5">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row label="Shipping" value={formatPrice(shipping)} />
            <div className="my-3 flex items-center justify-between text-base font-extrabold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep py-3.5 text-center font-extrabold text-white shadow-[0_10px_30px_-12px_rgba(156,52,56,0.18)]"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="mb-1.5 flex justify-between text-[13.5px] text-ink-soft">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
