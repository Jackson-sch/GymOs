"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { serialize } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";
import { sendEmailWithLog } from "@/lib/email";
import { PaymentReceiptEmail } from "@/components/emails/PaymentReceiptEmail";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getConfig } from "@/lib/config";
import React from "react";
import { revalidatePath } from "next/cache";

/**
 * @module OnlinePaymentsActions
 * @description Módulo de integración de pasarelas de pago online (Culqi y Mercado Pago) listo para producción.
 * Gestiona el flujo seguro de generación de preferencias, tokenización de tarjetas, cargos directos,
 * actualización de membresías y envío de recibos por correo electrónico.
 */

/**
 * Genera una preferencia de pago en Mercado Pago para la compra/renovación de un plan
 */
export async function createMercadoPagoPreferenceAction(data: { planId: string; memberId: string }) {
  try {
    await verifySession(["MEMBER", "ADMIN", "SUPER_ADMIN"]);

    const plan = await prisma.plan.findUnique({
      where: { id: data.planId }
    });
    if (!plan) throw new Error("Plan no encontrado");

    const member = await prisma.member.findUnique({
      where: { id: data.memberId }
    });
    if (!member) throw new Error("Socio no encontrado");

    const mpToken = await getConfig("MP_ACCESS_TOKEN");
    if (!mpToken) {
      throw new Error("Mercado Pago no está configurado en el sistema.");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gymos.club";

    const response = await fetch("https://api.mercadopago.com/v1/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpToken}`
      },
      body: JSON.stringify({
        items: [
          {
            id: plan.id,
            title: `Membresía GymOS - ${plan.name}`,
            description: plan.description || "Acceso ilimitado a las instalaciones",
            quantity: 1,
            currency_id: "PEN",
            unit_price: Number(plan.price)
          }
        ],
        payer: {
          email: member.email || "socio@gymos.club",
          name: member.fullName
        },
        back_urls: {
          success: `${appUrl}/portal?payment=success`,
          failure: `${appUrl}/portal?payment=failure`,
          pending: `${appUrl}/portal?payment=pending`
        },
        auto_return: "approved",
        external_reference: JSON.stringify({ memberId: member.id, planId: plan.id }),
        notification_url: `${appUrl}/api/webhooks/mercadopago`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MercadoPago Preference Error]", errorText);
      throw new Error("No se pudo conectar con Mercado Pago al generar la preferencia.");
    }

    const mpData = await response.json();

    return {
      success: true,
      preferenceId: mpData.id,
      initPoint: mpData.init_point
    };
  } catch (error: any) {
    console.error("[createMercadoPagoPreferenceAction] Error:", error);
    return { success: false, error: error.message || "Error al crear preferencia de Mercado Pago." };
  }
}

/**
 * Obtiene la configuración de Culqi para inicializar el Checkout en el cliente
 */
export async function getCulqiConfigAction(planId: string) {
  try {
    await verifySession(["MEMBER", "ADMIN", "SUPER_ADMIN"]);

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });
    if (!plan) throw new Error("Plan no encontrado");

    const publicKey = await getConfig("CULQI_PUBLIC_KEY");
    if (!publicKey) {
      throw new Error("La pasarela Culqi no está configurada en el sistema.");
    }

    return {
      success: true,
      publicKey,
      amount: Math.round(Number(plan.price) * 100), // Culqi requiere centavos
      currency: "PEN",
      planName: plan.name
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al obtener configuración de Culqi." };
  }
}

/**
 * Procesa el token generado por Culqi Checkout y realiza el cargo directo
 */
export async function processCulqiChargeAction(data: { token: string; memberId: string; planId: string }) {
  try {
    await verifySession(["MEMBER", "ADMIN", "SUPER_ADMIN"]);

    const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new Error("Plan no encontrado");

    const member = await prisma.member.findUnique({ where: { id: data.memberId } });
    if (!member) throw new Error("Socio no encontrado");

    const privateKey = await getConfig("CULQI_PRIVATE_KEY");
    if (!privateKey) throw new Error("La llave privada de Culqi (CULQI_PRIVATE_KEY) no está configurada en el sistema.");

    // 1. Efectuar el cargo en Culqi
    const amountCents = Math.round(Number(plan.price) * 100);
    const chargeRes = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${privateKey}`
      },
      body: JSON.stringify({
        amount: amountCents,
        currency_code: "PEN",
        email: member.email || "socio@gymos.club",
        source_id: data.token,
        description: `Pago de Membresía GymOS - ${plan.name}`,
        metadata: {
          memberId: member.id,
          planId: plan.id
        }
      })
    });

    if (!chargeRes.ok) {
      const err = await chargeRes.json();
      throw new Error(err.user_message || "El pago con Culqi fue declinado o falló.");
    }

    const chargeData = await chargeRes.json();

    // 2. Transacción en base de datos para registrar Membresía y Pago
    const result = await prisma.$transaction(async (tx) => {
      // Expirar membresías activas previas
      await tx.membership.updateMany({
        where: { memberId: member.id, status: "ACTIVE" },
        data: { status: "EXPIRED" }
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.durationDays);

      const newMembership = await tx.membership.create({
        data: {
          memberId: member.id,
          planId: plan.id,
          startDate,
          endDate,
          status: "ACTIVE",
          price: plan.price
        }
      });

      // Actualizar estado del socio
      await tx.member.update({
        where: { id: member.id },
        data: { status: "ACTIVE" }
      });

      // Generar N° Factura
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

      const payment = await tx.payment.create({
        data: {
          memberId: member.id,
          membershipId: newMembership.id,
          amount: plan.price,
          method: "CULQI",
          status: "COMPLETED",
          reference: chargeData.id || data.token,
          invoiceNumber,
          paidAt: new Date()
        },
        include: { membership: { include: { plan: true } }, member: true }
      });

      return payment;
    });

    revalidatePath("/portal");
    revalidatePath("/payments");
    revalidatePath("/members");

    // Registrar en auditoría
    await createAuditLog({
      action: "ONLINE_PAYMENT_CULQI",
      entity: "Payment",
      entityId: result.id,
      newData: { memberId: member.id, planId: plan.id, amount: Number(plan.price) }
    });

    // Enviar Recibo por Email
    if (member.email) {
      try {
        const [gymName, gymLogo] = await Promise.all([
          getConfig("GYM_NAME"),
          getConfig("GYM_LOGO")
        ]);

        await sendEmailWithLog({
          to: member.email,
          subject: `Recibo de Pago Online: ${result.invoiceNumber}`,
          react: React.createElement(PaymentReceiptEmail, {
            memberName: member.fullName,
            planName: plan.name,
            amount: `S/ ${Number(result.amount).toFixed(2)}`,
            method: "CULQI",
            paidAt: format(result.paidAt || new Date(), "PPP p", { locale: es }),
            invoiceNumber: result.invoiceNumber || undefined,
            gymName: gymName || undefined,
            gymLogo: gymLogo || undefined,
          }),
          text: `Hola ${member.fullName}, tu pago online de S/ ${Number(result.amount).toFixed(2)} por el plan ${plan.name} se completó con éxito.`
        }, member.id, "SUCCESS");
      } catch (err) {
        console.error("Error enviando recibo de Culqi:", err);
      }
    }

    return { success: true, data: serialize(result) };
  } catch (error: any) {
    console.error("[processCulqiChargeAction] Error:", error);
    return { success: false, error: error.message || "Error procesando el pago con Culqi." };
  }
}
