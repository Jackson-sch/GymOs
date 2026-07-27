import { describe, it, expect, vi } from "vitest";
import { proxy } from "../proxy";
import { NextRequest } from "next/server";

describe("Security Audit & Vulnerability Fix Verification", () => {
  describe("Middleware & Security Headers", () => {
    it("should inject security headers into responses", async () => {
      const req = new NextRequest("http://localhost:3000/login");
      const res = await proxy(req);

      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
      expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
      expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(res.headers.get("Permissions-Policy")).toBeDefined();
    });

    it("should block unauthenticated API requests for protected endpoints", async () => {
      const req = new NextRequest("http://localhost:3000/api/members");
      const res = await proxy(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("UNAUTHORIZED");
    });
  });

  describe("Cron Authentication Security", () => {
    it("should reject cron requests when CRON_SECRET is missing or invalid", async () => {
      const oldSecret = process.env.CRON_SECRET;
      delete process.env.CRON_SECRET;

      const { GET } = await import("../app/api/cron/expired/route");
      const req = new Request("http://localhost:3000/api/cron/expired", {
        headers: { authorization: "Bearer undefined" },
      });

      const res = await GET(req);
      expect(res.status).toBe(401);

      process.env.CRON_SECRET = oldSecret;
    });
  });
});
