"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import AccountChip from "@/components/AccountChip";
import { useCart } from "@/components/CartContext";

function IconBadge({ href, icon, count, solid }) {
  return (
    <Link
      href={href}
      className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border text-lg shadow-sm transition hover:-translate-y-0.5 ${
        solid
          ? "border-transparent bg-clay-warm text-white"
          : "border-line bg-paper text-clay-warm"
      }`}
    >
      {icon}
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-cream bg-gold px-1 text-[10px] font-extrabold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function ShopLayout({ children }) {
  const { cartCount, wishlistCount } = useCart();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="min-w-0 flex-1 px-5 pb-14 pt-20 md:px-9 md:pt-7">
        <div className="mb-5 flex items-center justify-end gap-3">
          <IconBadge href="/wishlist" icon="♥" count={wishlistCount} />
          <IconBadge href="/cart" icon="🛒" count={cartCount} solid />
          <AccountChip />
        </div>
        {children}
      </main>
    </div>
  );
}
