"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/security";
import { 
  processExpiringMembershipsAction, 
  processExpiredMembershipsAction,
  processEquipmentMaintenanceAction 
} from "./cron-actions";

export async function getSystemConfigAction() {
  try {
    await verifySession();
    const configs = await prisma.systemConfig.findMany({
      orderBy: {
        category: "asc",
      },
    });
    return { success: true, data: configs };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: "No se pudo obtener la configuración" };
  }
}

export async function updateConfigAction(key: string, value: string) {
  try {
    await verifySession(["SUPER_ADMIN", "ADMIN"]);
    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { 
        key, 
        value,
        category: "GENERAL" 
      }
    });
    revalidatePath("/settings");
    return { success: true, data: config };
  } catch (error) {
    console.error("Error updating config:", error);
    return { success: false, error: "Error al actualizar configuración" };
  }
}

export async function updateConfigsAction(configs: { key: string; value: string; category?: any }[]) {
  try {
    await verifySession(["SUPER_ADMIN", "ADMIN"]);
    const operations = configs.map(config => 
      prisma.systemConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: { 
          key: config.key, 
          value: config.value,
          category: config.category || "GENERAL" 
        }
      })
    );
    await prisma.$transaction(operations);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating configs:", error);
    return { success: false, error: "Error al actualizar configuraciones" };
  }
}

export async function triggerCronJobsAction() {
  try {
    const session = await verifySession(["SUPER_ADMIN", "ADMIN"]);
    
    const results = await Promise.all([
      processExpiringMembershipsAction(),
      processExpiredMembershipsAction(),
      processEquipmentMaintenanceAction()
    ]);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CRON_TRIGGER",
        entity: "SYSTEM",
        ipAddress: "manual-trigger"
      }
    });

    return { success: true, data: results };
  } catch (error: any) {
    console.error("Error triggering cron:", error);
    return { success: false, error: error.message || "Error al disparar jobs" };
  }
}
