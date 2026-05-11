"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { serialize } from "@/lib/utils";
import { verifySession } from "@/lib/security";

/**
 * Obtiene los logs de auditoría para la vista administrativa con paginación
 */
export async function getAuditLogsAction(params?: {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
}) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.action && params.action !== "ALL") {
      where.action = params.action;
    }
    if (params?.entity && params.entity !== "ALL") {
      where.entity = params.entity;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return { 
      success: true, 
      data: serialize(logs),
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    return { success: false, error: "Error al obtener logs de auditoría" };
  }
}
