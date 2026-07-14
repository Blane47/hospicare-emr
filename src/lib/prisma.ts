import { PrismaClient } from "@prisma/client";

// Prisma recommends a single shared client instance. In development, Next.js
// hot-reloads modules, which would otherwise create a new client (and a new DB
// connection) on every reload. Caching it on globalThis prevents that.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
