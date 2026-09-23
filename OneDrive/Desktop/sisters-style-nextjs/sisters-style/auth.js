import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { authConfig } from "./auth.config";

// Full config, including the database-backed Credentials provider. This
// file must only be imported from route handlers / server actions (Node.js
// runtime) — never from middleware.js. See auth.config.js for the
// Edge-safe subset middleware actually uses.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await queryOne("SELECT * FROM users WHERE email = $1", [
          String(credentials.email).toLowerCase().trim(),
        ]);
        if (!user) return null;

        const valid = bcrypt.compareSync(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});