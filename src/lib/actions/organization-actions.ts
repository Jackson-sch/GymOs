"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import crypto from "crypto";

/**
 * Obtiene métricas ejecutivas globales del SaaS para el Super Admin
 */
export async function getSuperAdminStatsAction() {
  try {
    await verifySession(["SUPER_ADMIN"]);

    const [
      totalOrganizations,
      activeOrganizations,
      totalMembers,
      totalUsers,
      totalPayments,
      activeOrgsList
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.member.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true }
      }),
      prisma.organization.findMany({
        where: { isActive: true }
      })
    ]);

    const totalRevenue = Number(totalPayments._sum.amount || 0);
    const estimatedMRR = activeOrgsList.reduce(
      (sum, org: any) => sum + Number(org.monthlyPrice ?? 99),
      0
    );

    return {
      success: true,
      data: {
        totalOrganizations,
        activeOrganizations,
        totalMembers,
        totalUsers,
        totalRevenue,
        estimatedMRR,
      }
    };
  } catch (error: any) {
    console.error("Error al obtener métricas de Super Admin:", error);
    return { success: false, error: error.message || "No autorizado" };
  }
}

/**
 * Obtiene la lista completa de Gimnasios / Tenants registrados
 */
export async function getOrganizationsAction() {
  try {
    await verifySession(["SUPER_ADMIN"]);

    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: true,
            users: true,
            plans: true,
            trainers: true,
          }
        },
        users: {
          where: { role: "ADMIN" },
          take: 1,
          select: { email: true, name: true }
        }
      }
    });

    return { success: true, data: serialize(organizations) };
  } catch (error: any) {
    console.error("Error al obtener organizaciones:", error);
    return { success: false, error: error.message || "No autorizado" };
  }
}

/**
 * Crea un nuevo Gimnasio (Tenant) y le genera su cuenta Administradora inicial
 */
export async function createOrganizationAction(data: {
  name: string;
  slug: string;
  subdomain?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  planTier?: "STARTER" | "PRO" | "ENTERPRISE";
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
}) {
  try {
    await verifySession(["SUPER_ADMIN"]);

    if (!data.name || !data.slug || !data.adminEmail || !data.adminName) {
      return { success: false, error: "Nombre del gimnasio, slug y datos del administrador son requeridos" };
    }

    const cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    const existingOrg = await prisma.organization.findUnique({
      where: { slug: cleanSlug }
    });

    if (existingOrg) {
      return { success: false, error: `El identificador/slug '${cleanSlug}' ya está registrado` };
    }

    const tier = data.planTier || "PRO";
    const tierLimits = {
      STARTER: { maxMembers: 150, maxTrainers: 3, monthlyPrice: 49.00 },
      PRO: { maxMembers: 500, maxTrainers: 10, monthlyPrice: 99.00 },
      ENTERPRISE: { maxMembers: 99999, maxTrainers: 999, monthlyPrice: 199.00 },
    }[tier];

    // 1. Crear Organización en la BD
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: cleanSlug,
        subdomain: data.subdomain || cleanSlug,
        email: data.email,
        phone: data.phone,
        address: data.address,
        logo: data.logo,
        planTier: tier,
        maxMembers: tierLimits.maxMembers,
        maxTrainers: tierLimits.maxTrainers,
        monthlyPrice: tierLimits.monthlyPrice,
        isActive: true,
      }
    });

    // 2. Crear usuario Administrador inicial para este Gimnasio
    const { auth } = await import("@/lib/auth");
    const initialPassword = data.adminPassword || (crypto.randomBytes(10).toString("hex") + "G1#");

    let user = await prisma.user.findUnique({
      where: { email: data.adminEmail }
    });

    if (!user) {
      const res = await auth.api.signUpEmail({
        body: {
          email: data.adminEmail,
          password: initialPassword,
          name: data.adminName,
        }
      });
      user = res.user as any;
    }

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          organizationId: organization.id,
          emailVerified: true,
          mustChangePassword: true,
        }
      });
    }

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Gimnasio '${organization.name}' registrado exitosamente con Plan SaaS ${tier}`,
      data: {
        organization: serialize(organization),
        adminEmail: data.adminEmail,
        initialPassword: data.adminPassword ? "*****" : initialPassword,
      }
    };
  } catch (error: any) {
    console.error("Error creando organización:", error);
    return { success: false, error: error.message || "Error al crear el gimnasio" };
  }
}

/**
 * Cambia el Plan SaaS de un Gimnasio Client (STARTER, PRO, ENTERPRISE)
 */
export async function updateOrganizationPlanTierAction(
  organizationId: string,
  planTier: "STARTER" | "PRO" | "ENTERPRISE"
) {
  try {
    await verifySession(["SUPER_ADMIN"]);

    const tierLimits = {
      STARTER: { maxMembers: 150, maxTrainers: 3, monthlyPrice: 49.00 },
      PRO: { maxMembers: 500, maxTrainers: 10, monthlyPrice: 99.00 },
      ENTERPRISE: { maxMembers: 99999, maxTrainers: 999, monthlyPrice: 199.00 },
    }[planTier];

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        planTier,
        maxMembers: tierLimits.maxMembers,
        maxTrainers: tierLimits.maxTrainers,
        monthlyPrice: tierLimits.monthlyPrice,
      }
    });

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Plan SaaS actualizado a ${planTier} ($${tierLimits.monthlyPrice}/mes)`,
      data: serialize(updated),
    };
  } catch (error: any) {
    console.error("Error cambiando plan SaaS de organización:", error);
    return { success: false, error: error.message || "Error al actualizar plan SaaS" };
  }
}

