"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bodyMetricSchema = z.object({
  memberId: z.string(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  bmi: z.number().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscle: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

export async function getBodyMetrics(memberId: string) {
  return await prisma.bodyMetric.findMany({
    where: { memberId },
    orderBy: { measuredAt: "desc" },
  });
}

export async function getLatestBodyMetric(memberId: string) {
  return await prisma.bodyMetric.findFirst({
    where: { memberId },
    orderBy: { measuredAt: "desc" },
  });
}

export async function createBodyMetric(data: {
  memberId: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  muscle?: number;
  notes?: string;
}) {
  const parsed = bodyMetricSchema.parse(data);
  
  const bmi = parsed.weight && parsed.height 
    ? calculateBMI(parsed.weight, parsed.height)
    : undefined;
  
  const metric = await prisma.bodyMetric.create({
    data: {
      ...parsed,
      bmi,
    },
  });
  
  revalidatePath(`/members/${parsed.memberId}`);
  return { success: true, data: metric };
}

export async function updateBodyMetric(id: string, data: Partial<z.infer<typeof bodyMetricSchema>>) {
  const parsed = bodyMetricSchema.partial().parse(data);
  
  const existing = await prisma.bodyMetric.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Métrica no encontrada" };
  }
  
  let bmi = parsed.bmi;
  if (!bmi && parsed.weight && parsed.height) {
    bmi = calculateBMI(parsed.weight, parsed.height);
  }
  
  const metric = await prisma.bodyMetric.update({
    where: { id },
    data: { ...parsed, bmi },
  });
  
  revalidatePath(`/members/${existing.memberId}`);
  return { success: true, data: metric };
}

export async function deleteBodyMetric(id: string) {
  const existing = await prisma.bodyMetric.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Métrica no encontrada" };
  }
  
  await prisma.bodyMetric.delete({ where: { id } });
  
  revalidatePath(`/members/${existing.memberId}`);
  return { success: true };
}