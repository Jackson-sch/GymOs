"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/security";
import { serialize } from "@/lib/utils";

// --- CLASES ---
export async function getClassesAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
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

import { type ClassStatus, type BookingStatus } from "@prisma/client";

export interface ClassInput {
  name: string;
  description?: string | null;
  startTime: string | Date;
  durationMins: string | number;
  maxCapacity: string | number;
  trainerId: string;
  location?: string | null;
  status?: ClassStatus | string;
  isRecurring?: boolean;
  recurrenceWeeks?: string | number;
}

export async function createClassAction(data: ClassInput) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const duration = typeof data.durationMins === 'string' ? parseInt(data.durationMins) : data.durationMins;
    const capacity = typeof data.maxCapacity === 'string' ? parseInt(data.maxCapacity) : data.maxCapacity;
    const startDate = new Date(data.startTime);

    if (isNaN(duration) || isNaN(capacity)) {
      return { success: false, error: "Duración o capacidad inválida" };
    }

    if (isNaN(startDate.getTime())) {
      return { success: false, error: "Fecha y hora inválida" };
    }

    // Lógica de Recurrencia
    if (data.isRecurring && data.recurrenceWeeks) {
      const weeks = typeof data.recurrenceWeeks === 'string' ? parseInt(data.recurrenceWeeks) : data.recurrenceWeeks;
      const createdClasses = [];

      for (let i = 0; i < weeks; i++) {
        const currentStartTime = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
        const currentEndTime = new Date(currentStartTime.getTime() + duration * 60000);

        const newClass = await prisma.class.create({
          data: {
            name: data.name,
            description: data.description,
            startTime: currentStartTime,
            endTime: currentEndTime,
            durationMins: duration,
            maxCapacity: capacity,
            trainerId: data.trainerId,
            location: data.location || "Sala Principal",
            status: "SCHEDULED",
            isRecurring: true,
            recurrence: { index: i, total: weeks }
          }
        });
        createdClasses.push(newClass);
      }

      revalidatePath("/classes");
      return { success: true, data: serialize(createdClasses[0]), count: createdClasses.length };
    }

    // Creación Individual (Estándar)
    const endTime = new Date(startDate.getTime() + duration * 60000);
    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        description: data.description,
        startTime: startDate,
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

export async function updateClassAction(id: string, data: ClassInput) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const duration = typeof data.durationMins === 'string' ? parseInt(data.durationMins) : data.durationMins;
    const capacity = typeof data.maxCapacity === 'string' ? parseInt(data.maxCapacity) : data.maxCapacity;
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
        status: data.status as ClassStatus | undefined
      }
    });
    revalidatePath("/classes");
    return { success: true, data: serialize(updatedClass) };
  } catch (error) {
    console.error("Error al actualizar clase:", error);
    return { success: false, error: "Error al actualizar clase en la base de datos" };
  }
}

export async function completeClassAction(id: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    
    // Al completar, opcionalmente marcamos a todos los CONFIRMED como ATTENDED 
    // si el staff no lo hizo manualmente, pero por ahora solo cambiamos el estado de la clase
    const result = await prisma.class.update({
      where: { id },
      data: { status: "COMPLETED" }
    });

    revalidatePath("/classes");
    revalidatePath(`/trainers/${result.trainerId}`);
    return { success: true, data: serialize(result) };
  } catch (error) {
    console.error("Error completing class:", error);
    return { success: false, error: "No se pudo finalizar la clase" };
  }
}

export async function deleteClassAction(id: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    await prisma.class.delete({ where: { id } });
    revalidatePath("/classes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar la clase" };
  }
}

export async function getClassDetailWithBookingsAction(classId: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const gymClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        trainer: true,
        bookings: {
          include: {
            member: {
              select: {
                id: true,
                fullName: true,
                photo: true,
                dni: true
              }
            }
          },
          orderBy: { bookedAt: "desc" }
        }
      }
    });

    if (!gymClass) return { success: false, error: "Clase no encontrada" };
    return { success: true, data: serialize(gymClass) };
  } catch (error) {
    return { success: false, error: "Error al obtener detalle de la clase" };
  }
}

// --- RESERVAS (BOOKINGS) ---

export async function createBookingAction(classId: string, memberId: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "RECEPTIONIST", "TRAINER"]);

    // 1. Verificar capacidad
    const gymClass = await prisma.class.findUnique({
      where: { id: classId },
      include: { _count: { select: { bookings: true } } }
    });

    if (!gymClass) return { success: false, error: "Clase no encontrada" };
    if (gymClass._count.bookings >= gymClass.maxCapacity) {
      return { success: false, error: "La clase está llena" };
    }

    // 2. Verificar si ya existe
    const existing = await prisma.classBooking.findUnique({
      where: { classId_memberId: { classId, memberId } }
    });

    if (existing) {
      if (existing.status === "CANCELLED") {
        // Reactivar
        await prisma.classBooking.update({
          where: { id: existing.id },
          data: { status: "CONFIRMED", bookedAt: new Date() }
        });
      } else {
        return { success: false, error: "El socio ya está inscrito" };
      }
    } else {
      // 3. Crear reserva
      await prisma.classBooking.create({
        data: { classId, memberId, status: "CONFIRMED" }
      });
    }

    revalidatePath("/classes");
    return { success: true };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Error al registrar reserva" };
  }
}

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "RECEPTIONIST", "TRAINER"]);
    
    await prisma.classBooking.update({
      where: { id: bookingId },
      data: { status }
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar estado" };
  }
}

export async function cancelBookingAction(bookingId: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "RECEPTIONIST", "TRAINER"]);
    
    await prisma.classBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al cancelar reserva" };
  }
}

// Para el ComboBox de búsqueda de socios en el diálogo de clase
export async function getMembersForBookingAction() {
  try {
    await verifySession();
    const members = await prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, dni: true },
      orderBy: { fullName: "asc" }
    });
    return { success: true, data: serialize(members) };
  } catch (error) {
    return { success: false, error: "Error al cargar socios" };
  }
}
