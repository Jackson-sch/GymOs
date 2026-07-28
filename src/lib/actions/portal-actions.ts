"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { serialize } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/security";

export async function getPortalDashboardData() {
  const session = await verifySession();

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

  const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { price: "asc" } });

  return {
    success: true,
    data: serialize({
      member,
      membership: activeMembership,
      daysLeft,
      nextClass: member.classBookings[0],
      plans,
      weightHistory: member.bodyMetrics.reverse().map(m => ({
        key: m.measuredAt.toLocaleDateString(),
        value: m.weight
      }))
    })
  };
}

export async function getPortalMemberAction() {
  const session = await verifySession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    include: {
      memberships: {
        include: {
          plan: true
        }
      }
    }
  });

  return { success: true, data: serialize(member) };
}

export async function getPortalProgressAction() {
  const session = await verifySession();

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
      }
    }
  });

  if (!member) return { success: false, error: "Socio no encontrado" };

  const workoutLogs = await prisma.workoutLog.findMany({
    where: { routine: { memberId: member.id } },
    include: { _count: { select: { exercises: true } } },
    orderBy: { date: "desc" },
    take: 15
  });

  return {
    success: true,
    data: serialize({
      bodyMetrics: member.bodyMetrics,
      attendances: member.attendances,
      workoutLogs
    })
  };
}


export async function updatePortalMemberProfileAction(data: {
  fullName?: string;
  phone?: string;
  birthDate?: string | null;
  gender?: any;
  address?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  photo?: string | null;
  photoPosition?: number;
}) {
  const session = await verifySession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true }
  });

  if (!member) return { success: false, error: "Socio no encontrado" };

  const updateData: any = {};
  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
  if (data.emergencyPhone !== undefined) updateData.emergencyPhone = data.emergencyPhone;
  if (data.photo !== undefined) updateData.photo = data.photo;
  if (data.photoPosition !== undefined) updateData.photoPosition = data.photoPosition;

  // Actualizar Socio
  const updatedMember = await prisma.member.update({
    where: { id: member.id },
    data: updateData,
    include: {
      memberships: {
        include: {
          plan: true
        }
      }
    }
  });

  // Mantener sincronizado el usuario en Better Auth
  const userUpdates: any = {};
  if (data.fullName !== undefined) userUpdates.name = data.fullName;
  if (data.photo !== undefined) userUpdates.image = data.photo;

  if (Object.keys(userUpdates).length > 0) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: userUpdates
    });
  }

  revalidatePath("/portal/profile");
  return { success: true, message: "Perfil actualizado con éxito", data: serialize(updatedMember) };
}

