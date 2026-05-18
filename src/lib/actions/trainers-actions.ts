"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/security";
import { serialize } from "@/lib/utils";

const trainerSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  dni: z.string().min(6, "DNI/Documento debe tener al menos 6 caracteres").or(z.literal("")).nullish(),
  phone: z.string().min(6, "Teléfono requerido"),
  photo: z.string().nullish(),
  photoPosition: z.number().nullish(),
  specialties: z.array(z.string()).nullish(),
  bio: z.string().nullish(),
  commissionPct: z.number().min(0).max(100).nullish(),
  baseSalary: z.number().min(0).nullish(),
  perClassRate: z.number().min(0).nullish(),
  isActive: z.boolean().default(true),
});

// Helper to clean null values to undefined for Prisma compatibility
function cleanTrainerData<T extends Record<string, any>>(data: T) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, v === "" ? null : v])
  );
}


export async function getTrainersAction() {
  try {
    await verifySession();
    const trainers = await prisma.trainer.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
    });
    return { success: true, data: serialize(trainers) };
  } catch (error) {
    return { success: false, error: "Error al cargar staff" };
  }
}

export async function getTrainers() {
  try {
    await verifySession();
    const trainers = await prisma.trainer.findMany({
      orderBy: { fullName: "asc" },
    });

    const emails = trainers.map(t => t.email);
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, isActive: true }
    });

    return serialize(trainers.map(t => {
      const user = users.find(u => u.email === t.email);
      return {
        ...t,
        hasPortalAccess: !!user && user.isActive
      };
    }));
  } catch (error) {
    return [];
  }
}

export async function getTrainerById(id: string) {
  try {
    await verifySession();
    const trainer = await prisma.trainer.findUnique({
      where: { id },
      include: { 
        classes: {
          include: {
            _count: {
              select: { bookings: true }
            },
            bookings: {
              select: { memberId: true }
            }
          },
          orderBy: { startTime: "desc" },
          take: 100,
        }
      },
    });
    return serialize(trainer);
  } catch (error) {
    return null;
  }
}

export async function createTrainer(data: z.infer<typeof trainerSchema>) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const parsed = trainerSchema.parse(data);
  
  const existingEmail = await prisma.trainer.findUnique({
    where: { email: parsed.email },
  });
  
  if (existingEmail) {
    return { success: false, error: "El email ya está registrado" };
  }

  if (parsed.dni) {
    const existingDni = await prisma.trainer.findUnique({
      where: { dni: parsed.dni },
    });
    if (existingDni) {
      return { success: false, error: "El DNI ya está registrado" };
    }
  }
  
  const trainer = await prisma.trainer.create({
    data: {
      ...cleanTrainerData(parsed),
      specialties: parsed.specialties || [],
    } as any, // Cast to avoid strict Prisma type issues with the dynamic cleaning
  });
  
  revalidatePath("/trainers");
  return { success: true, data: trainer };
  } catch (error: any) {
    console.error("Error creating trainer:", error);
    return { success: false, error: error.message || "Error al crear entrenador" };
  }
}

export async function updateTrainer(id: string, data: Partial<z.infer<typeof trainerSchema>>) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const parsed = trainerSchema.partial().parse(data);
  const cleanData = cleanTrainerData(parsed);
  
  const existing = await prisma.trainer.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Entrenador no encontrado" };
  }
  
  if (parsed.email && parsed.email !== existing.email) {
    const emailInUse = await prisma.trainer.findUnique({
      where: { email: parsed.email },
    });
    if (emailInUse) {
      return { success: false, error: "El email ya está en uso" };
    }
  }

  if (parsed.dni && parsed.dni !== existing.dni) {
    const dniInUse = await prisma.trainer.findUnique({
      where: { dni: parsed.dni },
    });
    if (dniInUse) {
      return { success: false, error: "El DNI ya está en uso" };
    }
  }
  
  const trainer = await prisma.trainer.update({
    where: { id },
    data: cleanData as any,
  });
  
  revalidatePath("/trainers");
  revalidatePath(`/trainers/${id}`);
  return { success: true, data: trainer };
  } catch (error: any) {
    console.error("Error updating trainer:", error);
    return { success: false, error: error.message || "Error al actualizar entrenador" };
  }
}

export async function deleteTrainer(id: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const existing = await prisma.trainer.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Entrenador no encontrado" };
  }
  
  await prisma.trainer.update({
    where: { id },
    data: { isActive: false },
  });
  
  revalidatePath("/trainers");
  return { success: true };
  } catch (error: any) {
    console.error("Error deleting trainer:", error);
    return { success: false, error: error.message || "Error al eliminar entrenador" };
  }
}

export async function getTrainersStatsAction() {
  try {
    await verifySession();
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [totalStaff, classesToday] = await Promise.all([
      prisma.trainer.count({ where: { isActive: true } }),
      prisma.class.count({
        where: {
          startTime: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      })
    ]);

    // Calcular especialidades únicas
    const trainers = await prisma.trainer.findMany({
      where: { isActive: true },
      select: { specialties: true }
    });
    
    const allSpecialties = new Set(trainers.flatMap(t => t.specialties));

    return {
      success: true,
      data: {
        totalStaff,
        classesToday,
        specialtiesCount: allSpecialties.size
      }
    };
  } catch (error) {
    console.error("Error fetching trainers stats:", error);
    return { success: false, error: "Error al cargar estadísticas" };
  }
}

export async function enableTrainerPortalAccessAction(trainerId: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId }
    });

    if (!trainer) return { success: false, error: "Entrenador no encontrado" };
    if (!trainer.email) return { success: false, error: "El entrenador debe tener un correo electrónico" };

    const { auth } = await import("@/lib/auth");

    let user = await prisma.user.findUnique({
      where: { email: trainer.email }
    });

    if (!user) {
      const secureRandomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "T1#";
      const res = await auth.api.signUpEmail({
        body: {
          email: trainer.email,
          password: secureRandomPassword,
          name: trainer.fullName,
        }
      });
      user = res.user as any;

      try {
        await auth.api.requestPasswordReset({
          body: {
            email: trainer.email,
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
          }
        });
      } catch (resetErr) {
        console.error("Aviso: No se pudo enviar correo de bienvenida/reset para staff:", resetErr);
      }
    }

    if (!user) return { success: false, error: "Error al crear usuario" };

    // Asegurar rol TRAINER y activar
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        role: "TRAINER",
        isActive: true 
      }
    });

    revalidatePath(`/trainers`);

    return { success: true, message: "Acceso al portal habilitado" };
  } catch (error: any) {
    console.error("Error enabling trainer portal access:", error);
    return { success: false, error: error.message || "Error al habilitar acceso" };
  }
}

export async function disableTrainerPortalAccessAction(trainerId: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId }
    });

    if (!trainer) return { success: false, error: "Entrenador no encontrado" };

    const user = await prisma.user.findUnique({
      where: { email: trainer.email }
    });

    if (!user) return { success: false, error: "No existe un usuario vinculado a este entrenador" };

    // Desactivar usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false }
    });

    revalidatePath(`/trainers`);

    return { success: true, message: "Acceso al portal deshabilitado" };
  } catch (error: any) {
    console.error("Error disabling trainer portal access:", error);
    return { success: false, error: error.message || "Error al deshabilitar acceso" };
  }
}