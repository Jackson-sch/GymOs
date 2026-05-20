import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPortalMemberAction } from "@/lib/actions/portal-actions";
import PortalProfileClient from "./PortalProfileClient";

export default async function PortalProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const memberRes = await getPortalMemberAction();
  const member = memberRes.success ? memberRes.data : null;

  return (
    <PortalProfileClient
      member={member}
      user={session?.user}
    />
  );
}

