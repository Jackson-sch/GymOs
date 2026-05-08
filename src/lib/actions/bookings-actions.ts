"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createNotification } from "./notification-actions";

export async function getBookings(classId?: string, memberId?: string) {
  return await prisma.classBooking.findMany({
    where: {
      ...(classId && { classId }),
      ...(memberId && { memberId }),
    },
    include: { class: true, member: true },
    orderBy: { bookedAt: "desc" },
  });
}

export async function getBookingById(id: string) {
  return await prisma.classBooking.findUnique({
    where: { id },
    include: { class: true, member: true },
  });
}

export async function createBooking(data: { classId: string; memberId: string }) {
  const existing = await prisma.classBooking.findFirst({
    where: { classId: data.classId, memberId: data.memberId, status: "CONFIRMED" },
  });
  
  if (existing) {
    return { success: false, error: "Ya tienes una reserva confirmada para esta clase" };
  }
  
  const classData = await prisma.class.findUnique({
    where: { id: data.classId },
    include: { 
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } } 
    },
  });
  
  if (!classData) {
    return { success: false, error: "Clase no encontrada" };
  }
  
  if (classData._count.bookings >= classData.maxCapacity) {
    await prisma.classBooking.create({
      data: {
        classId: data.classId,
        memberId: data.memberId,
        status: "WAITLISTED",
      },
    });
    
    await createNotification(
      data.memberId,
      "Lista de Espera",
      `Estás en lista de espera para ${classData.name}. Te avisaremos si se libera un cupo.`,
      "INFO"
    );

    revalidatePath("/classes");
    return { success: true, message: "Te has unido a la lista de espera" };
  }
  
  const member = await prisma.member.findUnique({
    where: { id: data.memberId },
    include: { memberships: { where: { status: "ACTIVE" }, take: 1 } },
  });
  
  if (!member || member.memberships.length === 0) {
    return { success: false, error: "El miembro no tiene membresía activa" };
  }
  
  await prisma.classBooking.create({ data });
  
  revalidatePath("/classes");
  return { success: true };
}

export async function cancelBooking(id: string) {
  const existing = await prisma.classBooking.findUnique({ 
    where: { id },
    include: { class: true }
  });
  
  if (!existing) {
    return { success: false, error: "Reserva no encontrada" };
  }
  
  await prisma.classBooking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  // Si era una reserva confirmada, buscar el siguiente en la lista de espera
  if (existing.status === "CONFIRMED") {
    const nextInLine = await prisma.classBooking.findFirst({
      where: {
        classId: existing.classId,
        status: "WAITLISTED"
      },
      orderBy: { bookedAt: "asc" }
    });

    if (nextInLine) {
      await prisma.classBooking.update({
        where: { id: nextInLine.id },
        data: { status: "CONFIRMED" }
      });

      await createNotification(
        nextInLine.memberId,
        "Cupo Confirmado",
        `¡Buenas noticias! Se ha liberado un cupo para ${existing.class.name} y tu reserva ha sido confirmada automáticamente.`,
        "SUCCESS"
      );
    }
  }
  
  revalidatePath("/classes");
  return { success: true };
}

export async function markAttended(id: string) {
  await prisma.classBooking.update({
    where: { id },
    data: { status: "ATTENDED" },
  });
  
  revalidatePath("/classes");
  return { success: true };
}

export async function markNoShow(id: string) {
  await prisma.classBooking.update({
    where: { id },
    data: { status: "NO_SHOW" },
  });
  
  revalidatePath("/classes");
  return { success: true };
}