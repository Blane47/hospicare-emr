import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Runs on every matched request (Edge runtime). The `authorized` callback in
// authConfig decides whether to allow the request or redirect to /login.
export default NextAuth(authConfig).auth;

export const config = {
  // Protect everything except Next.js internals, the auth API, and static files.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)",
  ],
};
