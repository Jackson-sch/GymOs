import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { createAuditLog } from "@/lib/audit";
import { sendEmailWithLog } from "@/lib/email";
import { PaymentReceiptEmail } from "@/components/emails/PaymentReceiptEmail";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React from "react";

export async function GET(req: NextRequest) {
  return NextResponse.json({ status: "online", gateway: "Mercado Pago Webhook Endpoint", received: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const paymentId = id || body?.data?.id || body?.id;

    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID provided" }, { status: 400 });
    }

    // Ignorar si no es una notificación de pago
    if (topic && topic !== "payment" && body?.type !== "payment") {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const mpToken = await getConfig("MP_ACCESS_TOKEN");
    if (!mpToken) {
      console.error("[MercadoPago Webhook] MP_ACCESS_TOKEN no configurado");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Verificar estado del pago en Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` }
    });

    if (!mpRes.ok) {
      console.error(`[MercadoPago Webhook] Falló al consultar pago ${paymentId}`);
      return NextResponse.json({ error: "Failed to fetch payment from MP" }, { status: 500 });
    }

    const mpPayment = await mpRes.json();

    if (mpPayment.status === "approved") {
      const reference = mpPayment.id.toString();

      // Verificar si el pago ya fue registrado en el sistema
      const existingPayment = await prisma.payment.findFirst({
        where: { reference, method: "MERCADOPAGO" }
      });

      if (existingPayment) {
        return NextResponse.json({ received: true, alreadyProcessed: true }, { status: 200 });
      }

      let meta: { memberId?: string; planId?: string } = {};
      try {
        if (mpPayment.external_reference) {
          meta = JSON.parse(mpPayment.external_reference);
        }
      } catch (e) {
        console.error("[MercadoPago Webhook] Error parseando external_reference:", mpPayment.external_reference);
      }

      const { memberId, planId } = meta;
      if (!memberId || !planId) {
        console.error("[MercadoPago Webhook] Sin memberId o planId en external_reference");
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      const member = await prisma.member.findUnique({ where: { id: memberId } });
      const plan = await prisma.plan.findUnique({ where: { id: planId } });

      if (!member || !plan) {
        return NextResponse.json({ error: "Member or Plan not found" }, { status: 404 });
      }

      // Transacción para registrar el pago y activar membresía
      const newPayment = await prisma.$transaction(async (tx) => {
        // Expirar activas anteriores
        await tx.membership.updateMany({
          where: { memberId, status: "ACTIVE" },
          data: { status: "EXPIRED" }
        });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        const newMembership = await tx.membership.create({
          data: {
            memberId,
            planId,
            startDate,
            endDate,
            status: "ACTIVE",
            price: plan.price
          }
        });

        await tx.member.update({
          where: { id: memberId },
          data: { status: "ACTIVE" }
        });

        // Generar Factura
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
        const invoiceNumber = `F001-${nextNumber.toString().padStart(4, "0")}`;

        const p = await tx.payment.create({
          data: {
            memberId,
            membershipId: newMembership.id,
            amount: plan.price,
            method: "MERCADOPAGO",
            status: "COMPLETED",
            reference,
            invoiceNumber,
            paidAt: new Date()
          },
          include: { member: true, membership: { include: { plan: true } } }
        });

        return p;
      });

      // Auditoría
      await createAuditLog({
        action: "WEBHOOK_MERCADOPAGO_SUCCESS",
        entity: "Payment",
        entityId: newPayment.id,
        newData: { memberId, planId, amount: Number(plan.price), reference }
      });

      // Enviar recibo
      if (member.email) {
        try {
          const [gymName, gymLogo] = await Promise.all([
            getConfig("GYM_NAME"),
            getConfig("GYM_LOGO")
          ]);

          await sendEmailWithLog({
            to: member.email,
            subject: `Recibo de Pago Online: ${newPayment.invoiceNumber}`,
            react: React.createElement(PaymentReceiptEmail, {
              memberName: member.fullName,
              planName: plan.name,
              amount: `S/ ${Number(newPayment.amount).toFixed(2)}`,
              method: "MERCADOPAGO",
              paidAt: format(newPayment.paidAt || new Date(), "PPP p", { locale: es }),
              invoiceNumber: newPayment.invoiceNumber || undefined,
              gymName: gymName || undefined,
              gymLogo: gymLogo || undefined,
            }),
            text: `Hola ${member.fullName}, tu pago con Mercado Pago por S/ ${Number(newPayment.amount).toFixed(2)} se completó con éxito.`
          }, member.id, "SUCCESS");
        } catch (err) {
          console.error("Error enviando recibo MercadoPago Webhook:", err);
        }
      }

      return NextResponse.json({ success: true, paymentId: newPayment.id }, { status: 200 });
    }

    return NextResponse.json({ received: true, status: mpPayment.status }, { status: 200 });
  } catch (error: any) {
    console.error("[MercadoPago Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Webhook Error" }, { status: 500 });
  }
}
