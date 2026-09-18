"use client";

import Link from "next/link";
import TitleCard from "@/components/TitleCard";
import { useUser } from "@/components/UserContext";
import { useCart } from "@/components/CartContext";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const { cart, wishlist } = useCart();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrderCount(d.length));
  }, []);

  if (loading || !user) return <p className="text-ink-soft">Loading…</p>;

  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const cartQty = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div>
      <TitleCard crumb="Profile" title="My Profile" />

      <div className="mb-4 rounded-2xl border border-line bg-paper p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="font-display flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-clay-warm to-clay-deep text-2xl font-bold text-white">
              {initial}
            </div>
          )}
          <div>
            <h2 className="font-display text-xl font-semibold">{user.name}</h2>
            <div className="text-[12.5px] text-ink-soft">
              {user.email} · member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Stat num={orderCount} label="Orders" />
          <Stat num={wishlist.length} label="Wishlist" />
          <Stat num={cartQty} label="In Cart" />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-paper p-6">
        <p className="mb-3 text-[13.5px] text-ink-soft">
          Manage your photo, contact details, address, notifications, and password from{" "}
          <Link href="/account/settings" className="font-bold text-clay-warm">
            Settings
          </Link>
          .
        </p>
        <Link
          href="/account/settings"
          className="inline-block rounded-full bg-gradient-to-br from-clay-warm to-clay-deep px-5 py-2.5 text-sm font-bold text-white"
        >
          Go to Settings
        </Link>
      </div>
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div className="min-w-[86px] rounded-xl bg-cream px-4 py-2.5 text-center">
      <span className="font-display block text-lg font-bold text-clay-deep">{num}</span>
      <span className="text-[10.5px] uppercase tracking-wide text-ink-soft">{label}</span>
    </div>
  );
}
