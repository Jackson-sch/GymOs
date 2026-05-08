"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Obtiene las rutinas activas del socio actual
 */
export async function getMemberRoutinesAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "No autorizado" };
    }

    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
    });

    if (!member) {
      return { success: false, error: "Socio no encontrado" };
    }

    const routines = await prisma.routine.findMany({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        trainer: {
          select: {
            fullName: true,
            photo: true,
          }
        },
        exercises: {
          include: {
            exercise: true
          },
          orderBy: [
            { day: 'asc' },
            { order: 'asc' }
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, data: routines };
  } catch (error) {
    console.error("Error fetching routines:", error);
    return { success: false, error: "Error al obtener rutinas" };
  }
}

/**
 * Obtiene una rutina específica por ID
 */
export async function getRoutineByIdAction(id: string) {
  try {
    const routine = await prisma.routine.findUnique({
      where: { id },
      include: {
        trainer: true,
        exercises: {
          include: {
            exercise: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!routine) {
      return { success: false, error: "Rutina no encontrada" };
    }

    return { success: true, data: routine };
  } catch (error) {
    return { success: false, error: "Error al obtener la rutina" };
  }
}

/**
 * Registra o actualiza la completitud de un ejercicio en una sesión de entrenamiento (hoy)
 */
export async function toggleExerciseCompletionAction(routineId: string, routineExerciseId: string, completed: boolean) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "No autorizado" };
    }

    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
    });

    if (!member) {
      return { success: false, error: "Socio no encontrado" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar o crear el log de la sesión de hoy para esta rutina
    let workoutLog = await prisma.workoutLog.findFirst({
      where: {
        memberId: member.id,
        routineId: routineId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000)
        }
      }
    });

    if (!workoutLog) {
      workoutLog = await prisma.workoutLog.create({
        data: {
          memberId: member.id,
          routineId: routineId,
          date: new Date(),
        }
      });
    }

    // Buscar o crear el log del ejercicio específico
    const exerciseLog = await prisma.workoutExerciseLog.findFirst({
      where: {
        workoutLogId: workoutLog.id,
        routineExerciseId: routineExerciseId
      }
    });

    if (exerciseLog) {
      if (!completed) {
        // Si se desmarca, eliminamos el registro de completitud
        await prisma.workoutExerciseLog.delete({
          where: { id: exerciseLog.id }
        });
      }
    } else if (completed) {
      await prisma.workoutExerciseLog.create({
        data: {
          workoutLogId: workoutLog.id,
          routineExerciseId: routineExerciseId,
          completed: true
        }
      });
    }

    revalidatePath("/portal/routines");
    return { success: true };
  } catch (error) {
    console.error("Error logging exercise:", error);
    return { success: false, error: "Error al registrar ejercicio" };
  }
}

/**
 * Obtiene los ejercicios completados hoy por el socio
 */
export async function getTodayCompletionsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return { success: true, data: [] };

    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
    });

    if (!member) return { success: true, data: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.workoutLog.findMany({
      where: {
        memberId: member.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000)
        }
      },
      include: {
        exercises: true
      }
    });

    // Devolver lista plana de IDs de ejercicios de rutina completados
    const completedIds = logs.flatMap(l => l.exercises.map(e => e.routineExerciseId));
    
    return { success: true, data: completedIds };
  } catch (error) {
    return { success: false, error: "Error al obtener progreso de hoy" };
  }
}

