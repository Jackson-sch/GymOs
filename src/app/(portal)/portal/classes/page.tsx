import React from "react";
import { verifySession } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { PortalClassesClient } from "./PortalClassesClient";
import { serialize } from "@/lib/utils";

export const metadata = {
  title: "Reserva de Clases Grupales | GymOS",
};

export default async function PortalClassesPage() {
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

  const memberId = member?.id || "";

  const classes = await prisma.class.findMany({
    where: {
      startTime: {
        gte: new Date()
      }
    },
    include: {
      trainer: { select: { fullName: true } },
      bookings: {
        select: { id: true, memberId: true }
      }
    },
    orderBy: { startTime: "asc" }
  });

  const formattedClasses = classes.map((c) => {
    const myBooking = c.bookings.find((b) => b.memberId === memberId);
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      trainerName: c.trainer?.fullName,
      capacity: c.maxCapacity,
      bookedCount: c.bookings.length,
      schedule: c.startTime,
      isBookedByMe: !!myBooking,
      myBookingId: myBooking?.id || null,
      branchName: null
    };
  });

  return <PortalClassesClient classes={serialize(formattedClasses)} memberId={memberId} />;
}
