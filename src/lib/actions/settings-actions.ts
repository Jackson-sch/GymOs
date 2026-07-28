"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/security";
import { 
  processExpiringMembershipsAction, 
  processExpiredMembershipsAction,
  processEquipmentMaintenanceAction 
} from "./cron-actions";

import { setConfig, getConfigMap, type ConfigCategoryType } from "@/lib/config";

export async function getSystemConfigAction() {
  try {
    const session = await verifySession(["SUPER_ADMIN", "ADMIN"]);
    const user = session.user as any;
    const orgId = user.organizationId || null;

    const keys = [
      "GYM_NAME", "GYM_LOGO", "GYM_ADDRESS", "GYM_PHONE",
      "WA_PHONE_NUMBER_ID", "WA_ACCESS_TOKEN", "WA_WABA_ID",
      "RESEND_API_KEY", "RESEND_SENDER_EMAIL",
      "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER",
      "CULQI_PRIVATE_KEY", "CULQI_PUBLIC_KEY",
      "MP_ACCESS_TOKEN", "MP_PUBLIC_KEY",
      "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"
    ];

    const configMap = await getConfigMap(keys, orgId);

    const configsInDb = await prisma.systemConfig.findMany({
      where: { key: { in: keys } }
    });

    const resultList = keys.map((key) => {
      const existing = configsInDb.find((c) => c.key === key);
      return {
        key,
        value: configMap[key] || "",
        category: existing?.category || "GENERAL",
        isEncrypted: existing?.isEncrypted || false,
      };
    });

    return { success: true, data: resultList };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: "No se pudo obtener la configuración", data: [] };
  }
}

export async function updateConfigsAction(
  configs: { key: string; value: string; category?: ConfigCategoryType; isEncrypted?: boolean }[]
) {
  try {
    const session = await verifySession(["SUPER_ADMIN", "ADMIN"]);
    const user = session.user as any;
    const orgId = user.organizationId || null;

    await Promise.all(
      configs.map((c) => {
        const isEncrypted = c.isEncrypted ?? (
          c.key.includes("KEY") || 
          c.key.includes("TOKEN") || 
          c.key.includes("SECRET") || 
          c.key.includes("SID")
        );

        return setConfig(
          c.key,
          c.value,
          c.category || "GENERAL",
          isEncrypted,
          session.user.id,
          orgId
        );
      })
    );

    revalidatePath("/settings");
    revalidatePath("/settings/integrations");
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
