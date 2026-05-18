import { expect, test, describe } from "vitest";
import { prisma } from "../lib/prisma";

describe("Environment & Infrastructure", () => {
  test("Critical Environment Variables", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.BETTER_AUTH_SECRET).toBeDefined();
    expect(process.env.CONFIG_SECRET).toBeDefined();
  });

  test("Database Connectivity", async () => {
    const userCount = await prisma.user.count();
    expect(userCount).toBeGreaterThanOrEqual(0);
  });

  test("RBAC Security Helpers", async () => {
    const { verifySession } = await import("../lib/security");
    expect(verifySession).toBeDefined();
  });
});
