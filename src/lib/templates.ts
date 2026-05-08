import { getConfig } from "./config";

interface BaseTemplateParams {
  name?: string | null;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
}

async function getGymConfig() {
  const [name, logo, address, phone] = await Promise.all([
    getConfig("GYM_NAME"),
    getConfig("GYM_LOGO"),
    getConfig("GYM_ADDRESS"),
    getConfig("GYM_PHONE"),
  ]);
  return { name: name || "GymOS", logo, address, phone };
}

function wrapEmail(content: string, params: BaseTemplateParams) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.name || "GymOS"}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" bgcolor="#f5f5f5" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 20px;">
        <table width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 32px;">
              ${params.logo ? `<img src="${params.logo}" alt="${params.name}" style="height: 48px; margin-bottom: 24px;">` : `<h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">${params.name}</h1>`}
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                ${params.name}<br>
                ${params.address || ""} ${params.phone ? `· ${params.phone}` : ""}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function getWelcomeEmailTemplate(data: {
  memberName: string;
  planName: string;
  startDate: string;
  endDate: string;
  qrCode?: string;
}) {
  const config = await getGymConfig();
  
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">¡Bienvenido, ${data.memberName}!</h2>
    <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6;">
      Tu membresía <strong>${data.planName}</strong> está activa desde el <strong>${data.startDate}</strong> hasta el <strong>${data.endDate}</strong>.
    </p>
    <p style="margin: 0 0 24px 0; color: #374151; line-height: 1.6;">
      Usa tu código QR para registrar tu asistencia al gimnasio.
    </p>
    ${data.qrCode ? `<img src="${data.qrCode}" alt="Código QR" style="width: 160px; height: 160px; margin-bottom: 24px;">` : ""}
    <p style="margin: 0; color: #374151; line-height: 1.6;">
      Si tienes alguna consulta, no dudes en contactarnos.
    </p>
  `;
  
  return {
    subject: `¡Bienvenido a ${config.name}!`,
    html: wrapEmail(content, config),
  };
}

export async function getExpirationEmailTemplate(data: {
  memberName: string;
  planName: string;
  endDate: string;
  daysLeft: number;
}) {
  const config = await getGymConfig();
  
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Tu membresía está por vencer</h2>
    <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6;">
      Hola <strong>${data.memberName}</strong>, tu membresía <strong>${data.planName}</strong> vence en <strong>${data.daysLeft} día(s)</strong>.
    </p>
    <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6;">
      Fecha de vencimiento: <strong>${data.endDate}</strong>
    </p>
    <p style="margin: 0 0 24px 0; color: #ef4444; line-height: 1.6;">
      ¡Renueva ahora para no perder tu progreso!
    </p>
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background: #18181b; color: #ffffff; padding: 12px 24px; border-radius: 8px;">
          Renovaaquí
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `Tu membresía vence en ${data.daysLeft} días`,
    html: wrapEmail(content, config),
  };
}

export async function getExpiredEmailTemplate(data: {
  memberName: string;
  planName: string;
}) {
  const config = await getGymConfig();
  
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Tu membresía ha vencido</h2>
    <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6;">
      Hola <strong>${data.memberName}</strong>, tu membresía <strong>${data.planName}</strong> ha vencido.
    </p>
    <p style="margin: 0 0 24px 0; color: #374151; line-height: 1.6;">
      Te esperamos para que-renueves y sigas entrenando con nosotros.
    </p>
  `;
  
  return {
    subject: `Tu membresía en ${config.name} ha vencido`,
    html: wrapEmail(content, config),
  };
}

export async function getPaymentReceiptEmailTemplate(data: {
  memberName: string;
  planName: string;
  amount: string;
  method: string;
  paidAt: string;
  invoiceNumber?: string;
}) {
  const config = await getGymConfig();
  
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Recibo de pago</h2>
    <p style="margin: 0 0 24px 0; color: #374151; line-height: 1.6;">
      Hola <strong>${data.memberName}</strong>, gracias por tu pago.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Plan</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.planName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Monto</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.amount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Método</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.method}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Fecha</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.paidAt}</td>
      </tr>
      ${data.invoiceNumber ? `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Recibo Nº</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.invoiceNumber}</td>
      </tr>
      ` : ""}
    </table>
    <p style="margin: 0; color: #374151; line-height: 1.6;">
      Gracias por entrenar con nosotros.
    </p>
  `;
  
  return {
    subject: `Recibo de pago - ${config.name}`,
    html: wrapEmail(content, config),
  };
}

export async function getClassReminderEmailTemplate(data: {
  memberName: string;
  className: string;
  trainerName: string;
  startTime: string;
  location?: string;
}) {
  const config = await getGymConfig();
  
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Recordatorio de clase</h2>
    <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6;">
      Hola <strong>${data.memberName}</strong>, te recuerdan que tienes una clase programadas:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Clase</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.className}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Entrenador</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.trainerName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Hora</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.startTime}</td>
      </tr>
      ${data.location ? `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Ubicación</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.location}</td>
      </tr>
      ` : ""}
    </table>
    <p style="margin: 0; color: #374151; line-height: 1.6;">
      ¡Te esperamos!
    </p>
  `;
  
  return {
    subject: `Recordatorio: ${data.className} Hoy`,
    html: wrapEmail(content, config),
  };
}