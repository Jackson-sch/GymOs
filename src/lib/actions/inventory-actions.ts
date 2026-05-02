"use server";

import { prisma, Prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";

export async function getEquipmentAction() {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { purchaseDate: "desc" },
    });
    
    return { success: true, data: serialize(equipment) };
  } catch (error) {
    return { success: false, error: "Error al cargar inventario" };
  }
}

export async function createEquipmentAction(data: any) {
  try {
    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        category: data.category,
        photo: data.photo,
        serialNumber: data.serialNumber || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ? new Prisma.Decimal(data.purchasePrice) : null,
        status: data.status,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : null,
        nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : null,
        notes: data.notes || null,
      },
    });

    revalidatePath("/inventory");
    return { success: true, data: serialize(equipment) };
  } catch (error) {
    console.error("Error creating equipment:", error);
    return { success: false, error: "Error al crear equipo" };
  }
}

export async function updateEquipmentAction(id: string, data: any) {
  try {
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        photo: data.photo,
        serialNumber: data.serialNumber || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ? new Prisma.Decimal(data.purchasePrice) : null,
        status: data.status,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : null,
        nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : null,
        notes: data.notes || null,
      },
    });

    revalidatePath("/inventory");
    return { success: true, data: serialize(equipment) };
  } catch (error) {
    console.error("Error updating equipment:", error);
    return { success: false, error: "Error al actualizar equipo" };
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
