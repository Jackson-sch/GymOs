"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";

export async function renewMembershipAction(data: {
  memberId: string;
  planId: string;
  paymentMethod?: string;
  notes?: string;
}) {
  try {
    // 1. Get the plan to calculate dates
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      return { success: false, error: "Plan no encontrado" };
    }

    // 2. Expire any active memberships for this member
    await prisma.membership.updateMany({
      where: {
        memberId: data.memberId,
        status: "ACTIVE",
      },
      data: {
        status: "EXPIRED",
      },
    });

    // 3. Calculate new membership dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // 4. Create the new membership
    const membership = await prisma.membership.create({
      data: {
        memberId: data.memberId,
        planId: data.planId,
        startDate,
        endDate,
        status: "ACTIVE",
        price: plan.price,
        notes: data.notes || null,
      },
      include: {
        plan: true,
        member: true,
      },
    });

    // 5. Register payment if method is provided
    if (data.paymentMethod) {
      await prisma.payment.create({
        data: {
          memberId: data.memberId,
          membershipId: membership.id,
          amount: plan.price,
          method: data.paymentMethod as any,
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });
    }

    // 6. Ensure the member status is ACTIVE
    await prisma.member.update({
      where: { id: data.memberId },
      data: { status: "ACTIVE" },
    });

    revalidatePath("/members");
    revalidatePath("/memberships");
    revalidatePath("/payments");

    return { success: true, data: serialize(membership) };
  } catch (error) {
    console.error("Error renewing membership:", error);
    return { success: false, error: "Error al renovar la membresía" };
  }
}

export async function getMembershipHistoryAction(memberId: string) {
  try {
    const memberships = await prisma.membership.findMany({
      where: { memberId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: serialize(memberships) };
  } catch (error) {
    return { success: false, error: "Error al cargar historial" };
  }
}
