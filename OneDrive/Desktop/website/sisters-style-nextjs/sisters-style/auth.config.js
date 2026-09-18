// Edge-safe Auth.js config — deliberately has NO providers and NO database
// import, so it's safe to use inside middleware (which runs on the Edge
// runtime and can't load native Node addons like better-sqlite3). The full
// config with the Credentials provider lives in auth.js and is only ever
// used from route handlers, which run in the Node.js runtime.
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
