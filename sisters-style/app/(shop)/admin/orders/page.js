"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TitleCard from "@/components/TitleCard";
import OrderCard from "@/components/OrderCard";

const STATUSES = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "processing", label: "Processing" },
  { value: "on_delivery", label: "On Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/orders?all=1")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d);
        setLoading(false);
      });
  }
  useEffect(load, []);

  async function updateStatus(id, status) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <TitleCard crumb="Admin" title="Admin Panel" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Manage Orders</h2>
          <p className="text-[12.5px] text-ink-soft">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>
        <Link href="/" className="rounded-full border border-line bg-paper px-4 py-2.5 text-sm font-bold text-ink-soft">
          ← Back to Shop
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <Link href="/admin">
          <TabButton active={false}>Products</TabButton>
        </Link>
        <TabButton active>Orders</TabButton>
      </div>

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-ink-soft">
          <div className="mb-2.5 text-4xl">📦</div>
          No orders yet.
        </div>
      ) : (
        <div className="max-w-xl">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              adminControls={
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="rounded-lg border border-line bg-cream px-2.5 py-1.5 text-[12px] outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, children }) {
  return (
    <span
      className={`inline-block rounded-full border px-4 py-2 text-[12.5px] font-bold ${
        active ? "border-transparent bg-ink text-white" : "border-line bg-paper text-ink-soft"
      }`}
    >
      {children}
    </span>
  );
}
