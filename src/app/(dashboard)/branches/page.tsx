import React from "react";
import { verifySession } from "@/lib/security";
import { getBranchAnalyticsAction } from "@/lib/actions/branch-actions";
import { BranchesClient } from "./BranchesClient";

export const metadata = {
  title: "Sedes & Sucursales | GymOS Multi-Branch",
  description: "Gestión centralizada de múltiples sedes físicas y análisis comparativo por ubicación.",
};

export default async function BranchesPage() {
  await verifySession(["ADMIN", "SUPER_ADMIN"]);

  const res = await getBranchAnalyticsAction();
  const branches = res.success && res.data ? res.data : [];

  return <BranchesClient initialBranches={branches} />;
}
