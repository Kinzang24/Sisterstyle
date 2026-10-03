"use client";

import { useEffect, useState } from "react";
import TitleCard from "@/components/TitleCard";
import OrderCard from "@/components/OrderCard";

export default function DeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.filter((o) => o.status !== "delivered" && o.status !== "cancelled"));
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <TitleCard crumb="Delivery" title="On Delivery" subtitle="Orders currently in progress" />

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-ink-soft">
          <div className="mb-2.5 text-4xl">🚚</div>
          Nothing on the way right now.
        </div>
      ) : (
        <div className="max-w-xl">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
