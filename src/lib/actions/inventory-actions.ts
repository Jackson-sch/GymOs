"use server";

import { prisma, Prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EquipmentStatus } from "@prisma/client";
import { serialize } from "@/lib/utils";
import { verifySession } from "@/lib/security";

const equipmentSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  category: z.string().min(2, "Categoría requerida"),
  photo: z.string().nullish(),
  serialNumber: z.string().nullish(),
  purchaseDate: z.date().nullish().or(z.string().nullish().transform(val => val ? new Date(val) : null)),
  purchasePrice: z.number().nullish().or(z.string().nullish().transform(val => val ? Number(val) : null)),
  status: z.nativeEnum(EquipmentStatus).default(EquipmentStatus.OPERATIONAL),
  lastMaintenance: z.date().nullish().or(z.string().nullish().transform(val => val ? new Date(val) : null)),
  nextMaintenance: z.date().nullish().or(z.string().nullish().transform(val => val ? new Date(val) : null)),
  notes: z.string().nullish(),
});

export type EquipmentInput = z.input<typeof equipmentSchema>;

export async function getEquipmentAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: serialize(equipment) };
  } catch (error) {
    return { success: false, error: "Error al cargar inventario" };
  }
}

export async function getEquipmentKPIs() {
  await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
  const [total, maintenance, outOfService] = await Promise.all([
    prisma.equipment.count(),
    prisma.equipment.count({ where: { status: "MAINTENANCE" } }),
    prisma.equipment.count({ where: { status: "OUT_OF_SERVICE" } }),
  ]);

  return {
    total,
    maintenance,
    outOfService,
    operational: total - maintenance - outOfService
  };
}

export async function getMaintenanceAlerts() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const overdue = await prisma.equipment.findMany({
      where: {
        OR: [
          { status: "MAINTENANCE" },
          { nextMaintenance: { lte: nextWeek } }
        ]
      },
      orderBy: { nextMaintenance: "asc" },
      take: 8
    });
    return { success: true, data: serialize(overdue) };
  } catch (error) {
    return { success: false, error: "Error al cargar alertas" };
  }
}

export async function createEquipmentAction(data: EquipmentInput) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const parsed = equipmentSchema.parse(data);
    const equipment = await prisma.equipment.create({
      data: {
        ...parsed,
        purchasePrice: parsed.purchasePrice ? new Prisma.Decimal(parsed.purchasePrice) : null,
      } as any,
    });
    revalidatePath("/inventory");
    return { success: true, data: serialize(equipment) };
  } catch (error: any) {
    console.error("Error creating equipment:", error);
    return { success: false, error: error.message || "Error al crear equipo" };
  }
}

export async function updateEquipmentAction(id: string, data: EquipmentInput) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const parsed = equipmentSchema.partial().parse(data);
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...parsed,
        purchasePrice: parsed.purchasePrice ? new Prisma.Decimal(parsed.purchasePrice) : null,
      } as any,
    });
    revalidatePath("/inventory");
    return { success: true, data: serialize(equipment) };
  } catch (error: any) {
    console.error("Error updating equipment:", error);
    return { success: false, error: error.message || "Error al actualizar equipo" };
  }
}

export async function deleteEquipmentAction(id: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    await prisma.equipment.delete({ where: { id } });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar el equipo" };
  }
}
