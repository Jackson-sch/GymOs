"use server";

import { prisma } from "@/lib/prisma";
import { addDays, subDays, differenceInDays } from "date-fns";
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

/**
 * Detecta alumnos activos que no registran asistencias en 14+ días y les envía alerta de re-engagement amigable
 */
export async function processInactivityReengagementAction() {
  const fourteenDaysAgo = subDays(new Date(), 14);
  const notificationsSent = { email: 0, errors: 0 };

  try {
    const inactiveMembers = await prisma.member.findMany({
      where: {
        status: "ACTIVE",
        attendances: {
          none: {
            checkIn: { gte: fourteenDaysAgo }
          }
        }
      },
      take: 50,
      include: {
        memberships: { where: { status: "ACTIVE" }, take: 1, include: { plan: true } }
      }
    });

    const [gymName] = await Promise.all([
      getConfig("GYM_NAME")
    ]);

    for (const member of inactiveMembers) {
      if (member.email) {
        try {
          await sendEmailWithLog({
            to: member.email,
            subject: `¡Te extrañamos en ${gymName || 'GymOS'}! 💪`,
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
              <h2 style="font-family: serif; font-size: 24px; margin-bottom: 16px; color: #ffffff;">¡Hola ${member.fullName}!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Notamos que llevas unos días sin entrenar en <strong>${gymName || 'GymOS'}</strong>. Recuerda que la constancia es la clave del progreso.</p>
              <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Tu membresía se encuentra activa. ¡Te esperamos hoy en el gimnasio para darlo todo!</p>
            </div>`,
            text: `Hola ${member.fullName}, ¡te extrañamos en ${gymName || 'GymOS'}! Tu membresía sigue activa, te esperamos hoy en el gimnasio.`
          }, member.id, "INFO");

          notificationsSent.email++;
        } catch (err: any) {
          notificationsSent.errors++;
        }
      }
    }

    return { success: true, processed: inactiveMembers.length, notifications: notificationsSent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
