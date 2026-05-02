"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";

// Función de utilidad para serialización profunda y segura de tipos complejos de Prisma
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function getRecentPaymentsAction() {
  try {
    const payments = await prisma.payment.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { member: true }
    });
    
    return { success: true, data: serialize(payments) };
  } catch (error) {
    return { success: false, error: "Error al cargar pagos" };
  }
}

export async function createPaymentAction(data: any) {
  try {
    // 1. Crear el pago
    const payment = await prisma.payment.create({
      data: {
        memberId: data.memberId,
        amount: parseFloat(data.amount),
        method: data.method,
        status: "COMPLETED",
        reference: data.reference,
      }
    });

    // 2. Si el pago es para una membresía, crear la membresía
    if (data.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        await prisma.membership.create({
          data: {
            memberId: data.memberId,
            planId: data.planId,
            startDate,
            endDate,
            status: "ACTIVE",
            price: plan.price
          }
        });
      }
    }

    revalidatePath("/payments");
    revalidatePath("/members");
    return { success: true, data: serialize(payment) };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: "Error al registrar el pago" };
  }
}

export async function getFinancialStatsAction() {
  try {
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
