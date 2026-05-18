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
  return NextResponse.json({ status: "online", gateway: "Culqi Webhook Endpoint", received: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || body.object !== "event") {
      return NextResponse.json({ error: "Invalid webhook format" }, { status: 400 });
    }

    const { type, data } = body;

    if (type !== "charge.creation.succeeded") {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const chargeId = data?.id;
    const metadata = data?.metadata || {};
    const { memberId, planId } = metadata;

    if (!chargeId || !memberId || !planId) {
      console.error("[Culqi Webhook] Falta chargeId o metadata:", data);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: { reference: chargeId, method: "CULQI" }
    });

    if (existingPayment) {
      return NextResponse.json({ received: true, alreadyProcessed: true }, { status: 200 });
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    if (!member || !plan) {
      return NextResponse.json({ error: "Member or Plan not found" }, { status: 404 });
    }

    const newPayment = await prisma.$transaction(async (tx) => {
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
          method: "CULQI",
          status: "COMPLETED",
          reference: chargeId,
          invoiceNumber,
          paidAt: new Date()
        },
        include: { member: true, membership: { include: { plan: true } } }
      });

      return p;
    });

    await createAuditLog({
      action: "WEBHOOK_CULQI_SUCCESS",
      entity: "Payment",
      entityId: newPayment.id,
      newData: { memberId, planId, amount: Number(plan.price), reference: chargeId }
    });

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
            method: "CULQI",
            paidAt: format(newPayment.paidAt || new Date(), "PPP p", { locale: es }),
            invoiceNumber: newPayment.invoiceNumber || undefined,
            gymName: gymName || undefined,
            gymLogo: gymLogo || undefined,
          }),
          text: `Hola ${member.fullName}, tu pago con Culqi por S/ ${Number(newPayment.amount).toFixed(2)} se completó con éxito.`
        }, member.id, "SUCCESS");
      } catch (err) {
        console.error("Error enviando recibo Culqi Webhook:", err);
      }
    }

    return NextResponse.json({ success: true, paymentId: newPayment.id }, { status: 200 });
  } catch (error: any) {
    console.error("[Culqi Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Webhook Error" }, { status: 500 });
  }
}
