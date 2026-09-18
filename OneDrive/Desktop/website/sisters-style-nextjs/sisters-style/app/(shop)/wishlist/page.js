"use client";

import TitleCard from "@/components/TitleCard";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/currency";

export default function WishlistPage() {
  const { wishlist, loading, addToCart, toggleWishlist } = useCart();

  return (
    <div>
      <TitleCard crumb="Wishlist" title="Wishlist" />

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : wishlist.length === 0 ? (
        <div className="py-16 text-center text-ink-soft">
          <div className="mb-2.5 text-4xl">♡</div>
          Nothing saved yet. Tap the heart on any piece.
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:max-w-xl">
          {wishlist.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-3.5">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">👕</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display m-0 mb-0.5 truncate text-[14.5px] font-semibold">{p.name}</h4>
                <div className="mb-1.5 text-[11.5px] text-ink-soft">{formatPrice(p.price)}</div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={async () => {
                      await addToCart(p.id, 1);
                      toggleWishlist(p.id);
                    }}
                    className="text-[11.5px] font-bold text-sage"
                  >
                    Move to cart
                  </button>
                  <button onClick={() => toggleWishlist(p.id)} className="text-[11.5px] font-bold text-clay-warm">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
