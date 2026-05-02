"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";

// Función de utilidad para serialización profunda y segura de tipos complejos de Prisma
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));
}

// --- CLASES ---
export async function getClassesAction() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        trainer: true,
        _count: { select: { bookings: true } }
      },
      orderBy: { startTime: "asc" }
    });
    return { success: true, data: serialize(classes) };
  } catch (error) {
    return { success: false, error: "Error al cargar clases" };
  }
}

export async function createClassAction(data: any) {
  try {
    const duration = parseInt(data.durationMins);
    const capacity = parseInt(data.maxCapacity);
    const date = new Date(data.startTime);

    if (isNaN(duration) || isNaN(capacity)) {
      return { success: false, error: "Duración o capacidad inválida" };
    }

    if (isNaN(date.getTime())) {
      return { success: false, error: "Fecha y hora inválida" };
    }

    const endTime = new Date(date.getTime() + duration * 60000);

    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        description: data.description,
        startTime: date,
        endTime: endTime,
        durationMins: duration,
        maxCapacity: capacity,
        trainerId: data.trainerId,
        location: data.location || "Sala Principal",
        status: "SCHEDULED"
      }
    });

    revalidatePath("/classes");
    return { success: true, data: serialize(newClass) };
  } catch (error) {
    console.error("Error al crear clase:", error);
    return { success: false, error: "Error al crear clase en la base de datos" };
  }
}

export async function updateClassAction(id: string, data: any) {
  try {
    const duration = parseInt(data.durationMins);
    const capacity = parseInt(data.maxCapacity);
    const date = new Date(data.startTime);

    if (isNaN(duration) || isNaN(capacity)) {
      return { success: false, error: "Duración o capacidad inválida" };
    }

    if (isNaN(date.getTime())) {
      return { success: false, error: "Fecha y hora inválida" };
    }

    const endTime = new Date(date.getTime() + duration * 60000);

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        startTime: date,
        endTime: endTime,
        durationMins: duration,
        maxCapacity: capacity,
        trainerId: data.trainerId,
        location: data.location,
        status: data.status
      }
    });
    revalidatePath("/classes");
    return { success: true, data: serialize(updatedClass) };
  } catch (error) {
    console.error("Error al actualizar clase:", error);
    return { success: false, error: "Error al actualizar clase en la base de datos" };
  }
}

export async function deleteClassAction(id: string) {
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/classes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar la clase" };
  }
}

// --- ENTRENADORES ---
export async function getTrainersAction() {
  try {
    const trainers = await prisma.trainer.findMany({
      where: { isActive: true }
    });
    return { success: true, data: serialize(trainers) };
  } catch (error) {
    return { success: false, error: "Error al cargar staff" };
  }
}

export async function createTrainerAction(data: any) {
  try {
    const trainer = await prisma.trainer.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        photo: data.photo,
        specialties: data.specialties || [],
        bio: data.bio,
        isActive: true
      }
    });
    revalidatePath("/classes");
    return { success: true, data: serialize(trainer) };
  } catch (error) {
    console.error("Error creating trainer:", error);
    return { success: false, error: "Error al registrar entrenador" };
  }
}

export async function updateTrainerAction(id: string, data: any) {
  try {
    const trainer = await prisma.trainer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        photo: data.photo,
        specialties: data.specialties || [],
        bio: data.bio,
        isActive: data.isActive ?? true
      }
    });
    revalidatePath("/classes");
    return { success: true, data: serialize(trainer) };
  } catch (error) {
    console.error("Error updating trainer:", error);
    return { success: false, error: "Error al actualizar entrenador" };
  }
}
