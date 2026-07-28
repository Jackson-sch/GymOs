"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import { verifySession } from "../security";


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
