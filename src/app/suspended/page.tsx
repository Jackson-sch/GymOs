import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkActiveAccess } from "@/lib/security";
import { SuspendedClient } from "./SuspendedClient";

export const dynamic = "force-dynamic";

export default async function SuspendedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const access = await checkActiveAccess(session);
  if (access.ok) {
    redirect("/");
  }

  return (
    <SuspendedClient
      reason={access.reason}
      orgName={"orgName" in access ? access.orgName : undefined}
      userEmail={session.user.email}
    />
  );
}
