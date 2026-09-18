"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/account");
    setUser(res.ok ? await res.json() : null);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateUser(patch) {
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) setUser(data);
    return { ok: res.ok, data };
  }

  return (
    <UserContext.Provider value={{ user, loading, refresh, updateUser }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
