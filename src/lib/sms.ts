import twilio from "twilio";
import { getConfig } from "./config";

let twilioClient: twilio.Twilio | null = null;
let twilioPhone: string | null = null;

async function getTwilio() {
  if (twilioClient && twilioPhone) {
    return { client: twilioClient, phone: twilioPhone };
  }
  
  const [accountSid, authToken, phoneNumber] = await Promise.all([
    getConfig("TWILIO_ACCOUNT_SID"),
    getConfig("TWILIO_AUTH_TOKEN"),
    getConfig("TWILIO_PHONE_NUMBER"),
  ]);
  
  if (!accountSid || !authToken || !phoneNumber) {
    throw new Error("Twilio credentials no configuradas");
  }
  
  twilioClient = twilio(accountSid, authToken);
  twilioPhone = phoneNumber;
  
  return { client: twilioClient, phone: twilioPhone };
}

export interface SendSMSOptions {
  to: string;
  body: string;
}

export async function sendSMS({ to, body }: SendSMSOptions) {
  const { client, phone } = await getTwilio();
  
  const formattedTo = to.startsWith("+") ? to : `+51${to}`;
  
  const result = await client.messages.create({
    body,
    from: phone,
    to: formattedTo,
  });

  return result;
}

export async function sendSMSWithLog(options: SendSMSOptions, memberId?: string, type?: string) {
  try {
    const result: any = await sendSMS(options);
    
    if (memberId) {
      const { prisma } = await import("../lib/prisma");
      await prisma.appNotification.create({
        data: {
          memberId,
          type: (type as any) || "INFO",
          title: "SMS Enviado",
          message: options.body,
        },
      });
    }
    
    return result;
  } catch (error: any) {
    console.error("[SMS Error]: Fallo al enviar SMS", error);
    if (memberId) {
      try {
        const { prisma } = await import("../lib/prisma");
        await prisma.appNotification.create({
          data: {
            memberId,
            type: "ERROR",
            title: "Fallo de Envío SMS",
            message: `No se pudo enviar el SMS (${error?.message || "Error de red"})`,
          },
        });
      } catch (dbErr) {
        console.error("No se pudo registrar notificación de error SMS:", dbErr);
      }
    }
    return { success: false, error: error?.message || "Fallo al enviar SMS" };
  }
}

export async function sendWhatsApp({ to, body }: SendSMSOptions) {
  const { client, phone } = await getTwilio();
  
  const formattedTo = to.startsWith("+") ? to : `+51${to}`;
  
  const result = await client.messages.create({
    body,
    from: `whatsapp:${phone}`,
    to: `whatsapp:${formattedTo}`,
  });

  return result;
}