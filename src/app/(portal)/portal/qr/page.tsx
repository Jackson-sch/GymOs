import React from "react";
import { verifySession } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DynamicQRClient } from "./DynamicQRClient";
import { serialize } from "@/lib/utils";

export const metadata = {
  title: "Credencial QR Digital | GymOS",
};

export default async function PortalQRPage() {
  const session = await verifySession();
  const user = session.user as any;

  const member = await prisma.member.findFirst({
    where: {
      OR: [
        { userId: user.id },
        { email: user.email }
      ]
    },
    include: {
      organization: { select: { name: true } },
      memberships: {
        where: { status: "ACTIVE" },
        take: 1,
        include: { plan: true }
      }
    }
  });

  if (!member) {
    redirect("/portal");
  }

  const memberData = {
    id: member.id,
    fullName: member.fullName,
    dni: member.dni,
    email: member.email,
    photo: member.photo,
    qrCode: member.qrCode || member.id,
    status: member.status,
    organizationName: member.organization?.name,
    planName: member.memberships?.[0]?.plan?.name,
    endDate: member.memberships?.[0]?.endDate,
  };

  return <DynamicQRClient member={serialize(memberData)} />;
}
