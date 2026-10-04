import { auth } from "@/auth";
import { redirect } from "next/navigation";

// For server actions: throws if caller isn't admin.
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");
  return session;
}

// For admin pages: sends non-admins to login.
export async function requireAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/login");
  return session;
}
