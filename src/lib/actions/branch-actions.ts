"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTenant, verifySession } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";

/**
 * Obtiene todas las sedes / sucursales de la organización activa
 */
export async function getBranchesAction() {
  try {
    const { organizationId } = await getCurrentTenant();
    if (!organizationId) {
      return { success: false, error: "Organización no identificada" };
    }

    const branches = await prisma.branch.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            members: true,
            trainers: true,
            classes: true,
            attendances: true,
            payments: true,
          }
        }
      }
    });

    return { success: true, data: serialize(branches) };
  } catch (error: any) {
    console.error("Error obteniendo sedes:", error);
    return { success: false, error: error.message || "Error al obtener sedes" };
  }
}

/**
 * Crea una nueva sede / sucursal física para el gimnasio
 */
export async function createBranchAction(data: {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  try {
    const { organizationId } = await getCurrentTenant();
    if (!organizationId) {
      return { success: false, error: "Organización no identificada" };
    }

    await verifySession(["ADMIN", "SUPER_ADMIN"]);

    if (!data.name || !data.slug) {
      return { success: false, error: "Nombre y slug de la sede son requeridos" };
    }

    const cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    const existingBranch = await prisma.branch.findFirst({
      where: { organizationId, slug: cleanSlug }
    });

    if (existingBranch) {
      return { success: false, error: `La sede con identificador '${cleanSlug}' ya existe` };
    }

    const branch = await prisma.branch.create({
      data: {
        organizationId,
        name: data.name,
        slug: cleanSlug,
        address: data.address,
        phone: data.phone,
        email: data.email,
        isActive: true,
      }
    });

    revalidatePath("/branches");
    revalidatePath("/settings");
    return {
      success: true,
      message: `Sede '${branch.name}' creada exitosamente`,
      data: serialize(branch)
    };
  } catch (error: any) {
    console.error("Error creando sede:", error);
    return { success: false, error: error.message || "Error al registrar la sede" };
  }
}

/**
 * Edita los datos de una sede física existente
 */
export async function updateBranchAction(data: {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}) {
  try {
    const { organizationId } = await getCurrentTenant();
    if (!organizationId) {
      return { success: false, error: "Organización no identificada" };
    }

    await verifySession(["ADMIN", "SUPER_ADMIN"]);

    if (!data.id || !data.name || !data.slug) {
      return { success: false, error: "ID, nombre y slug son requeridos" };
    }

    const cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    const existingBranch = await prisma.branch.findFirst({
      where: {
        organizationId,
        slug: cleanSlug,
        NOT: { id: data.id }
      }
    });

    if (existingBranch) {
      return { success: false, error: `El slug '${cleanSlug}' ya está asignado a otra sede` };
    }

    const updated = await prisma.branch.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: cleanSlug,
        address: data.address,
        phone: data.phone,
        email: data.email,
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      }
    });

    revalidatePath("/branches");
    revalidatePath("/settings");
    return {
      success: true,
      message: `Sede '${updated.name}' actualizada con éxito`,
      data: serialize(updated)
    };
  } catch (error: any) {
    console.error("Error actualizando sede:", error);
    return { success: false, error: error.message || "Error al actualizar la sede" };
  }
}

/**
 * Elimina o archiva una sede física de la organización
 */
export async function deleteBranchAction(branchId: string) {
  try {
    const { organizationId } = await getCurrentTenant();
    if (!organizationId) {
      return { success: false, error: "Organización no identificada" };
    }

    await verifySession(["ADMIN", "SUPER_ADMIN"]);

    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch || branch.organizationId !== organizationId) {
      return { success: false, error: "Sede no encontrada" };
    }

    await prisma.branch.delete({
      where: { id: branchId }
    });

    revalidatePath("/branches");
    revalidatePath("/settings");
    return {
      success: true,
      message: `Sede '${branch.name}' eliminada correctamente`
    };
  } catch (error: any) {
    console.error("Error eliminando sede:", error);
    return { success: false, error: error.message || "Error al eliminar la sede" };
  }
}

/**
 * Obtiene métricas comparativas financieras y de asistencia por sede física
 */
export async function getBranchAnalyticsAction() {
  try {
    const { organizationId } = await getCurrentTenant();
    if (!organizationId) {
      return { success: false, error: "Organización no identificada" };
    }

    await verifySession(["ADMIN", "SUPER_ADMIN"]);

    const branches = await prisma.branch.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            members: true,
            attendances: true,
            payments: true,
            trainers: true,
          }
        }
      }
    });

    // Calcular facturación acumulada por sede
    const analytics = await Promise.all(
      branches.map(async (branch) => {
        const revenueAgg = await prisma.payment.aggregate({
          where: {
            branchId: branch.id,
            status: "COMPLETED"
          },
          _sum: { amount: true }
        });

        return {
          id: branch.id,
          name: branch.name,
          slug: branch.slug,
          address: branch.address,
          phone: branch.phone,
          isActive: branch.isActive,
          totalMembers: branch._count.members,
          totalAttendances: branch._count.attendances,
          totalTrainers: branch._count.trainers,
          totalRevenue: Number(revenueAgg._sum.amount || 0),
        };
      })
    );

    return { success: true, data: serialize(analytics) };
  } catch (error: any) {
    console.error("Error obteniendo analítica por sedes:", error);
    return { success: false, error: error.message || "Error al obtener analítica" };
  }
}
