"use server";

import { prisma, Prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EquipmentStatus } from "@prisma/client";
import { serialize } from "@/lib/utils";

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

export async function getEquipmentAction() {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: serialize(equipment) };
  } catch (error) {
    return { success: false, error: "Error al cargar inventario" };
  }
}

export async function getEquipmentKPIs() {
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
    const overdue = await prisma.equipment.findMany({
      where: {
        OR: [
          { status: "MAINTENANCE" },
          { nextMaintenance: { lt: new Date() } }
        ]
      },
      orderBy: { nextMaintenance: "asc" },
      take: 5
    });
    return { success: true, data: serialize(overdue) };
  } catch (error) {
    return { success: false, error: "Error al cargar alertas" };
  }
}

export async function createEquipmentAction(data: any) {
  try {
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

export async function updateEquipmentAction(id: string, data: any) {
  try {
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
    await prisma.equipment.delete({ where: { id } });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar el equipo" };
  }
}
