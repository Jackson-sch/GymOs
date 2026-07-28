"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { serialize } from "@/lib/utils";
import { auth } from "../auth";
import { createAuditLog } from "@/lib/audit";
import { verifySession } from "@/lib/security";
import { memberSchema, type MemberInput } from "@/lib/validations/members";
import { parseISO } from "date-fns";
import { z } from "zod";
import crypto from "crypto";
import { type MemberStatus } from "@prisma/client";

function handlePrismaUniqueError(error: any, fallbackMessage: string): string {
  if (error.code === 'P2002') {
    const target = error.meta?.target;
    if (Array.isArray(target)) {
      if (target.includes("email")) return "El correo electrónico ya está registrado";
      if (target.includes("dni")) return "El DNI ya está registrado";
      if (target.includes("pin")) return "El PIN ya está en uso por otro socio";
    }
    const targetStr = typeof target === 'string' ? target : JSON.stringify(target || "");
    if (targetStr.includes("email")) return "El correo electrónico ya está registrado";
    if (targetStr.includes("dni")) return "El DNI ya está registrado";
    if (targetStr.includes("pin")) return "El PIN ya está en uso por otro socio";
    
    return "El correo, DNI o PIN ingresado ya existe en otro socio";
  }
  return fallbackMessage;
}

export async function getMembersAction(options?: { branchId?: string }) {
  try {
    const session = await verifySession();
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true }
    });

    const isSuperAdmin = dbUser?.role === "SUPER_ADMIN";
    const organizationId = isSuperAdmin ? undefined : (dbUser?.organizationId || undefined);
    const branchId = options?.branchId && options.branchId !== "ALL" ? options.branchId : undefined;

    const members = await prisma.member.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(branchId ? { branchId } : {}),
      },
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, data: serialize(members) };
  } catch (error: any) {
    console.error("Error al cargar socios:", error);
    return { success: false, error: "Error al cargar socios" };
  }
}

export async function getMemberAction(id: string) {
  try {
    await verifySession();
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { 
            plan: true,
            payments: true 
          },
          orderBy: { createdAt: "desc" }
        },
        attendances: {
          orderBy: { checkIn: "desc" },
          take: 10
        },
        bodyMetrics: {
          orderBy: { measuredAt: "desc" },
          take: 50
        },
        classBookings: {
          include: { class: true },
          orderBy: { bookedAt: "desc" },
          take: 5
        },
        routines: {
          include: {
            trainer: { select: { fullName: true } },
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!member) return { success: false, error: "Socio no encontrado" };

    return { success: true, data: serialize(member) };
  } catch (error) {
    return { success: false, error: "Error al cargar el socio" };
  }
}

export async function createMemberAction(data: MemberInput) {
  try {
    const session = await verifySession(["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"]);
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, branchId: true }
    });

    const validated = memberSchema.parse(data);

    const member = await prisma.member.create({
      data: {
        organizationId: dbUser?.organizationId || null,
        branchId: dbUser?.branchId || null,
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        dni: validated.dni,
        address: validated.address,
        photo: validated.photo,
        photoPosition: validated.photoPosition || 50,
        pin: validated.pin || null,
        birthDate: validated.birthDate ? parseISO(validated.birthDate) : null,
        status: validated.status as MemberStatus
      }
    });
    revalidatePath("/members");

    await createAuditLog({
      action: "CREATE",
      entity: "Member",
      entityId: member.id,
      newData: serialize(member)
    });

    return { success: true, data: serialize(member) };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => e.message).join(", ") };
    }
    if (error.code === 'P2002') {
      return { success: false, error: handlePrismaUniqueError(error, "El correo, DNI o PIN ya existe") };
    }
    return { success: false, error: "Error al crear socio" };
  }
}

export async function updateMemberAction(id: string, data: MemberInput) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const validated = memberSchema.parse(data);
    const oldMember = await prisma.member.findUnique({ where: { id } });

    const member = await prisma.member.update({
      where: { id },
      data: {
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        dni: validated.dni,
        address: validated.address,
        photo: validated.photo,
        photoPosition: validated.photoPosition,
        pin: validated.pin || null,
        birthDate: validated.birthDate ? parseISO(validated.birthDate) : null,
        status: validated.status as MemberStatus
      }
    });
    revalidatePath("/members");

    await createAuditLog({
      action: "UPDATE",
      entity: "Member",
      entityId: member.id,
      oldData: serialize(oldMember),
      newData: serialize(member)
    });

    return { success: true, data: serialize(member) };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => e.message).join(", ") };
    }
    if (error.code === 'P2002') {
      return { success: false, error: handlePrismaUniqueError(error, "El correo, DNI o PIN ya existe") };
    }
    return { success: false, error: "Error al actualizar socio" };
  }
}

