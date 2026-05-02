"use server";

import { prisma } from "../../prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const memberSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(9, "Número de teléfono inválido"),
  dni: z.string().min(8, "DNI debe tener al menos 8 caracteres").optional().or(z.literal("")),
  birthDate: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function createMember(data: z.infer<typeof memberSchema>) {
  try {
    const validatedData = memberSchema.parse(data);
    
    const member = await prisma.member.create({
      data: {
        ...validatedData,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        // qrCode se genera automáticamente con @default(cuid()) en el esquema
      },
    });

    revalidatePath("/members");
    return { success: true, data: member };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Error al crear el miembro" };
  }
}

export async function getMembers(query?: string) {
  return prisma.member.findMany({
    where: query ? {
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { dni: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getMemberById(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: {
      memberships: {
        include: { plan: true },
        orderBy: { createdAt: "desc" }
      },
      attendances: {
        orderBy: { checkIn: "desc" },
        take: 10
      }
    }
  });
}
