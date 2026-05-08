"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/security";

const trainerSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Teléfono requerido"),
  photo: z.string().nullish(),
  photoPosition: z.number().nullish(),
  specialties: z.array(z.string()).nullish(),
  bio: z.string().nullish(),
  commissionPct: z.number().min(0).max(100).nullish(),
  baseSalary: z.number().min(0).nullish(),
  perClassRate: z.number().min(0).nullish(),
});

// Helper to clean null values to undefined for Prisma compatibility
function cleanTrainerData(data: any) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, v === null ? undefined : v])
  );
}

export async function getTrainers() {
  try {
    await verifySession();
    const trainers = await prisma.trainer.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
    });
    return trainers;
  } catch (error) {
    return [];
  }
}

export async function getTrainerById(id: string) {
  try {
    await verifySession();
    return await prisma.trainer.findUnique({
      where: { id },
      include: { 
        classes: {
          orderBy: { startTime: "desc" },
          take: 50,
        }
      },
    });
  } catch (error) {
    return null;
  }
}

export async function createTrainer(data: z.infer<typeof trainerSchema>) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const parsed = trainerSchema.parse(data);
  
  const existingEmail = await prisma.trainer.findUnique({
    where: { email: parsed.email },
  });
  
  if (existingEmail) {
    return { success: false, error: "El email ya está registrado" };
  }
  
  const trainer = await prisma.trainer.create({
    data: {
      ...cleanTrainerData(parsed),
      specialties: parsed.specialties || [],
    } as any, // Cast to avoid strict Prisma type issues with the dynamic cleaning
  });
  
  revalidatePath("/trainers");
  return { success: true, data: trainer };
  } catch (error: any) {
    console.error("Error creating trainer:", error);
    return { success: false, error: error.message || "Error al crear entrenador" };
  }
}

export async function updateTrainer(id: string, data: Partial<z.infer<typeof trainerSchema>>) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const parsed = trainerSchema.partial().parse(data);
  const cleanData = cleanTrainerData(parsed);
  
  const existing = await prisma.trainer.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Entrenador no encontrado" };
  }
  
  if (parsed.email && parsed.email !== existing.email) {
    const emailInUse = await prisma.trainer.findUnique({
      where: { email: parsed.email },
    });
    if (emailInUse) {
      return { success: false, error: "El email ya está en uso" };
    }
  }
  
  const trainer = await prisma.trainer.update({
    where: { id },
    data: cleanData as any,
  });
  
  revalidatePath("/trainers");
  revalidatePath(`/trainers/${id}`);
  return { success: true, data: trainer };
  } catch (error: any) {
    console.error("Error updating trainer:", error);
    return { success: false, error: error.message || "Error al actualizar entrenador" };
  }
}

export async function deleteTrainer(id: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const existing = await prisma.trainer.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Entrenador no encontrado" };
  }
  
  await prisma.trainer.update({
    where: { id },
    data: { isActive: false },
  });
  
  revalidatePath("/trainers");
  return { success: true };
  } catch (error: any) {
    console.error("Error deleting trainer:", error);
    return { success: false, error: error.message || "Error al eliminar entrenador" };
  }
}