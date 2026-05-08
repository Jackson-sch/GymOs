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

export async function sendEmail({ to, subject, react, html, text }: SendEmailOptions) {
  const resend = await getResend();
  
  const fromEmail = (await getConfig("RESEND_FROM_EMAIL")) || "GymOS <noreply@gymos.com>";
  
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
  const result: any = await sendEmail(options);
  
  if (memberId) {
    const { prisma } = await import("../lib/prisma");
    await prisma.appNotification.create({
      data: {
        memberId,
        type: (type as any) || "INFO",
        title: options.subject,
        message: options.text || options.subject,
      },
    });
  }
  
  return result;
}