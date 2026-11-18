import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/shared/PortalShell";
import { getConfigMap } from "@/lib/config";
import { checkActiveAccess } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const access = await checkActiveAccess(session);
  if (!access.ok) {
    redirect("/suspended");
  }

  const branding = await getConfigMap(["GYM_NAME", "GYM_LOGO"]);

  return <PortalShell branding={branding}>{children}</PortalShell>;
}