export async function deleteMemberAction(id: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const oldMember = await prisma.member.findUnique({ where: { id } });
    if (!oldMember) return { success: false, error: "Socio no encontrado" };

    const member = await prisma.member.update({
      where: { id },
      data: { status: "DELETED" }
    });

    if (member.userId) {
      await prisma.user.update({
        where: { id: member.userId },
        data: { isActive: false }
      });
    }

    revalidatePath("/members");

    await createAuditLog({
      action: "DELETE",
      entity: "Member",
      entityId: id,
      oldData: serialize(oldMember)
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar al socio" };
  }
}

export async function searchMembersAction(query: string) {
  if (!query || query.length < 2) {
    return { success: false, error: "Búsqueda mínima de 2 caracteres" };
  }
  
  try {
    await verifySession();
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { dni: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
        ],
        status: { not: "DELETED" },
      },
      take: 10,
      select: { id: true, fullName: true, dni: true, phone: true, photo: true, qrCode: true },
    });
    return { success: true, data: serialize(members) };
  } catch (error) {
    return { success: false, error: "Error en la búsqueda" };
  }
}



export async function enablePortalAccess(memberId: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) return { success: false, error: "Socio no encontrado" };
    if (!member.email) return { success: false, error: "El socio debe tener un correo electrónico" };

    let user = await prisma.user.findUnique({
      where: { email: member.email }
    });

    if (!user) {
      try {
        // Usar el DNI como contraseña inicial para que el socio ingrese y luego cambie la clave
        const initialPassword = member.dni || (crypto.randomBytes(16).toString("hex") + "A1!");
        const res = await auth.api.signUpEmail({
          body: {
            email: member.email,
            password: initialPassword,
            name: member.fullName,
          }
        });
        user = res.user as any;
      } catch (err: any) {
        return { success: false, error: "El correo ya está registrado en otra cuenta o la contraseña es inválida" };
      }
    }

    if (!user) return { success: false, error: "Error al crear usuario en el sistema de autenticación" };

    // Asegurar rol MEMBER, link y forzar cambio de contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "MEMBER", mustChangePassword: true, emailVerified: true, isActive: true }
    });

    await prisma.member.update({
      where: { id: memberId },
      data: { userId: user.id }
    });

    revalidatePath(`/members/${memberId}`);

    await createAuditLog({
      action: "ENABLE_PORTAL_ACCESS",
      entity: "Member",
      entityId: memberId,
      newData: { userId: user.id, email: member.email }
    });

    return { success: true, message: "Acceso al portal habilitado y correo de configuración enviado" };
  } catch (error: any) {
    console.error("Error enabling portal access:", error);
    return { success: false, error: error.message || "Error al habilitar acceso" };
  }
}

export async function disablePortalAccess(memberId: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) return { success: false, error: "Socio no encontrado" };
    if (!member.userId) return { success: false, error: "El socio no tiene acceso habilitado" };

    const userId = member.userId;

    // Desvincular en el socio
    await prisma.member.update({
      where: { id: memberId },
      data: { userId: null }
    });

    // Eliminar sesiones del usuario para cerrar la sesión
    await prisma.session.deleteMany({
      where: { userId }
    });

    // Eliminar el usuario de la base de datos si es posible, si no, desactivarlo
    try {
      await prisma.user.delete({
        where: { id: userId }
      });
    } catch (err) {
      after(() => console.warn("Could not delete user record, deactivating instead:", err));
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });
    }

    revalidatePath(`/members/${memberId}`);

    await createAuditLog({
      action: "DISABLE_PORTAL_ACCESS",
      entity: "Member",
      entityId: memberId,
      newData: { userId: null, previousUserId: userId }
    });

    return { success: true, message: "Acceso al portal revocado correctamente" };
  } catch (error: any) {
    console.error("Error disabling portal access:", error);
    return { success: false, error: error.message || "Error al revocar acceso" };
  }
}

export async function getMembersStatsAction(options?: { branchId?: string }) {
  try {
    const session = await verifySession();
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true }
    });

    const isSuperAdmin = dbUser?.role === "SUPER_ADMIN";
    const organizationId = isSuperAdmin ? undefined : (dbUser?.organizationId || undefined);
    const branchId = options?.branchId && options.branchId !== "ALL" ? options.branchId : undefined;

    const whereClause = {
      ...(organizationId ? { organizationId } : {}),
      ...(branchId ? { branchId } : {}),
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, newThisMonth] = await Promise.all([
      prisma.member.count({ where: whereClause }),
      prisma.member.count({ where: { ...whereClause, status: "ACTIVE" } }),
      prisma.member.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: startOfMonth
          }
        }
      })
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        newThisMonth
      }
    };
  } catch (error) {
    console.error("Error fetching member stats:", error);
    return { success: false, error: "Error al cargar estadísticas" };
  }
}

export async function toggleMemberStatusAction(id: string, status: MemberStatus) {
  try {
    const allowedRoles = status === "DELETED" ? ["ADMIN", "SUPER_ADMIN"] : ["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"];
    await verifySession(allowedRoles);
    const oldMember = await prisma.member.findUnique({ where: { id } });
    if (!oldMember) return { success: false, error: "Socio no encontrado" };

    const member = await prisma.member.update({
      where: { id },
      data: { status: status }
    });
    revalidatePath("/members");
    revalidatePath(`/members/${id}`);

    await createAuditLog({
      action: "UPDATE_STATUS",
      entity: "Member",
      entityId: id,
      oldData: serialize(oldMember),
      newData: serialize(member)
    });

    return { success: true, data: serialize(member) };
  } catch (error) {
    return { success: false, error: "Error al cambiar estado del socio" };
  }
}
