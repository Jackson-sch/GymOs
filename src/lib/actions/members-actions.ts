"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import { auth } from "../auth";
import { createAuditLog } from "@/lib/audit";
import { verifySession } from "@/lib/security";
import { memberSchema } from "@/lib/validations/members";



export async function getMembersAction() {
  try {
    await verifySession();
    const members = await prisma.member.findMany({
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
  } catch (error) {
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
          include: { plan: true },
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
        }
      }
    });

    if (!member) return { success: false, error: "Socio no encontrado" };

    return { success: true, data: serialize(member) };
  } catch (error) {
    return { success: false, error: "Error al cargar el socio" };
  }
}

export async function createMemberAction(data: any) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const validated = memberSchema.parse(data);

    const member = await prisma.member.create({
      data: {
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        dni: validated.dni,
        address: validated.address,
        photo: validated.photo,
        photoPosition: validated.photoPosition || 50,
        birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
        status: validated.status as any
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
    if (error.code === 'P2002') return { success: false, error: "El Email o DNI ya existe" };
    return { success: false, error: "Error al crear socio" };
  }
}

export async function updateMemberAction(id: string, data: any) {
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
        birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
        status: validated.status as any
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
  } catch (error) {
    return { success: false, error: "Error al actualizar socio" };
  }
}

export async function deleteMemberAction(id: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const oldMember = await prisma.member.findUnique({ where: { id } });
    await prisma.member.delete({ where: { id } });
    revalidatePath("/members");

    await createAuditLog({
      action: "DELETE",
      entity: "Member",
      entityId: id,
      oldData: serialize(oldMember)
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar (tiene registros asociados)" };
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
        status: "ACTIVE",
      },
      take: 10,
      select: { id: true, fullName: true, dni: true, phone: true, photo: true, qrCode: true },
    });
    return { success: true, data: serialize(members) };
  } catch (error) {
    return { success: false, error: "Error en la búsqueda" };
  }
}

export async function getMemberPortalStatus(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { userId: true, email: true }
  });
  
  if (!member) return { success: false, error: "Socio no encontrado" };
  
  const hasUser = !!member.userId;
  return { success: true, hasUser, email: member.email };
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
      const res = await auth.api.signUpEmail({
        body: {
          email: member.email,
          password: member.dni || "gymos123", // DNI as default password
          name: member.fullName,
        }
      });
      user = res.user as any;
    }

    if (!user) return { success: false, error: "Error al crear usuario" };

    // Asegurar rol MEMBER y link
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "MEMBER" }
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

    return { success: true, message: "Acceso al portal habilitado" };
  } catch (error: any) {
    console.error("Error enabling portal access:", error);
    return { success: false, error: error.message || "Error al habilitar acceso" };
  }
}
