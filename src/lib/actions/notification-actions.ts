"use server";

import { prisma } from "../../../prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { serialize } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "No autorizado" };

  // Find the member associated with this user
  const member = await prisma.member.findUnique({
    where: { userId: session.user.id }
  });

  if (!member) return { success: true, data: [] };

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
