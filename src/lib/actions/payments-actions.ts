"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/security";
import { serialize } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";
import { sendEmailWithLog } from "@/lib/email";
import { PaymentReceiptEmail } from "@/components/emails/PaymentReceiptEmail";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getConfig } from "@/lib/config";
import React from "react";

export async function getRecentPaymentsAction() {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
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

import { type PaymentMethod } from "@prisma/client";

export interface PaymentInput {
  memberId: string;
  amount: string | number;
  method: PaymentMethod | string;
  invoiceNumber?: string;
  planId?: string;
  referralTrainerId?: string | null;
  reference?: string | null;
}

export async function createPaymentAction(data: PaymentInput) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    
    const result = await prisma.$transaction(async (tx) => {
      let membershipId = null;

      // 0. Generar número de factura si no existe
      let invoiceNumber = data.invoiceNumber;
      if (!invoiceNumber) {
        const lastPayment = await tx.payment.findFirst({
          where: { invoiceNumber: { startsWith: "F001-" } },
          orderBy: { createdAt: "desc" },
          select: { invoiceNumber: true }
        });

        let nextNumber = 1;
        if (lastPayment?.invoiceNumber) {
          const lastNumStr = lastPayment.invoiceNumber.split("-")[1];
          nextNumber = parseInt(lastNumStr) + 1;
        }
        invoiceNumber = `F001-${nextNumber.toString().padStart(4, "0")}`;
      }

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
            price: plan.price,
            referralTrainerId: data.referralTrainerId === "none" ? null : data.referralTrainerId
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
          amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
          method: data.method as PaymentMethod,
          status: "COMPLETED",
          reference: data.reference,
          invoiceNumber: invoiceNumber,
          paidAt: new Date(),
        }
      });

      return payment;
    });

    revalidatePath("/payments");
    revalidatePath("/members");
    revalidatePath("/memberships");

    // Registrar en auditoría
    await createAuditLog({
      action: "PAYMENT_RECEIVE",
      entity: "Payment",
      entityId: result.id,
      newData: { memberId: data.memberId, amount: data.amount, method: data.method }
    });

    // 3. Enviar Recibo por Email
    try {
      const fullPayment = await prisma.payment.findUnique({
        where: { id: result.id },
        include: { 
          member: true,
          membership: { include: { plan: true } }
        }
      });

      if (fullPayment && fullPayment.member.email) {
        const [gymName, gymLogo] = await Promise.all([
          getConfig("GYM_NAME"),
          getConfig("GYM_LOGO"),
        ]);

        await sendEmailWithLog({
          to: fullPayment.member.email,
          subject: `Recibo de Pago: ${fullPayment.invoiceNumber}`,
          react: React.createElement(PaymentReceiptEmail, {
            memberName: fullPayment.member.fullName,
            planName: fullPayment.membership?.plan.name || "Servicio General",
            amount: `S/ ${fullPayment.amount.toFixed(2)}`,
            method: fullPayment.method,
            paidAt: format(fullPayment.paidAt || new Date(), "PPP p", { locale: es }),
            invoiceNumber: fullPayment.invoiceNumber || undefined,
            gymName: gymName || undefined,
            gymLogo: gymLogo || undefined,
          }),
          text: `Hola ${fullPayment.member.fullName}, recibimos tu pago de S/ ${fullPayment.amount.toFixed(2)} por ${fullPayment.membership?.plan.name || "el servicio"}.`
        }, fullPayment.memberId, "SUCCESS");
      }
    } catch (emailError) {
      console.error("Error sending payment receipt email:", emailError);
    }
    
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
