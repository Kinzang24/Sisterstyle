"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { status } = useSession();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setCart([]);
      setWishlist([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [cartRes, wishRes] = await Promise.all([fetch("/api/cart"), fetch("/api/wishlist")]);
      setCart(await cartRes.json());
      setWishlist(await wishRes.json());
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function setQty(productId, qty) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty }),
    });
    if (res.ok) setCart(await res.json());
    return res;
  }

  async function addToCart(productId, qty = 1) {
    const existing = cart.find((i) => i.productId === productId);
    return setQty(productId, (existing?.qty || 0) + qty);
  }

  async function removeFromCart(productId) {
    return setQty(productId, 0);
  }

  async function toggleWishlist(productId) {
    const already = wishlist.some((p) => p.id === productId);
    if (already) {
      await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      setWishlist((w) => w.filter((p) => p.id !== productId));
    } else {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) setWishlist(await res.json());
    }
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        wishlistCount: wishlist.length,
        loading,
        refresh,
        setQty,
        addToCart,
        removeFromCart,
        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
