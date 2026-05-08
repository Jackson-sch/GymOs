"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { serialize } from "@/lib/utils";
import { differenceInDays, startOfWeek, endOfWeek } from "date-fns";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/security";

export async function getPortalDashboardData() {
  const { session }: any = await verifySession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        take: 1
      },
      classBookings: {
        where: { 
          class: { startTime: { gte: new Date() } },
          status: "CONFIRMED"
        },
        include: { class: true },
        orderBy: { class: { startTime: "asc" } },
        take: 1
      },
      bodyMetrics: {
        orderBy: { measuredAt: "desc" },
        take: 10
      }
    }
  });

  if (!member) return { success: false, error: "No se encontró registro de socio" };

  const activeMembership = member.memberships[0];
  const daysLeft = activeMembership ? differenceInDays(activeMembership.endDate, new Date()) : 0;

  return {
    success: true,
    data: serialize({
      member,
      membership: activeMembership,
      daysLeft,
      nextClass: member.classBookings[0],
      weightHistory: member.bodyMetrics.reverse().map(m => ({
        key: m.measuredAt.toLocaleDateString(),
        value: m.weight
      }))
    })
  };
}

export async function getPortalMemberAction() {
  const { session }: any = await verifySession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
  });

  return { success: true, data: serialize(member) };
}

export async function getPortalClassesAction() {
  const { session }: any = await verifySession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true }
  });

  if (!member) return { success: false, error: "Socio no encontrado" };

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const [availableClasses, myBookings] = await Promise.all([
    prisma.class.findMany({
      where: {
        startTime: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        trainer: true,
        _count: { select: { bookings: { where: { status: "CONFIRMED" } } } }
      },
      orderBy: { startTime: "asc" }
    }),
    prisma.classBooking.findMany({
      where: {
        memberId: member.id,
        class: { startTime: { gte: today } }
      },
      include: { class: true }
    })
  ]);

  return {
    success: true,
    data: serialize({
      availableClasses,
      myBookings,
      memberId: member.id
    })
  };
}

export async function bookPortalClassAction(classId: string) {
  const { session }: any = await verifySession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true }
  });

  if (!member) return { success: false, error: "Socio no encontrado" };

  // Check if class exists and is full
  const classItem = await prisma.class.findUnique({
    where: { id: classId },
    include: { _count: { select: { bookings: { where: { status: "CONFIRMED" } } } } }
  });

  if (!classItem) return { success: false, error: "Clase no encontrada" };

  // Check if already booked
  const existing = await prisma.classBooking.findFirst({
    where: {
      memberId: member.id,
      classId,
      status: { in: ["CONFIRMED", "WAITLISTED"] }
    }
  });

  if (existing) return { success: false, error: "Ya estás registrado en esta clase" };

  const isFull = classItem._count.bookings >= classItem.maxCapacity;
  const status = isFull ? "WAITLISTED" : "CONFIRMED";

  await prisma.classBooking.create({
    data: {
      memberId: member.id,
      classId,
      status,
    }
  });

  revalidatePath("/portal/classes");
  return { 
    success: true, 
    message: isFull ? "Añadido a la lista de espera" : "Reserva confirmada" 
  };
}

export async function cancelPortalBookingAction(bookingId: string) {
  const { session }: any = await verifySession();

  try {
    const booking = await prisma.classBooking.findUnique({
      where: { id: bookingId },
      include: { member: true }
    });

    if (!booking) return { success: false, error: "Reserva no encontrada" };

    // IDOR Protection: Verify owner
    if (booking.member.userId !== session.user.id) {
      return { success: false, error: "No autorizado para cancelar esta reserva" };
    }

    // Update status to CANCELLED
    await prisma.classBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    // If it was confirmed, promote someone from waitlist
    if (booking.status === "CONFIRMED") {
      const nextInLine = await prisma.classBooking.findFirst({
        where: {
          classId: booking.classId,
          status: "WAITLISTED"
        },
        orderBy: { bookedAt: "asc" }
      });

      if (nextInLine) {
        await prisma.classBooking.update({
          where: { id: nextInLine.id },
          data: { status: "CONFIRMED" }
        });
        
        // Notify the promoted member
        await prisma.appNotification.create({
          data: {
            memberId: nextInLine.memberId,
            title: "¡Ya tienes cupo!",
            message: `Has sido promovido de la lista de espera para una clase.`,
            type: "WAITLIST_PROMOTED"
          }
        });
      }
    }

    revalidatePath("/portal/classes");
    return { success: true, message: "Reserva cancelada" };
  } catch (error) {
    return { success: false, error: "Error al cancelar la reserva" };
  }
}

export async function getPortalProgressAction() {
  const { session }: any = await verifySession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    include: {
      bodyMetrics: {
        orderBy: { measuredAt: "desc" },
        take: 20
      },
      attendances: {
        orderBy: { checkIn: "desc" },
        take: 30
      },
      workoutLogs: {
        include: { _count: { select: { exercises: true } } },
        orderBy: { date: "desc" },
        take: 15
      }
    }
  });

  if (!member) return { success: false, error: "Socio no encontrado" };

  return {
    success: true,
    data: serialize({
      bodyMetrics: member.bodyMetrics,
      attendances: member.attendances,
      workoutLogs: member.workoutLogs
    })
  };
}
