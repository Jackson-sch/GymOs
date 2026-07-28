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
      },
      include: {
        member: { select: { id: true, fullName: true, dni: true } },
        trainer: { select: { fullName: true } },
        exercises: {
          include: {
            exercise: { select: { name: true, muscleGroup: true } }
          },
          orderBy: { order: 'asc' }
        },
        _count: { select: { exercises: true } }
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

/**
 * Traductor especializado de terminología de gimnasio (Inglés -> Español)
 */
function translateExerciseNameToSpanish(name: string): string {
  if (!name) return name;
  let translated = name;

  const EXACT_REPLACEMENTS: Array<[RegExp, string]> = [
    [/\bBarbell Bench Press\b/gi, "Press de Banca con Barra"],
    [/\bIncline Dumbbell Press\b/gi, "Press Inclinado con Mancuernas"],
    [/\bDecline Dumbbell Press\b/gi, "Press Declinado con Mancuernas"],
    [/\bIncline Barbell Bench Press\b/gi, "Press Inclinado de Banca con Barra"],
    [/\bDecline Barbell Bench Press\b/gi, "Press Declinado de Banca con Barra"],
    [/\bDumbbell Bench Press\b/gi, "Press de Banca con Mancuernas"],
    [/\bLat Pulldown\b/gi, "Jalón al Pecho en Polea"],
    [/\bSeated Cable Row\b/gi, "Remo Sentado en Polea"],
    [/\bStanding Calf Raise\b/gi, "Elevación de Talones de Pie"],
    [/\bSeated Calf Raise\b/gi, "Elevación de Talones Sentado"],
    [/\bLeg Extension\b/gi, "Extensión de Piernas en Máquina"],
    [/\bLeg Curl\b/gi, "Curl de Piernas en Máquina"],
    [/\bLeg Press\b/gi, "Prensa de Piernas"],
    [/\bPush-up\b/gi, "Flexiones de Pecho"],
    [/\bPushups\b/gi, "Flexiones de Pecho"],
    [/\bPush-ups\b/gi, "Flexiones de Pecho"],
    [/\bPull-up\b/gi, "Dominadas en Barra"],
    [/\bPullups\b/gi, "Dominadas en Barra"],
    [/\bChin-up\b/gi, "Dominadas Supinas"],
    [/\bTriceps Extension\b/gi, "Extensión de Tríceps"],
    [/\bTriceps Dip\b/gi, "Fondos para Tríceps"],
    [/\bDips\b/gi, "Fondos en Paralelas"],
    [/\bBiceps Curl\b/gi, "Curl de Bíceps"],
    [/\bHammer Curl\b/gi, "Curl Martillo"],
    [/\bPreacher Curl\b/gi, "Curl Predicador en Banco Scott"],
    [/\bOverhead Press\b/gi, "Press Militar por Encima de la Cabeza"],
    [/\bShoulder Press\b/gi, "Press de Hombros"],
    [/\bLateral Raise\b/gi, "Elevaciones Laterales"],
    [/\bFront Raise\b/gi, "Elevaciones Frontales"],
    [/\bRear Delt Fly\b/gi, "Aperturas Posteriores para Deltoides"],
    [/\bFace Pull\b/gi, "Jalón a la Cara (Face Pull)"],
    [/\bRomanian Deadlift\b/gi, "Peso Muerto Rumano"],
    [/\bStiff-Legged Deadlift\b/gi, "Peso Muerto Piernas Rígidas"],
    [/\bSumo Deadlift\b/gi, "Peso Muerto Sumo"],
    [/\bDeadlift\b/gi, "Peso Muerto"],
    [/\bSquat\b/gi, "Sentadilla"],
    [/\bLunge\b/gi, "Zancadas / Estocadas"],
    [/\bAb Crunch\b/gi, "Encogimiento Abdominal (Crunch)"],
    [/\bCrunch\b/gi, "Crunch Abdominal"],
    [/\bPlank\b/gi, "Plancha Abdominal Isométrica"],
  ];

  for (const [regex, replacement] of EXACT_REPLACEMENTS) {
    if (regex.test(translated)) {
      translated = translated.replace(regex, replacement);
    }
  }

  const VOCABULARY_MAP: Record<string, string> = {
    Barbell: "con Barra",
    Dumbbell: "con Mancuernas",
    Cable: "en Polea",
    Kettlebell: "con Pesa Rusa",
    Machine: "en Máquina",
    Band: "con Banda",
    Bench: "en Banco",
    Incline: "Inclinado",
    Decline: "Declinado",
    Seated: "Sentado",
    Standing: "De Pie",
    Lying: "Tumbado",
    Single: "Unilateral",
    Arm: "Brazo",
    Leg: "Pierna",
    Alternate: "Alternado",
    Alternating: "Alternado",
    Press: "Press",
    Fly: "Aperturas",
    Flies: "Aperturas",
    Row: "Remo",
    Curl: "Curl",
    Extension: "Extensión",
    Raise: "Elevación",
    Raises: "Elevaciones",
    Rotation: "Rotación",
    Stretch: "Estiramiento",
    Walk: "Caminata",
  };

  Object.entries(VOCABULARY_MAP).forEach(([eng, esp]) => {
    const reg = new RegExp(`\\b${eng}\\b`, "gi");
    if (reg.test(translated) && !translated.toLowerCase().includes(esp.toLowerCase())) {
      translated = translated.replace(reg, esp);
    }
  });

  return translated.trim();
}

/**
 * Puebla la biblioteca de ejercicios descargando el catálogo open-source gratuito (+800 ejercicios)
 * traduciéndolos automáticamente al español.
 */
export async function seedOpenExerciseCatalogAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);

    const response = await fetch(
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json",
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("No se pudo conectar con el repositorio del catálogo");
    }

    const rawExercises = await response.json();
    if (!Array.isArray(rawExercises)) {
      throw new Error("Formato de catálogo no válido");
    }

    // 1. Traducir ejercicios existentes en la base de datos a español si están en inglés
    const currentDbExercises = await prisma.exercise.findMany();
    const updatePromises = currentDbExercises.flatMap((ex) => {
      const spanishName = translateExerciseNameToSpanish(ex.name);
      return spanishName !== ex.name
        ? [
            prisma.exercise.update({
              where: { id: ex.id },
              data: { name: spanishName },
            }),
          ]
        : [];
    });
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    const updatedDbExercises = await prisma.exercise.findMany({
      select: { name: true },
    });
    const existingSet = new Set(updatedDbExercises.map((e) => e.name.toLowerCase()));

    const MUSCLE_MAP: Record<string, string> = {
      chest: "Pecho",
      quadriceps: "Piernas",
      hamstrings: "Piernas",
      calves: "Piernas",
      glutes: "Piernas",
      biceps: "Brazos",
      triceps: "Brazos",
      forearms: "Brazos",
      lats: "Espalda",
      "middle back": "Espalda",
      "lower back": "Espalda",
      traps: "Espalda",
      shoulders: "Hombros",
      abdominals: "Core",
      neck: "Hombros",
    };

    const newItems = rawExercises.reduce((acc: any[], item: any) => {
      const spanishName = translateExerciseNameToSpanish(item.name);
      const primaryMuscle = item.primaryMuscles?.[0] || "general";
      const muscleGroup = MUSCLE_MAP[primaryMuscle.toLowerCase()] || "General";
      const imagePath = item.images?.[0]
        ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${item.images[0]}`
        : undefined;

      const newItem = {
        name: spanishName,
        category: item.category || "strength",
        equipment: item.equipment || "bodyweight",
        muscleGroup: muscleGroup,
        demoUrl: imagePath,
      };

      if (newItem.name && !existingSet.has(newItem.name.toLowerCase())) {
        acc.push(newItem);
      }
      return acc;
    }, []);

    if (newItems.length > 0) {
      await prisma.exercise.createMany({
        data: newItems,
        skipDuplicates: true,
      });
    }

    const allExercises = await prisma.exercise.findMany({
      orderBy: { name: "asc" },
    });

    revalidatePath("/routines");
    return {
      success: true,
      addedCount: newItems.length,
      totalCount: allExercises.length,
      data: serialize(allExercises),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al poblar el catálogo de ejercicios",
    };
  }
}

