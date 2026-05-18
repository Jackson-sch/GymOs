"use server";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import { addDays } from "date-fns";
import { z } from "zod";

const publicRegistrationSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es muy corto"),
  email: z.string().email("Correo electrónico no válido"),
  phone: z.string().min(6, "Número de teléfono no válido"),
  dni: z.string().min(6, "DNI/Documento no válido"),
  planId: z.string().optional()
});

export async function getPublicPlansAction() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" }
    });
    return { success: true, data: serialize(plans) };
  } catch (err) {
    return { success: false, error: "Error al cargar planes disponibles" };
  }
}

export async function registerPublicMemberAction(data: z.infer<typeof publicRegistrationSchema>) {
  try {
    const validated = publicRegistrationSchema.parse(data);

    // 1. Find User created by Better Auth client
    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (!user) {
      return { success: false, error: "La cuenta de usuario no pudo ser localizada en el sistema." };
    }

    // 2. Update User role to MEMBER
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "MEMBER" }
    });

    // 3. Verify if member already exists
    const existingMember = await prisma.member.findFirst({
      where: {
        OR: [
          { email: validated.email },
          { dni: validated.dni }
        ]
      }
    });

    if (existingMember) {
      return { success: false, error: "Ya existe un socio registrado con este correo o DNI en el sistema." };
    }

    const member = await prisma.member.create({
      data: {
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        dni: validated.dni,
        status: "ACTIVE",
        userId: user.id
      }
    });

    // 4. If planId is selected, create initial membership
    if (validated.planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: validated.planId }
      });
      if (plan) {
        const now = new Date();
        await prisma.membership.create({
          data: {
            memberId: member.id,
            planId: plan.id,
            startDate: now,
            endDate: addDays(now, plan.durationDays),
            status: "PENDING", // PENDING until paid online or in person
            price: plan.price
          }
        });
      }
    }

    return { success: true, message: "¡Registro exitoso! Bienvenido a la plataforma digital de GymOS." };
  } catch (error: any) {
    return { success: false, error: error.message || "Error en el procesamiento del registro público" };
  }
}
