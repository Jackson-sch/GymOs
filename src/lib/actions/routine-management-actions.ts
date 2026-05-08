"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";

/**
 * Obtiene todos los ejercicios en la biblioteca
 */
export async function getExercisesAction() {
  try {
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
    const routines = await prisma.routine.findMany({
      include: {
        member: { select: { fullName: true } },
        trainer: { select: { fullName: true } },
        _count: { select: { exercises: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: serialize(routines) };
  } catch (error) {
    return { success: false, error: "Error al obtener rutinas asignadas" };
  }
}

/**
 * Obtiene todos los entrenadores
 */
export async function getTrainersForRoutineAction() {
  try {
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
