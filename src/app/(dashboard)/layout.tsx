import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardContent } from "./DashboardContent";
import { getConfigMap } from "@/lib/config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });


  // Fetch branding config
  const branding = await getConfigMap(["GYM_NAME", "GYM_LOGO"]);

  return <DashboardContent branding={branding}>{children}</DashboardContent>;
}
