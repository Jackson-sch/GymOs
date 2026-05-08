"use server";

import { prisma } from "../../../prisma";
import { addDays, differenceInDays } from "date-fns";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { getExpirationEmailTemplate, getExpiredEmailTemplate } from "@/lib/templates";

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
    
    for (const membership of expiringMemberships) {
      const member = membership.member;
      const daysLeft = differenceInDays(membership.endDate, today);
      
      try {
        const emailTemplate = await getExpirationEmailTemplate({
          memberName: member.fullName,
          planName: membership.plan.name,
          endDate: membership.endDate.toLocaleDateString("es-PE"),
          daysLeft,
        });
        
        await sendEmail({
          to: member.email || "",
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
        
        await prisma.appNotification.create({
          data: {
            memberId: member.id,
            type: "WARNING",
            title: emailTemplate.subject,
            message: `Membresía vence en ${daysLeft} días`,
          },
        });
        
        notificationsSent.email++;
      } catch (emailErr: any) {
        console.error("Error sending email:", emailErr.message);
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
          const emailTemplate = await getExpiredEmailTemplate({
            memberName: member.fullName,
            planName: membership.plan.name,
          });
          
          await sendEmail({
            to: member.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
          
          await prisma.appNotification.create({
            data: {
              memberId: member.id,
              type: "ERROR",
              title: emailTemplate.subject,
              message: `Plan ${membership.plan.name} vencido`,
            },
          });
          
          notificationsSent.email++;
        }
      } catch (emailErr: any) {
        console.error("Error sending expired email:", emailErr.message);
      }
      
      if (member.phone) {
        try {
          const message = `Hola ${member.fullName}, tu membresía ${membership.plan.name} ha vencido. Visítanos para renovar.`;
          await sendSMS({ to: member.phone, body: message });
          
          await prisma.appNotification.create({
            data: {
              memberId: member.id,
              type: "ERROR",
              title: "SMS Enviado",
              message: message,
            },
          });
          
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
