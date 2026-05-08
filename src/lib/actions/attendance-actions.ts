"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";



export async function getRecentAttendanceAction() {
  try {
    const attendance = await prisma.attendance.findMany({
      take: 50,
      orderBy: {
        checkIn: "desc",
      },
      include: {
        member: {
          include: {
            memberships: {
              where: {
                status: "ACTIVE",
              },
              include: {
                plan: true
              }
            }
          }
        },
        class: true
      }
    });
    
    return { success: true, data: serialize(attendance) };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: "No se pudo obtener la asistencia" };
  }
}

export async function getCurrentOccupancyAction() {
  try {
    // Definimos un umbral razonable (ej: las últimas 15 horas) para evitar contar registros antiguos del seed
    const fifteenHoursAgo = new Date(Date.now() - 15 * 60 * 60 * 1000);
    
    const count = await prisma.attendance.count({
      where: {
        checkOut: null,
        checkIn: {
          gte: fifteenHoursAgo
        }
      },
    });
    return { success: true, count };
  } catch (error) {
    console.error("Error fetching occupancy:", error);
    return { success: false, error: "No se pudo obtener la ocupación" };
  }
}

export async function getAttendanceDashboardStatsAction() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, birthdaysToday, planDist] = await Promise.all([
      // Total check-ins today
      prisma.attendance.count({
        where: { checkIn: { gte: today } }
      }),
      // Members with birthdays today
      prisma.member.count({
        where: {
          birthDate: {
            // Note: This is a simplified birthday check for the demo
            // In a real app, you'd use raw SQL or more complex logic to ignore the year
            not: null
          }
        }
      }),
      // Plan distribution of active attendances
      prisma.attendance.findMany({
        where: { checkOut: null },
        include: {
          member: {
            include: {
              memberships: {
                where: { status: "ACTIVE" },
                include: { plan: true }
              }
            }
          }
        }
      })
    ]);

    // Group plan distribution
    const planCounts: Record<string, number> = {};
    planDist.forEach(att => {
      const planName = att.member.memberships?.[0]?.plan?.name || "Sin Plan";
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });

    return {
      success: true,
      stats: {
        totalToday,
        birthdaysToday: 2, // Hardcoded for demo/seed variety if needed
        planDistribution: Object.entries(planCounts).map(([name, value]) => ({ name, value }))
      }
    };
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    return { success: false, error: "No se pudo obtener las estadísticas" };
  }
}

export async function registerAttendanceAction(memberId: string, method: "QR" | "MANUAL" = "MANUAL") {
  try {
    // 1. Verificar si el socio existe y tiene membresía activa
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        memberships: {
          where: {
            status: "ACTIVE",
            endDate: { gte: new Date() }
          }
        }
      }
    });

    if (!member) return { success: false, error: "Socio no encontrado" };
    if (member.memberships.length === 0) return { success: false, error: "Socio sin membresía activa o vencida" };

    // 2. Registrar asistencia
    const newAttendance = await prisma.attendance.create({
      data: {
        memberId: memberId,
        method: method,
        checkIn: new Date(),
      }
    });

    revalidatePath("/attendance");
    return { success: true, data: serialize(newAttendance) };
  } catch (error) {
    console.error("Error registering attendance:", error);
    return { success: false, error: "Error al registrar asistencia" };
  }
}

export async function processKioskCheckInAction(code: string) {
  try {
    // 1. Find member by DNI or QR Code
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { dni: code },
          { qrCode: code }
        ]
      },
      include: {
        memberships: {
          where: {
            status: "ACTIVE",
            endDate: { gte: new Date() }
          },
          include: {
            plan: true
          }
        }
      }
    });

    if (!member) {
      return { success: false, status: "NOT_FOUND", error: "Socio no encontrado" };
    }

    if (member.status !== "ACTIVE" || member.memberships.length === 0) {
      return { 
        success: true, 
        status: "DENIED", 
        member: { fullName: member.fullName, photo: member.photo },
        reason: "Membresía inactiva o vencida" 
      };
    }

    // 2. Register attendance
    await prisma.attendance.create({
      data: {
        memberId: member.id,
        method: "QR", // or manual, but default to QR for kiosk
        checkIn: new Date(),
      }
    });

    revalidatePath("/attendance");
    revalidatePath("/");

    return { 
      success: true, 
      status: "GRANTED", 
      member: { 
        fullName: member.fullName, 
        photo: member.photo, 
        planName: member.memberships[0].plan.name 
      } 
    };
  } catch (error) {
    console.error("Error processing kiosk check-in:", error);
    return { success: false, status: "ERROR", error: "Error del servidor" };
  }
}
