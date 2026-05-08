"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { differenceInDays } from "date-fns";

export async function processCheckIn(qrCode: string, method: "QR" | "NFC" | "PIN" | "MANUAL" = "QR") {
  const member = await prisma.member.findUnique({
    where: { qrCode },
    include: { memberships: { where: { status: "ACTIVE" }, take: 1 } },
  });
  
  if (!member) {
    return { success: false, error: "Código QR no válido" };
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
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  
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
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  
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