"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import { sendEmailWithLog } from "@/lib/email";
import { WelcomeEmail } from "@/components/emails/WelcomeEmail";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getConfig } from "@/lib/config";
import React from "react";
import { verifySession } from "@/lib/security";
import { createAuditLog } from "@/lib/audit";

export async function renewMembershipAction(data: {
  memberId: string;
  planId: string;
  paymentMethod?: string;
  notes?: string;
}) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"]);

    const membership = await prisma.$transaction(async (tx) => {
      // 1. Get the plan to calculate dates
      const plan = await tx.plan.findUnique({
        where: { id: data.planId },
      });

      if (!plan) {
        throw new Error("Plan no encontrado");
      }

      // 2. Check for active membership to handle early renewals gracefully
      const activeMembership = await tx.membership.findFirst({
        where: {
          memberId: data.memberId,
          status: "ACTIVE",
        },
        orderBy: { endDate: "desc" },
      });

      const now = new Date();
      let startDate = new Date();

      if (activeMembership && activeMembership.endDate > now) {
        // Start exactly when the current active membership ends
        startDate = new Date(activeMembership.endDate);
      }

      const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

      // Expire any active memberships for this member before creating the new one
      await tx.membership.updateMany({
        where: {
          memberId: data.memberId,
          status: "ACTIVE",
        },
        data: {
          status: "EXPIRED",
        },
      });

      // 3. Create the new membership
      const newMembership = await tx.membership.create({
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

      // 4. Register payment if method is provided
      if (data.paymentMethod) {
        // Generate invoice number
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

        await tx.payment.create({
          data: {
            memberId: data.memberId,
            membershipId: newMembership.id,
            amount: plan.price,
            method: data.paymentMethod as any,
            status: "COMPLETED",
            invoiceNumber,
            paidAt: new Date(),
          },
        });
      }

      // 5. Ensure the member status is ACTIVE
      await tx.member.update({
        where: { id: data.memberId },
        data: { status: "ACTIVE" },
      });

      return newMembership;
    });

    await createAuditLog({
      action: "RENEW_MEMBERSHIP",
      entity: "Membership",
      entityId: membership.id,
      newData: {
        memberId: data.memberId,
        planId: data.planId,
        paymentMethod: data.paymentMethod,
        startDate: membership.startDate,
        endDate: membership.endDate,
      },
    });

    // 6. Send Welcome/Renewal Email
    try {
      const [gymName, gymLogo] = await Promise.all([
        getConfig("GYM_NAME"),
        getConfig("GYM_LOGO"),
      ]);

      if (membership.member.email) {
        await sendEmailWithLog({
          to: membership.member.email,
          subject: `¡Membresía Activa: ${membership.plan.name}!`,
          react: React.createElement(WelcomeEmail, {
            memberName: membership.member.fullName,
            planName: membership.plan.name,
            startDate: format(membership.startDate, "PPP", { locale: es }),
            endDate: format(membership.endDate, "PPP", { locale: es }),
            qrCodeUrl: membership.member.qrCode || undefined,
            gymName: gymName || undefined,
            gymLogo: gymLogo || undefined,
          }),
          text: `Hola ${membership.member.fullName}, tu membresía ${membership.plan.name} está activa desde el ${format(membership.startDate, "PPP", { locale: es })} hasta el ${format(membership.endDate, "PPP", { locale: es })}.`
        }, data.memberId, "SUCCESS");
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }

    revalidatePath("/members");
    revalidatePath("/memberships");
    revalidatePath("/payments");

    return { success: true, data: serialize(membership) };
  } catch (error: any) {
    console.error("Error renewing membership:", error);
    return { success: false, error: error.message || "Error al renovar la membresía" };
  }
}

export async function getMembershipHistoryAction(memberId: string) {
  try {
    await verifySession();
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
