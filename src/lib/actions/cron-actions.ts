"use server";

import { prisma } from "@/lib/prisma";
import { addDays, differenceInDays } from "date-fns";
import { sendEmailWithLog } from "@/lib/email";
import { sendSMSWithLog } from "@/lib/sms";
import { ExpirationWarningEmail } from "@/components/emails/ExpirationWarningEmail";
import { ExpiredEmail } from "@/components/emails/ExpiredEmail";
import { getConfig } from "@/lib/config";
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function processExpiringMembershipsAction() {
  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);
  
  const notificationsSent = { email: 0, sms: 0, errors: 0 };
  
  try {
    const expiringMemberships = await prisma.membership.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: today,
          lte: threeDaysFromNow,
        },
      },
      include: {
        member: true,
        plan: true,
      },
    });
    
    const [gymName, gymLogo] = await Promise.all([
      getConfig("GYM_NAME"),
      getConfig("GYM_LOGO"),
    ]);
    
    for (const membership of expiringMemberships) {
      const member = membership.member;
      const daysLeft = differenceInDays(membership.endDate, today);
      
      try {
        if (member.email) {
          await sendEmailWithLog({
            to: member.email,
            subject: `Tu membresía vence en ${daysLeft} día(s)`,
            react: React.createElement(ExpirationWarningEmail, {
              memberName: member.fullName,
              planName: membership.plan.name,
              endDate: format(membership.endDate, "PPP", { locale: es }),
              daysLeft,
              gymName: gymName || undefined,
              gymLogo: gymLogo || undefined,
            }),
            text: `Hola ${member.fullName}, tu membresía ${membership.plan.name} vence en ${daysLeft} días (${format(membership.endDate, "PPP", { locale: es })}). ¡Renueva pronto!`
          }, member.id, "WARNING");
          
          notificationsSent.email++;
        }
      } catch (emailErr: any) {
        console.error("Error sending expiration email:", emailErr.message);
        notificationsSent.errors++;
      }
    }
    
    return { success: true, processed: expiringMemberships.length, notifications: notificationsSent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processExpiredMembershipsAction() {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const notificationsSent = { email: 0, sms: 0 };

  try {
    const expiredMemberships = await prisma.membership.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: yesterday },
      },
      include: {
        member: true,
        plan: true,
      },
    });
    
    const [gymName, gymLogo] = await Promise.all([
      getConfig("GYM_NAME"),
      getConfig("GYM_LOGO"),
    ]);

    for (const membership of expiredMemberships) {
      const member = membership.member;
      
      await prisma.$transaction([
        prisma.membership.update({
          where: { id: membership.id },
          data: { status: "EXPIRED" },
        }),
        prisma.member.update({
          where: { id: member.id },
          data: { status: "INACTIVE" },
        })
      ]);

      try {
        if (member.email) {
          await sendEmailWithLog({
            to: member.email,
            subject: `Tu membresía en ${gymName || 'GymOS'} ha vencido`,
            react: React.createElement(ExpiredEmail, {
              memberName: member.fullName,
              planName: membership.plan.name,
              gymName: gymName || undefined,
              gymLogo: gymLogo || undefined,
            }),
            text: `Hola ${member.fullName}, tu membresía ${membership.plan.name} ha vencido. ¡Te esperamos para renovar!`
          }, member.id, "ERROR");
          
          notificationsSent.email++;
        }
      } catch (emailErr: any) {
        console.error("Error sending expired email:", emailErr.message);
      }
      
      if (member.phone) {
        try {
          await sendSMSWithLog({
            to: member.phone,
            body: `Hola ${member.fullName}, tu membresía ${membership.plan.name} ha vencido. Visítanos en ${gymName || 'GymOS'} para renovar.`
          }, member.id, "ERROR");
          
          notificationsSent.sms++;
        } catch (smsErr: any) {
          console.error("Error sending expired SMS:", smsErr.message);
        }
      }
    }
    
    return { success: true, processed: expiredMemberships.length, notifications: notificationsSent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function ensureSystemUser() {
  let user = await prisma.user.findUnique({ where: { id: "system" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "system",
        name: "Sistema GymOS",
        email: "system@gymos.local",
        role: "SUPER_ADMIN"
      }
    });
  }
  return user;
}

export async function processEquipmentMaintenanceAction() {
  const today = new Date();
  const sevenDaysFromNow = addDays(today, 7);

  try {
    const pendingMaintenance = await prisma.equipment.findMany({
      where: {
        status: "OPERATIONAL",
        nextMaintenance: {
          gte: today,
          lte: sevenDaysFromNow,
        },
      },
    });

    if (pendingMaintenance.length > 0) {
      await ensureSystemUser();
    }

    for (const item of pendingMaintenance) {
      await prisma.auditLog.create({
        data: {
          userId: "system",
          action: "MAINTENANCE_ALERT",
          entity: "EQUIPMENT",
          entityId: item.id,
          newData: {
            name: item.name,
            nextMaintenance: item.nextMaintenance,
          },
        },
      });
    }

    return { success: true, processed: pendingMaintenance.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
