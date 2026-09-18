"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useCart } from "@/components/CartContext";

const MENU = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/", label: "Product", icon: "👕" },
  { href: "/account/profile", label: "My Profile", icon: "👤" },
  { href: "/cart", label: "My Cart", icon: "🛍" },
  { href: "/account/orders", label: "Already Paid", icon: "🧾" },
  { href: "/account/delivery", label: "On Delivery", icon: "🚚" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);

  const NavLink = ({ href, label, icon, onClick }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => {
          setOpen(false);
          onClick?.();
        }}
        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
          active
            ? "bg-white text-clay-deep shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)]"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="w-[18px] text-center">{icon}</span>
        {label}
      </Link>
    );
  };

  const body = (
    <aside className="flex h-full w-[230px] flex-shrink-0 flex-col overflow-y-auto bg-gradient-to-br from-clay-deep to-clay-warm px-5 pt-7 pb-8 text-white">
      <div className="mb-5 text-xs font-semibold tracking-wide opacity-85">
        {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
      </div>

      <div className="mb-7 rounded-2xl bg-white p-3 shadow-lg">
        <Image src="/logo.png" alt="Sister'Style" width={280} height={190} className="h-auto w-full" priority />
      </div>

      <div className="mb-1.5 px-1 text-[10.5px] font-bold uppercase tracking-widest opacity-55">Menu</div>
      <nav className="mb-6 flex flex-col gap-0.5">
        {MENU.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </nav>

      <div className="mb-1.5 px-1 text-[10.5px] font-bold uppercase tracking-widest opacity-55">Preferences</div>
      <nav className="flex flex-col gap-0.5">
        {session?.user?.role === "admin" && <NavLink href="/admin" label="Admin Panel" icon="🛠" />}
        <NavLink href="/account/settings" label="Settings" icon="⚙" />
        {session ? (
          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <span className="w-[18px] text-center">⏻</span> Log Out
          </button>
        ) : (
          <NavLink href="/login" label="Log In" icon="⏻" />
        )}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-lg shadow md:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block">{body}</div>

      {/* Mobile off-canvas sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {body}
      </div>
    </>
  );
}
