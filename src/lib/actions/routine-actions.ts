"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import { verifySession } from "../security";
import { startOfDay, endOfDay } from "date-fns";

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
export async function toggleExerciseCompletionAction(
  routineId: string, 
  routineExerciseId: string, 
  completed: boolean,
  weightUsed?: string,
  repsDone?: string
) {
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

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // Buscar o crear el log de la sesión de hoy para esta rutina
    let workoutLog = await prisma.workoutLog.findFirst({
      where: {
        routine: {
          id: routineId,
          memberId: member.id,
        },
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    if (!workoutLog) {
      workoutLog = await prisma.workoutLog.create({
        data: {
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
        await prisma.workoutExerciseLog.delete({
          where: { id: exerciseLog.id }
        });
      } else {
        await prisma.workoutExerciseLog.update({
          where: { id: exerciseLog.id },
          data: {
            weightUsed: weightUsed || exerciseLog.weightUsed,
            repsDone: repsDone || exerciseLog.repsDone
          }
        });
      }
    } else if (completed) {
      await prisma.workoutExerciseLog.create({
        data: {
          workoutLogId: workoutLog.id,
          routineExerciseId: routineExerciseId,
          completed: true,
          weightUsed: weightUsed,
          repsDone: repsDone
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

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const logs = await prisma.workoutLog.findMany({
      where: {
        routine: {
          memberId: member.id,
        },
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        exercises: true
      }
    });

    // Devolver logs para que el cliente pueda ver peso/reps registrados
    const logsData = logs.flatMap(l => l.exercises);
    
    return { success: true, data: logsData };
  } catch (error) {
    return { success: false, error: "Error al obtener progreso de hoy" };
  }
}

/**
 * Obtiene los datos del entrenador actual para el portal
 */
export async function getTrainerPortalDataAction() {
  try {
    const session = await verifySession(["TRAINER", "ADMIN", "SUPER_ADMIN"]);

    const trainer = await prisma.trainer.findUnique({
      where: { userId: session.user.id },
      include: {
        classes: {
          where: {
            startTime: {
              gte: new Date(),
            }
          },
          take: 5,
          orderBy: { startTime: 'asc' },
          include: {
            bookings: true
          }
        },
        routines: {
          where: { isActive: true },
          include: {
            member: {
              select: {
                id: true,
                fullName: true,
                photo: true
              }
            }
          }
        },
        referrals: {
          where: { status: "ACTIVE" }
        }
      }
    });

    if (!trainer) {
      return { success: false, error: "Registro de entrenador no vinculado" };
    }

    // Obtener alumnos asignados (por rutinas)
    const membersIds = new Set(trainer.routines.map(r => r.memberId));
    const assignedMembers = await prisma.member.findMany({
      where: {
        id: { in: Array.from(membersIds) }
      },
      select: {
        id: true,
        fullName: true,
        photo: true,
        phone: true,
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
          include: { plan: true }
        }
      }
    });

    // Calcular estadísticas simples
    const activeMembersCount = assignedMembers.filter(m => m.memberships.length > 0).length;
    
    // Calcular comisiones proyectadas (comisión del plan de referidos)
    const commissionPct = Number(trainer.commissionPct || 0);
    const projectedCommissions = trainer.referrals.reduce((acc, curr) => {
      const price = Number(curr.price || 0);
      return acc + (price * (commissionPct / 100));
    }, 0);

    return { 
      success: true, 
      data: {
        trainer: serialize(trainer),
        upcomingClasses: serialize(trainer.classes),
        assignedMembers: serialize(assignedMembers),
        stats: {
          activeMembersCount,
          projectedCommissions
        }
      } 
    };
  } catch (error: any) {
    console.error("Error fetching trainer portal data:", error);
    return { success: false, error: error.message || "Error al obtener datos" };
  }
}

/**
 * Actualiza la asistencia de un miembro a una clase
 */
export async function updateClassAttendanceAction(bookingId: string, status: "ATTENDED" | "NO_SHOW" | "CONFIRMED") {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "No autorizado" };
    }

    const booking = await prisma.classBooking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        member: true,
        class: true
      }
    });

    // Si asistió, también podemos crear un registro en Attendance (opcional según lógica de negocio)
    if (status === "ATTENDED") {
      await prisma.attendance.create({
        data: {
          memberId: booking.memberId,
          classId: booking.classId,
          method: "MANUAL",
          notes: `Asistencia a clase: ${booking.class.name}`
        }
      });
    }

    return { success: true, data: booking };
  } catch (error) {
    return { success: false, error: "Error al actualizar asistencia" };
  }
}

/**
 * Obtiene el detalle de una clase y sus reservas
 */
export async function getClassWithBookingsAction(classId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "No autorizado" };
    }

    const gymClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
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
          }
        },
        trainer: true
      }
    });

    if (!gymClass) {
      return { success: false, error: "Clase no encontrada" };
    }

    return { success: true, data: gymClass };
  } catch (error) {
    return { success: false, error: "Error al obtener clase" };
  }
}

/**
 * Obtiene el detalle completo de un socio para el entrenador
 */
export async function getMemberFullDetailAction(memberId: string) {
  try {
    await verifySession(["TRAINER", "ADMIN", "SUPER_ADMIN"]);

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        routines: {
          where: { isActive: true },
          include: {
            exercises: {
              include: { 
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    muscleGroup: true,
                    demoUrl: true
                  }
                } 
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        bodyMetrics: {
          orderBy: { measuredAt: 'desc' },
          take: 5
        }
      }
    });

    if (!member) {
      return { success: false, error: "Socio no encontrado" };
    }

    return { success: true, data: serialize(member) };
  } catch (error) {
    console.error("Error fetching member detail:", error);
    return { success: false, error: "Error al obtener detalle del socio" };
  }
}
