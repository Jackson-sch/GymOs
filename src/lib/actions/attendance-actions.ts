"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";



export async function getRecentAttendanceAction() {
  try {
    const attendance = await prisma.attendance.findMany({
      take: 20,
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
