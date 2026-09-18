"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useUser } from "@/components/UserContext";

export default function AccountChip() {
  const { data: session } = useSession();
  const { user } = useUser();

  if (!session) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-full border border-line bg-paper py-1.5 pl-1.5 pr-4 text-sm font-bold text-clay-deep shadow-sm"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-clay-warm to-clay-deep text-sm font-bold text-white">
          ?
        </span>
        Guest
      </Link>
    );
  }

  const initial = session.user.name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const firstName = session.user.name?.split(" ")[0] || "Account";

  return (
    <Link
      href="/account/profile"
      className="flex items-center gap-2 rounded-full border border-line bg-paper py-1.5 pl-1.5 pr-4 text-sm font-bold text-ink shadow-sm"
    >
      {user?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-clay-warm to-clay-deep font-display text-sm font-bold text-white">
          {initial}
        </span>
      )}
      <span className="max-w-[110px] truncate">{firstName}</span>
    </Link>
  );
}
