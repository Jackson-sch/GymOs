import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://postgres:postgres@localhost:5432/gymos";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export { Prisma };
