"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import { verifySession } from "@/lib/security";

export async function getPlansAction() {
  try {
    await verifySession();
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
      include: {
        _count: {
          select: {
            memberships: {
              where: { status: "ACTIVE" }
            }
          }
        }
      }
    });
    
    return { success: true, data: serialize(plans) };
  } catch (error) {
    console.error("Error fetching plans:", error);
    return { success: false, error: "Error al cargar planes" };
  }
}

export async function getPlanMembersAction(planId: string) {
  try {
    await verifySession();
    const memberships = await prisma.membership.findMany({
      where: {
        planId,
        status: "ACTIVE",
      },
      include: {
        member: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: serialize(memberships.map(m => m.member)) };
  } catch (error) {
    console.error("Error fetching plan members:", error);
    return { success: false, error: "Error al cargar los socios del plan" };
  }
}

export interface PlanInput {
  name: string;
  description?: string;
  price: string | number;
  durationDays: string | number;
  category?: string;
  allowedClasses?: boolean;
  maxFreezeDays?: string | number;
  color?: string;
}

export async function createPlanAction(data: PlanInput) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description || "",
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        durationDays: typeof data.durationDays === 'string' ? parseInt(data.durationDays) : data.durationDays,
        category: data.category || "GENERAL",
        allowedClasses: data.allowedClasses === true,
        maxFreezeDays: typeof data.maxFreezeDays === 'string' ? parseInt(data.maxFreezeDays || "0") : (data.maxFreezeDays || 0),
        color: data.color || "primary",
      },
    });
    revalidatePath("/memberships");
    return { success: true, data: serialize(plan) };
  } catch (error) {
    return { success: false, error: "Error al crear plan" };
  }
}

export async function updatePlanAction(id: string, data: PlanInput) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || "",
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        durationDays: typeof data.durationDays === 'string' ? parseInt(data.durationDays) : data.durationDays,
        category: data.category,
        allowedClasses: data.allowedClasses === true,
        maxFreezeDays: typeof data.maxFreezeDays === 'string' ? parseInt(data.maxFreezeDays || "0") : (data.maxFreezeDays || 0),
      },
    });
    revalidatePath("/memberships");
    return { success: true, data: serialize(plan) };
  } catch (error) {
    return { success: false, error: "Error al actualizar plan" };
  }
}

export async function deletePlanAction(id: string) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    await prisma.plan.delete({ where: { id } });
    revalidatePath("/memberships");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar (tiene socios suscritos)" };
  }
}

export async function getMembershipsStatsAction() {
  try {
    await verifySession();
    const [totalMembers, activeMemberships, allMemberships, plans] = await Promise.all([
      prisma.member.count({ where: { status: "ACTIVE" } }),
      prisma.membership.findMany({
        where: { status: "ACTIVE" },
        include: { plan: true }
      }),
      prisma.membership.findMany({
        select: { memberId: true }
      }),
      prisma.plan.findMany({
        include: {
          _count: {
            select: { memberships: true }
          }
        }
      })
    ]);

    // 1. Best Seller
    const bestSeller = plans.sort((a, b) => b._count.memberships - a._count.memberships)[0]?.name || "N/A";

    // 2. Projected Income (Sum of active memberships prices)
    const projectedIncome = activeMemberships.reduce((acc, m) => acc + Number(m.price), 0);

    // 3. Renewal Rate
    const memberMembershipCounts = allMemberships.reduce((acc: any, m) => {
      acc[m.memberId] = (acc[m.memberId] || 0) + 1;
      return acc;
    }, {});
    
    const membersWithMoreThanOne = Object.values(memberMembershipCounts).filter((count: any) => count > 1).length;
    const totalMembersWithMembership = Object.keys(memberMembershipCounts).length;
    const renewalRate = totalMembersWithMembership > 0 
      ? (membersWithMoreThanOne / totalMembersWithMembership) * 100 
      : 0;

    // 4. Conversion (Active Members / Total Members)
    const totalPossibleMembers = await prisma.member.count();
    const conversionRate = totalPossibleMembers > 0 
      ? (totalMembers / totalPossibleMembers) * 100 
      : 0;

    return {
      success: true,
      data: {
        bestSeller,
        projectedIncome,
        renewalRate,
        conversionRate
      }
    };
  } catch (error) {
    console.error("Error fetching membership stats:", error);
    return { success: false, error: "Error al cargar estadísticas" };
  }
}
