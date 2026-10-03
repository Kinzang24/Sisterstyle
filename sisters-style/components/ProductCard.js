"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/currency";

const GRADIENTS = [
  ["#f6c9c4", "#eb8f86"],
  ["#f7d9e8", "#eb9fc0"],
  ["#eef0f2", "#cfd6db"],
  ["#cfe0f0", "#7fa3c9"],
  ["#ece3d6", "#cbb99e"],
  ["#f1c9c4", "#c0433a"],
  ["#eccdb9", "#c97a52"],
  ["#f4ecd8", "#d8c48c"],
];

export default function ProductCard({ product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { cart, wishlist, addToCart, toggleWishlist } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const grad = GRADIENTS[product.id % GRADIENTS.length];
  const inWishlist = wishlist.some((p) => p.id === product.id);
  const cartQty = cart.find((i) => i.productId === product.id)?.qty || 0;

  function requireLogin() {
    router.push(`/login?callbackUrl=${encodeURIComponent("/")}`);
  }

  async function handleAdd() {
    if (!session) return requireLogin();
    setBusy(true);
    await addToCart(product.id, qty);
    setQty(1);
    setBusy(false);
  }

  async function handleWish() {
    if (!session) return requireLogin();
    toggleWishlist(product.id);
  }

  return (
    <div className="relative rounded-[20px] border border-line bg-paper p-3.5 pb-4 transition hover:-translate-y-1 hover:shadow-[0_10px_30px_-12px_rgba(156,52,56,0.18)]">
      <button
        onClick={handleWish}
        className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
          inWishlist ? "bg-clay-warm text-white" : "bg-white/85 text-ink-faint"
        }`}
        aria-label="Toggle wishlist"
      >
        ♥
      </button>

      <div
        className="mb-3 flex aspect-[1/0.82] items-center justify-center overflow-hidden rounded-[14px] border-[1.5px] border-dashed border-white/55"
        style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl opacity-80">👕</span>
        )}
      </div>

      <h3 className="font-display m-0 mb-0.5 text-[15.5px] font-semibold">{product.name}</h3>
      <div className="mb-2.5 text-[11px] font-bold text-gold">{product.tags}</div>

      <div className="flex items-center justify-between gap-2">
        <div className="rounded-full bg-[#fdeeec] px-3 py-1.5 text-[13px] font-extrabold text-clay-deep">
          {formatPrice(product.price)}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-cream px-2 py-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-paper text-xs font-extrabold text-clay-deep shadow"
          >
            −
          </button>
          <span className="min-w-[12px] text-center text-[12.5px] font-bold">{qty}</span>
          <button
            onClick={handleAdd}
            disabled={busy}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-clay-warm text-xs font-extrabold text-white shadow disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
      {cartQty > 0 && (
        <div className="mt-2 text-[11px] font-semibold text-sage">{cartQty} in your cart</div>
      )}
    </div>
  );
}
