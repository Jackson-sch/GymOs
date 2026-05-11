"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/security";
import { serialize } from "@/lib/utils";

export async function getRecentPaymentsAction() {
  try {
    await verifySession();
    const payments = await prisma.payment.findMany({
      where: { createdAt: { lte: new Date() } },
      orderBy: { createdAt: "desc" },
      include: { member: true, membership: { include: { plan: true } } }
    });
    
    return { success: true, data: serialize(payments) };
  } catch (error) {
    console.error("[getRecentPaymentsAction] Error:", error);
    return { success: false, error: "Error al cargar pagos" };
  }
}

export async function createPaymentAction(data: any) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    
    const result = await prisma.$transaction(async (tx) => {
      let membershipId = null;

      // 1. Si el pago incluye un plan, crear la membresía primero
      if (data.planId) {
        const plan = await tx.plan.findUnique({ where: { id: data.planId } });
        if (!plan) throw new Error("Plan no encontrado");

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        // Expirar membresías activas previas
        await tx.membership.updateMany({
          where: { memberId: data.memberId, status: "ACTIVE" },
          data: { status: "EXPIRED" }
        });

        const membership = await tx.membership.create({
          data: {
            memberId: data.memberId,
            planId: data.planId,
            startDate,
            endDate,
            status: "ACTIVE",
            price: plan.price
          }
        });
        membershipId = membership.id;

        // Actualizar estado del socio
        await tx.member.update({
          where: { id: data.memberId },
          data: { status: "ACTIVE" }
        });
      }

      // 2. Crear el pago vinculado (o no) a la membresía
      const payment = await tx.payment.create({
        data: {
          memberId: data.memberId,
          membershipId: membershipId,
          amount: parseFloat(data.amount),
          method: data.method,
          status: "COMPLETED",
          reference: data.reference,
          paidAt: new Date(),
        }
      });

      return payment;
    });

    revalidatePath("/payments");
    revalidatePath("/members");
    revalidatePath("/memberships");
    
    return { success: true, data: serialize(result) };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al registrar el pago" };
  }
}

export async function getFinancialStatsAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const stats = await prisma.payment.groupBy({
      by: ['method'],
      _sum: { amount: true },
      where: { status: "COMPLETED" }
    });
    
    return { success: true, data: stats.map(s => ({ key: s.method, value: Number(s._sum.amount || 0) })) };
  } catch (error) {
    return { success: false, error: "Error en estadísticas" };
  }
}
