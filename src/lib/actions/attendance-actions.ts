"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import { verifySession } from "@/lib/security";
import { startOfDay } from "date-fns";



export async function getRecentAttendanceAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
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
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
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
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    const [totalToday, activeMembersWithBirthdays, planDist] = await Promise.all([
      // Total check-ins today
      prisma.attendance.count({
        where: { checkIn: { gte: todayStart } }
      }),
      // Members with birthdays today
      prisma.member.findMany({
        where: {
          status: "ACTIVE",
          birthDate: { not: null }
        },
        select: { birthDate: true }
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

    const birthdaysTodayCount = activeMembersWithBirthdays.filter(m => m.birthDate && m.birthDate.getMonth() === todayMonth && m.birthDate.getDate() === todayDay).length;

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
        birthdaysToday: birthdaysTodayCount,
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
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
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
    // 1. Find member by DNI, QR Code, or PIN
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { dni: code },
          { qrCode: code },
          { pin: code }
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

    const methodUsed = member.pin === code ? "PIN" : "QR";

    // Verificación de Anti-Spam / Rate Limiting (2 minutos)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recentCheckIn = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        checkIn: { gte: twoMinutesAgo }
      }
    });

    if (recentCheckIn) {
      return {
        success: true,
        status: "DENIED",
        member: { fullName: member.fullName, photo: member.photo },
        reason: "Ya registraste tu ingreso hace unos instantes"
      };
    }

    // 2. Register attendance
    await prisma.attendance.create({
      data: {
        memberId: member.id,
        method: methodUsed,
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

export async function markClassAttendanceAction(data: {
  classId: string;
  memberId: string;
  attended: boolean;
}) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el estado de la reserva
      const booking = await tx.classBooking.update({
        where: {
          classId_memberId: {
            classId: data.classId,
            memberId: data.memberId
          }
        },
        data: {
          status: data.attended ? "ATTENDED" : "CONFIRMED"
        }
      });

      // 2. Crear o eliminar el registro de asistencia correspondiente
      if (data.attended) {
        await tx.attendance.create({
          data: {
            memberId: data.memberId,
            classId: data.classId,
            method: "MANUAL",
            notes: "Asistencia a clase registrada por entrenador"
          }
        });
      } else {
        await tx.attendance.deleteMany({
          where: {
            memberId: data.memberId,
            classId: data.classId
          }
        });
      }

      return booking;
    });

    revalidatePath("/attendance");
    revalidatePath(`/portal/trainer/classes/${data.classId}/attendance`);
    
    return { success: true, data: serialize(result) };
  } catch (error: any) {
    console.error("Error marking class attendance:", error);
    return { success: false, error: "Error al registrar asistencia" };
  }
}
