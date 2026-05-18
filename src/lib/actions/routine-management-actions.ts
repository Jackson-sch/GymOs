"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import { verifySession } from "@/lib/security";

/**
 * Obtiene todos los ejercicios en la biblioteca
 */
export async function getExercisesAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: 'asc' }
    });
    return { success: true, data: serialize(exercises) };
  } catch (error) {
    return { success: false, error: "Error al obtener ejercicios" };
  }
}

/**
 * Crea un nuevo ejercicio en la biblioteca
 */
export async function createExerciseAction(data: {
  name: string;
  category?: string;
  equipment?: string;
  muscleGroup?: string;
  demoUrl?: string;
}) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const exercise = await prisma.exercise.create({
      data
    });
    revalidatePath("/routines");
    return { success: true, data: serialize(exercise) };
  } catch (error) {
    return { success: false, error: "Error al crear el ejercicio" };
  }
}

/**
 * Obtiene la lista de miembros para asignación
 */
export async function getMembersForRoutineAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const members = await prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        dni: true,
      },
      orderBy: { fullName: 'asc' }
    });
    return { success: true, data: serialize(members) };
  } catch (error) {
    return { success: false, error: "Error al obtener miembros" };
  }
}

/**
 * Asigna una rutina a un miembro
 */
export async function assignRoutineAction(data: {
  name: string;
  description?: string;
  memberId: string;
  trainerId: string;
  exercises: {
    exerciseId: string;
    day: string;
    order: number;
    sets: number;
    reps: string;
    weight?: string;
    rest?: string;
    notes?: string;
  }[];
}) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const { exercises, ...routineData } = data;

    const routine = await prisma.routine.create({
      data: {
        ...routineData,
        exercises: {
          create: exercises
        }
      }
    });

    revalidatePath("/routines");
    return { success: true, data: serialize(routine) };
  } catch (error) {
    console.error("Error assigning routine:", error);
    return { success: false, error: "Error al asignar la rutina" };
  }
}

/**
 * Obtiene todas las rutinas asignadas (vista administrativa)
 */
export async function getAllAssignedRoutinesAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const routines = await prisma.routine.findMany({
      include: {
        member: { select: { id: true, fullName: true, dni: true } },
        trainer: { select: { fullName: true } },
        exercises: {
          include: {
            exercise: { select: { name: true } }
          },
          orderBy: { order: 'asc' }
        },
        _count: { select: { exercises: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: serialize(routines) };
  } catch (error) {
    console.error("Error fetching routines:", error);
    return { success: false, error: "Error al obtener rutinas asignadas" };
  }
}

/**
 * Obtiene todos los entrenadores
 */
export async function getTrainersForRoutineAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const trainers = await prisma.trainer.findMany({
      select: {
        id: true,
        fullName: true,
      },
      orderBy: { fullName: 'asc' }
    });
    return { success: true, data: serialize(trainers) };
  } catch (error) {
    return { success: false, error: "Error al obtener entrenadores" };
  }
}

/**
 * Obtiene estadísticas generales de rutinas
 */
export async function getRoutinesStatsAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const [totalRoutines, totalExercises, totalAssignedMembers] = await Promise.all([
      prisma.routine.count(),
      prisma.exercise.count(),
      prisma.routine.groupBy({
        by: ['memberId'],
        _count: true
      })
    ]);

    return {
      success: true,
      data: {
        totalRoutines,
        totalExercises,
        membersWithRoutines: totalAssignedMembers.length
      }
    };
  } catch (error) {
    return { success: false, error: "Error al obtener estadísticas" };
  }
}
