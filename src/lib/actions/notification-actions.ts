"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { serialize } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/security";

export async function getNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "No autorizado" };

  // Find the member associated with this user
  const member = await prisma.member.findUnique({
    where: { userId: session.user.id }
  });

  if (!member) {
    // Si es Administrador o Staff, retornar las notificaciones generales más recientes del sistema
    const userRole = (session.user as any).role || "MEMBER";
    if (["ADMIN", "SUPER_ADMIN", "RECEPTIONIST", "TRAINER"].includes(userRole)) {
      const adminNotifications = await prisma.appNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 20
      });
      return { success: true, data: serialize(adminNotifications) };
    }
    return { success: true, data: [] };
  }

  const notifications = await prisma.appNotification.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return { success: true, data: serialize(notifications) };
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.appNotification.update({
      where: { id },
      data: { read: true }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar" };
  }
}

/**
 * Utility function to create a notification (Internal use)
 */
export async function createNotification(memberId: string, title: string, message: string, type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO") {
  try {
    const notification = await prisma.appNotification.create({
      data: {
        memberId,
        title,
        message,
        type
      }
    });
    return { success: true, data: serialize(notification) };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Error al crear notificación" };
  }
}

/**
 * Obtener todas las notificaciones para el panel administrativo (Fase 6)
 */
export async function getAllAppNotificationsAction(filterType?: string, searchMember?: string) {
  try {
    await requireAdmin();

    const whereClause: any = {};
    if (filterType && filterType !== "ALL") {
      whereClause.type = filterType;
    }
    if (searchMember) {
      whereClause.member = {
        fullName: { contains: searchMember, mode: "insensitive" }
      };
    }

    const notifications = await prisma.appNotification.findMany({
      where: whereClause,
      include: {
        member: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return { success: true, data: serialize(notifications) };
  } catch (error: any) {
    console.error("Error fetching admin notifications:", error);
    return { success: false, error: error.message || "Error al obtener notificaciones" };
  }
}

/**
 * Eliminar una notificación desde el panel administrativo
 */
export async function deleteNotificationAction(id: string) {
  try {
    await requireAdmin();
    await prisma.appNotification.delete({ where: { id } });
    revalidatePath("/settings/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al eliminar la notificación" };
  }
}
