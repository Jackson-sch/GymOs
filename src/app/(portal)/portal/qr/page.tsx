import React from "react";
import { getPortalMemberAction } from "@/lib/actions/portal-actions";
import { QRClient } from "./QRClient";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { serialize } from "@/lib/utils";

export default async function PortalQRPage() {
  const session: any = await verifySession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        take: 1
      }
    }
  });

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-serif text-muted-foreground">Socio no vinculado</h2>
        <p className="max-w-md text-sm text-muted-foreground/60">
          Tu cuenta de usuario no está vinculada a un registro de socio. 
          Contacta a recepción para solucionar esto.
        </p>
      </div>
    );
  }

  const activeMembership = member.memberships[0];

  return (
    <QRClient 
      member={serialize(member)} 
      planName={activeMembership?.plan?.name || "Sin Plan Activo"}
      isActive={!!activeMembership}
    />
  );
}
