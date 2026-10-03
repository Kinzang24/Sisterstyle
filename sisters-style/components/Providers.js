"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/CartContext";
import { UserProvider } from "@/components/UserContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <UserProvider>
        <CartProvider>{children}</CartProvider>
      </UserProvider>
    </SessionProvider>
  );
}
