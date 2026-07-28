import { describe, it, expect, vi } from "vitest";
import { getBranchesAction, createBranchAction } from "../branch-actions";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    branch: {
      findMany: vi.fn().mockResolvedValue([
        { id: "branch-1", name: "Sede Central", slug: "central", organizationId: "org-1" }
      ]),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: "branch-2", ...data })
      ),
    },
  },
}));

vi.mock("@/lib/security", () => ({
  getCurrentTenant: vi.fn().mockResolvedValue({ organizationId: "org-1", branchId: "branch-1" }),
  verifySession: vi.fn().mockResolvedValue({ user: { id: "user-1", role: "ADMIN" } }),
}));

describe("Branch Server Actions", () => {
  it("debe obtener la lista de sedes de la organización", async () => {
    const res = await getBranchesAction();
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(res.data?.[0]?.name).toBe("Sede Central");
  });

  it("debe rechazar creación de sede si faltan campos obligatorios", async () => {
    const res = await createBranchAction({ name: "", slug: "" });
    expect(res.success).toBe(false);
    expect(res.error).toBe("Nombre y slug de la sede son requeridos");
  });
});
