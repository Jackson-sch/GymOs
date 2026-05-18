"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { differenceInDays, startOfDay, endOfDay } from "date-fns";
import { verifySession } from "@/lib/security";

export async function processCheckIn(identifier: string, method: "QR" | "NFC" | "PIN" | "MANUAL" = "QR") {
  let member;
  
  if (method === "PIN") {
    member = await prisma.member.findUnique({
      where: { pin: identifier },
      include: { memberships: { where: { status: "ACTIVE" }, take: 1 } },
    });
  } else if (method === "MANUAL") {
    member = await prisma.member.findUnique({
      where: { id: identifier },
      include: { memberships: { where: { status: "ACTIVE" }, take: 1 } },
    });
  } else {
    member = await prisma.member.findUnique({
      where: { qrCode: identifier },
      include: { memberships: { where: { status: "ACTIVE" }, take: 1 } },
    });
  }
  
  if (!member) {
    return { success: false, error: method === "PIN" ? "PIN de acceso incorrecto" : "Identificador no válido" };
  }
  
  if (member.status !== "ACTIVE") {
    return { 
      success: false, 
      error: "Socio inactivo",
      member: { id: member.id, fullName: member.fullName, status: member.status },
    };
  }
  
  const membership = member.memberships[0];
  if (!membership) {
    return { 
      success: false, 
      error: "Sin membresía activa",
      member: { id: member.id, fullName: member.fullName },
    };
  }
  
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  
  const existingAttendance = await prisma.attendance.findFirst({
    where: { 
      memberId: member.id,
      checkIn: { gte: todayStart, lte: todayEnd },
      checkOut: null,
    },
  });
  
  if (existingAttendance) {
    await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: { checkOut: new Date() },
    });
    
    return { 
      success: true, 
      message: "Check-out registrado",
      type: "checkout",
      member: { id: member.id, fullName: member.fullName, photo: member.photo },
    };
  }
  
  const daysLeft = differenceInDays(membership.endDate, new Date());
  
  await prisma.attendance.create({
    data: {
      memberId: member.id,
      method,
    },
  });
  
  return { 
    success: true, 
    message: "Check-in realizado",
    type: "checkin",
    daysLeft,
    member: { id: member.id, fullName: member.fullName, photo: member.photo },
    membership: { plan: membership.planId, endDate: membership.endDate },
  };
}

export async function getCheckInStats() {
  await verifySession();
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  
  const [checkedIn, totalActive, pendingPayments] = await Promise.all([
    prisma.attendance.count({
      where: { checkIn: { gte: todayStart, lte: todayEnd }, checkOut: null },
    }),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
  ]);
  
  return {
    checkedIn,
    totalActive,
    pendingPayments,
    occupancyRate: totalActive > 0 ? ((checkedIn / totalActive) * 100).toFixed(1) : "0",
  };
}

export async function assignMemberPin(memberId: string, pin: string) {
  const session = await verifySession();
  
  if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    return { success: false, error: "El PIN debe contener entre 4 y 6 números" };
  }
  
  // Verificar si otro miembro ya tiene este PIN
  const existing = await prisma.member.findUnique({
    where: { pin },
  });
  
  if (existing && existing.id !== memberId) {
    return { success: false, error: "Este PIN ya está en uso por otro socio" };
  }
  
  await prisma.member.update({
    where: { id: memberId },
    data: { pin },
  });
  
  revalidatePath("/members");
  revalidatePath("/kiosk");
  return { success: true, message: "PIN de acceso asignado exitosamente" };
}