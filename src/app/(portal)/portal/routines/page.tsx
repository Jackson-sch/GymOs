import React from "react";
import { verifySession } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { RoutineExecutorClient } from "./RoutineExecutorClient";
import { serialize } from "@/lib/utils";

export const metadata = {
  title: "Mis Rutinas & Entrenamiento | GymOS",
};

export default async function PortalRoutinesPage() {
  const session = await verifySession();
  const user = session.user as any;

  const member = await prisma.member.findFirst({
    where: {
      OR: [
        { userId: user.id },
        { email: user.email }
      ]
    }
  });

  const routines = await prisma.routine.findMany({
    where: member ? {
      memberId: member.id,
      isActive: true
    } : {
      isActive: true
    },
    include: {
      exercises: true
    },
    orderBy: { createdAt: "desc" }
  });

  return <RoutineExecutorClient routines={serialize(routines)} />;
}
