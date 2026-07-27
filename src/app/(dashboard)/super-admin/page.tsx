import React from "react";
import { getOrganizationsAction, getSuperAdminStatsAction } from "@/lib/actions/organization-actions";
import { SuperAdminClient } from "./SuperAdminClient";
import { verifySession } from "@/lib/security";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Super Admin SaaS | GymOS Platform",
  description: "Torre de Control Global de Gimnasios y Clientes Multi-Tenant",
};

export default async function SuperAdminPage() {
  const session = await verifySession(["SUPER_ADMIN"]);
  
  if (!session) {
    redirect("/");
  }

  const [statsRes, orgsRes] = await Promise.all([
    getSuperAdminStatsAction(),
    getOrganizationsAction(),
  ]);

  const stats = statsRes.success && statsRes.data ? statsRes.data : {
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalMembers: 0,
    totalUsers: 0,
    totalRevenue: 0,
    estimatedMRR: 0,
  };

  const organizations = (orgsRes.success && orgsRes.data ? orgsRes.data : []) as any[];

  return (
    <SuperAdminClient
      initialStats={stats}
      initialOrganizations={organizations}
    />
  );
}
