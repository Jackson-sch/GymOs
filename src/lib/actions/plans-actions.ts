"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";



export async function getPlansAction() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });
    
    return { success: true, data: serialize(plans) };
  } catch (error) {
    return { success: false, error: "Error al cargar planes" };
  }
}

export async function createPlanAction(data: any) {
  try {
    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        durationDays: parseInt(data.durationDays),
        category: data.category || "GENERAL",
        allowedClasses: data.allowedClasses === true,
        maxFreezeDays: parseInt(data.maxFreezeDays || "0"),
        color: data.color || "primary",
      },
    });
    revalidatePath("/memberships");
    return { success: true, data: serialize(plan) };
  } catch (error) {
    return { success: false, error: "Error al crear plan" };
  }
}

export async function updatePlanAction(id: string, data: any) {
  try {
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        durationDays: parseInt(data.durationDays),
        category: data.category,
        allowedClasses: data.allowedClasses === true,
        maxFreezeDays: parseInt(data.maxFreezeDays || "0"),
      },
    });
    revalidatePath("/memberships");
    return { success: true, data: serialize(plan) };
  } catch (error) {
    return { success: false, error: "Error al actualizar plan" };
  }
}

export async function deletePlanAction(id: string) {
  try {
    await prisma.plan.delete({ where: { id } });
    revalidatePath("/memberships");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar (tiene socios suscritos)" };
  }
}
