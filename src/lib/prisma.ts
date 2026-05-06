import { PrismaClient } from "@prisma/client";

// Singleton pattern required for Next.js hot reload in dev
// (avoids "too many connections" on each HMR cycle)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;
