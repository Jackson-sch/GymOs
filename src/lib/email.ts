import { Resend } from "resend";
import { getConfig } from "./config";

let resendClient: Resend | null = null;

async function getResend(): Promise<Resend> {
  if (resendClient) return resendClient;
  
  const apiKey = await getConfig("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no configurada");
  }
  
  resendClient = new Resend(apiKey);
  return resendClient;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
}

function sanitizeErrorMessage(err: any): string {
  if (!err) return "Error desconocido en el servicio de correo";
  if (typeof err === "string") return err.split("\n")[0];
  if (err.message) return err.message.split("\n")[0];
  return "Error de comunicación en envío de correo";
}

export async function sendEmail({ to, subject, react, html, text }: SendEmailOptions) {
  const resend = await getResend();
  
  // Priorizamos variable de entorno o DB config, con fallback a dominio profesional de GymOS
  const fromEmail = process.env.RESEND_FROM_EMAIL || (await getConfig("RESEND_FROM_EMAIL")) || "GymOS <notificaciones@gymos.club>";
  
  const result = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    react: react || undefined,
    html,
    text,
  } as any);

  return result;
}

export async function sendEmailWithLog(options: SendEmailOptions, memberId?: string, type?: string) {
  let result: any = null;
  let errorMsg: string | null = null;

  try {
    result = await sendEmail(options);
    if (result && result.error) {
      errorMsg = sanitizeErrorMessage(result.error);
    }
  } catch (err: any) {
    errorMsg = sanitizeErrorMessage(err);
  }
  
  if (memberId) {
    const { prisma } = await import("../lib/prisma");
    await prisma.appNotification.create({
      data: {
        memberId,
        type: errorMsg ? "ERROR" : ((type as any) || "SUCCESS"),
        title: options.subject,
        message: errorMsg ? `Error en envío de correo: ${errorMsg}` : (options.text || options.subject),
      },
    });
  }
  
  if (errorMsg) {
    console.error("❌ Error en sendEmailWithLog:", errorMsg);
  }
  
  return result;
}