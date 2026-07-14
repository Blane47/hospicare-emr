import type { NextAuthConfig } from "next-auth";

// Edge-safe auth configuration (NO database or bcrypt here — this runs inside
// Next.js middleware on the Edge runtime). The Credentials provider, which
// needs Prisma + bcrypt, is added in auth.ts (Node runtime) instead.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // Persist id + role onto the JWT at sign-in.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    // Expose id + role on the session object used across the app.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    // Gatekeeper used by middleware: block every route except /login unless
    // the user is authenticated.
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;

      // The workflow survey is a public form — anyone with the link can fill it.
      if (path.startsWith("/survey")) return true;

      if (path.startsWith("/login")) {
        // Already logged in? Bounce away from the login page to the dashboard.
        if (isLoggedIn) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }
      return isLoggedIn;
    },
  },
  providers: [], // real providers are attached in auth.ts
} satisfies NextAuthConfig;
