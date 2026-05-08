import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Registra una acción en el log de auditoría del sistema
 */
export async function createAuditLog(params: {
  action: string;
  entity: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.warn("Intento de crear AuditLog sin sesión activa");
      return null;
    }

    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for") || "unknown";

    const log = await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldData: params.oldData,
        newData: params.newData,
        ipAddress: ipAddress,
      },
    });

    return log;
  } catch (error) {
    console.error("Error al crear AuditLog:", error);
    return null;
  }
}
