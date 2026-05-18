import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

import { admin } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    rateLimit: {
        enabled: true,
        window: 60,
        max: 15,
        storage: "memory",
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            if (process.env.NODE_ENV === "development") {
                console.log("==========================================");
                console.log(`[AUTH EVENT: VERIFY EMAIL FOR ${user.email}]`);
                console.log(`Enlace de verificación: ${url}`);
                console.log("==========================================");
            }
            try {
                const { sendEmail } = await import("./email");
                await sendEmail({
                    to: user.email,
                    subject: "Verificación de Cuenta - GymOS",
                    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <h2 style="font-family: serif; font-size: 24px; margin-bottom: 16px; color: #ffffff;">Verificación de Identidad en GymOS</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Hola <strong>${user.name}</strong>, bienvenido a GymOS. Confirma tu correo electrónico para activar tu cuenta digital.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${url}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #000000; font-weight: 600; text-decoration: none; border-radius: 12px; font-size: 14px;">Verificar Cuenta</a>
                        </div>
                        <p style="font-size: 12px; color: #71717a; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;">El enlace de verificación expirará pronto.</p>
                    </div>`,
                });
            } catch (err) {
                console.error("❌ Error al enviar correo de verificación en sendVerificationEmail:", err);
            }
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
            if (process.env.NODE_ENV === "development") {
                console.log("==========================================");
                console.log(`[AUTH EVENT: RESET PASSWORD FOR ${user.email}]`);
                console.log(`Enlace de recuperación: ${url}`);
                console.log("==========================================");
            }
            try {
                const { sendEmail } = await import("./email");
                await sendEmail({
                    to: user.email,
                    subject: "Recuperación de Contraseña - GymOS",
                    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <h2 style="font-family: serif; font-size: 24px; margin-bottom: 16px; color: #ffffff;">Recuperación de Clave de Acceso en GymOS</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Hola <strong>${user.name}</strong>, hemos recibido una solicitud para restablecer la contraseña asociada a tu identidad digital en GymOS.</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Haz clic en el siguiente botón para crear una nueva contraseña segura:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${url}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #000000; font-weight: 600; text-decoration: none; border-radius: 12px; font-size: 14px;">Restablecer Contraseña</a>
                        </div>
                        <p style="font-size: 12px; color: #71717a; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura. El enlace expirará pronto.</p>
                    </div>`,
                });
            } catch (err) {
                console.error("❌ Error al enviar correo de recuperación en sendResetPassword:", err);
            }
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "RECEPTIONIST",
            },
            isActive: {
                type: "boolean",
                defaultValue: true,
            }
        }
    },
    plugins: [
        admin({
            defaultRole: "RECEPTIONIST"
        })
    ]
});
