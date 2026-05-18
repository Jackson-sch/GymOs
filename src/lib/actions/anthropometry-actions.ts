"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/security";

export async function addBodyMetricAction(data: {
  memberId: string;
  weight?: number;
  height?: number;
  bmi?: number;
  bodyFat?: number;
  muscle?: number;
  notes?: string;
  photoFrontUrl?: string;
  photoBackUrl?: string;
  photoSideUrl?: string;
}) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER", "RECEPTIONIST"]);
    const metric = await prisma.bodyMetric.create({
      data: {
        memberId: data.memberId,
        weight: data.weight || null,
        height: data.height || null,
        bmi: data.bmi || null,
        bodyFat: data.bodyFat || null,
        muscle: data.muscle || null,
        notes: data.notes || null,
        photoFrontUrl: data.photoFrontUrl || null,
        photoBackUrl: data.photoBackUrl || null,
        photoSideUrl: data.photoSideUrl || null,
      }
    });

    revalidatePath(`/members/${data.memberId}`);
    return { success: true, metric };
  } catch (error) {
    console.error("Error adding body metric:", error);
    return { success: false, error: "No se pudo guardar la medida" };
  }
}

export async function getBodyMetricsAction(memberId: string) {
  try {
    await verifySession();
    const metrics = await prisma.bodyMetric.findMany({
      where: { memberId },
      orderBy: { measuredAt: "asc" }
    });

    return { success: true, metrics };
  } catch (error) {
    console.error("Error fetching body metrics:", error);
    return { success: false, error: "No se pudo obtener el progreso" };
  }
}
