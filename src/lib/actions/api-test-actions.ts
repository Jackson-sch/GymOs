"use server";

import { verifySession } from "@/lib/security";

export async function testApiConnectionAction(provider: string, config: Record<string, string>) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);

    switch (provider) {
      case "RESEND": {
        const apiKey = config["RESEND_API_KEY"];
        if (!apiKey) return { success: false, error: "API Key de Resend no proporcionada en el formulario" };

        const res = await fetch("https://api.resend.com/api-keys", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (res.status === 200) {
          return { success: true, message: "Conexión exitosa con la API de Resend (Key Activa)" };
        } else if (res.status === 403) {
          return { success: true, message: "API Key de Resend válida (Verificado con éxito)" };
        } else {
          return { success: false, error: `Error de Resend (Status ${res.status}). Verifique la clave.` };
        }
      }

      case "TWILIO": {
        const sid = config["TWILIO_SID"];
        const token = config["TWILIO_TOKEN"];
        if (!sid || !token) return { success: false, error: "SID y Auth Token de Twilio son obligatorios para la prueba" };

        const auth = Buffer.from(`${sid}:${token}`).toString("base64");
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
          headers: { Authorization: `Basic ${auth}` },
        });

        if (res.status === 200) {
          const data = await res.json();
          return { success: true, message: `Twilio conectado correctamente (${data.friendly_name || sid})` };
        } else {
          return { success: false, error: `Credenciales de Twilio incorrectas (Status ${res.status})` };
        }
      }

      case "CLOUDINARY": {
        const cloudName = config["CLOUDINARY_CLOUD_NAME"];
        const apiKey = config["CLOUDINARY_API_KEY"];
        const apiSecret = config["CLOUDINARY_API_SECRET"];
        if (!cloudName || !apiKey || !apiSecret) {
          return { success: false, error: "Cloud Name, API Key y API Secret son requeridos para verificar Cloudinary" };
        }

        const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, {
          headers: { Authorization: `Basic ${auth}` },
        });

        if (res.status === 200) {
          return { success: true, message: `Conexión impecable con Cloudinary (${cloudName})` };
        } else {
          return { success: false, error: `Credenciales de Cloudinary rechazadas (Status ${res.status})` };
        }
      }

      case "MERCADOPAGO": {
        const token = config["MP_ACCESS_TOKEN"];
        if (!token) return { success: false, error: "Access Token de Mercado Pago no proporcionado" };

        const res = await fetch("https://api.mercadopago.com/v1/payment_methods", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          return { success: true, message: "Conectado exitosamente con Mercado Pago en modo Producción" };
        } else {
          return { success: false, error: `Access Token de Mercado Pago inválido (Status ${res.status})` };
        }
      }

      case "CULQI": {
        const sk = config["CULQI_PRIVATE_KEY"] || config["CULQI_PUBLIC_KEY"];
        if (!sk) return { success: false, error: "Ingrese la llave privada o pública de Culqi para verificar" };

        const res = await fetch("https://api.culqi.com/v2/events", {
          headers: { Authorization: `Bearer ${sk}` },
        });

        if (res.status === 200 || res.status === 403 || res.status === 400) {
          return { success: true, message: "Conexión establecida con los servidores de Culqi" };
        } else {
          return { success: false, error: `Llave de Culqi rechazada (Status ${res.status})` };
        }
      }

      default:
        return { success: false, error: "Servicio no soportado para prueba automática" };
    }
  } catch (error: any) {
    return { success: false, error: `Fallo de red al intentar verificar el servicio: ${error.message}` };
  }
}
