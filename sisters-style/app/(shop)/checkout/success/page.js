"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TitleCard from "@/components/TitleCard";
import { formatPrice } from "@/lib/currency";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder);
  }, [orderId]);

  return (
    <div>
      <TitleCard crumb="Checkout" title="Order Placed" />
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-paper p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf3ec] text-3xl text-sage">
          ✓
        </div>
        <h2 className="font-display mb-1 text-xl font-semibold">Thank you!</h2>
        <p className="mb-4 text-sm text-ink-soft">Your order is being prepared.</p>
        <div className="font-display mb-4 text-lg font-bold text-clay-deep">{orderId}</div>
        {order && (
          <div className="mb-4 rounded-xl bg-cream p-3 text-sm text-ink-soft">
            Total: <strong>{formatPrice(order.total)}</strong> · Status:{" "}
            <strong className="capitalize">{order.status.replace("_", " ")}</strong>
          </div>
        )}
        <p className="mb-5 text-[11.5px] text-ink-soft">
          Track it any time under <strong>Already Paid</strong> or <strong>On Delivery</strong>.
        </p>
        <Link
          href="/"
          className="inline-block w-full rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep py-3.5 font-extrabold text-white"
        >
          Back to Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