/**
 * Edita la información general de un Gimnasio (Nombre, Slug, Subdominio, Email, Teléfono, Dirección, Logo)
 */
export async function updateOrganizationDetailsAction(data: {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  planTier?: "STARTER" | "PRO" | "ENTERPRISE";
}) {
  try {
    await verifySession(["SUPER_ADMIN"]);

    if (!data.id || !data.name || !data.slug) {
      return { success: false, error: "ID, nombre y slug son requeridos" };
    }

    const cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    const existingOrg = await prisma.organization.findFirst({
      where: {
        slug: cleanSlug,
        NOT: { id: data.id }
      }
    });

    if (existingOrg) {
      return { success: false, error: `El slug '${cleanSlug}' ya pertenece a otro gimnasio` };
    }

    const updated = await prisma.organization.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: cleanSlug,
        subdomain: data.subdomain || cleanSlug,
        email: data.email,
        phone: data.phone,
        address: data.address,
        logo: data.logo,
        ...(data.planTier ? { planTier: data.planTier } : {}),
      }
    });

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Gimnasio '${updated.name}' actualizado con éxito`,
      data: serialize(updated)
    };
  } catch (error: any) {
    console.error("Error actualizando organización:", error);
    return { success: false, error: error.message || "Error al actualizar información del gimnasio" };
  }
}

/**
 * Elimina permanentemente una Organización / Gimnasio Client
 */
export async function deleteOrganizationAction(organizationId: string) {
  try {
    await verifySession(["SUPER_ADMIN"]);

    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!org) {
      return { success: false, error: "Gimnasio no encontrado" };
    }

    await prisma.organization.delete({
      where: { id: organizationId }
    });

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Gimnasio '${org.name}' eliminado permanentemente`
    };
  } catch (error: any) {
    console.error("Error eliminando organización:", error);
    return { success: false, error: error.message || "Error al eliminar la organización" };
  }
}

/**
 * Alterna el estado de un Gimnasio (Activo / Suspendido)
 */
export async function toggleOrganizationStatusAction(organizationId: string) {
  try {
    await verifySession(["SUPER_ADMIN"]);

    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!org) {
      return { success: false, error: "Gimnasio no encontrado" };
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: { isActive: !org.isActive }
    });

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Gimnasio '${org.name}' ${updated.isActive ? "activado" : "suspendido"} con éxito`,
      data: serialize(updated)
    };
  } catch (error: any) {
    console.error("Error cambiando estado de organización:", error);
    return { success: false, error: error.message || "Error al cambiar estado" };
  }
}
