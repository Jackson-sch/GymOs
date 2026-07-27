import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { prisma } from "./prisma";

// Clave maestra y sal desde .env
if (process.env.NODE_ENV === "production" && (!process.env.CONFIG_SECRET || process.env.CONFIG_SECRET === "default-secret-change-me")) {
  throw new Error("CRITICAL SECURITY ERROR: CONFIG_SECRET no está configurada para el entorno de producción");
}

const ALGORITHM = "aes-256-cbc";

let cachedEncryptionKey: Buffer | null = null;
function getEncryptionKey(): Buffer {
  if (!cachedEncryptionKey) {
    const secret = process.env.CONFIG_SECRET || "default-secret-change-me";
    const salt = process.env.CONFIG_SALT || "gymos-default-secure-salt-2026";
    cachedEncryptionKey = scryptSync(secret, salt, 32);
  }
  return cachedEncryptionKey;
}

/**
 * Encripta un texto usando AES-256-CBC
 */
function encrypt(text: string): string {
  try {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (error) {
    console.error("[Config Encryption Error]: Fallo al encriptar", error);
    return text;
  }
}

/**
 * Decripta un texto usando AES-256-CBC
 */
function decrypt(encrypted: string): string {
  if (!encrypted || typeof encrypted !== "string") return encrypted;
  if (!encrypted.includes(":")) return encrypted;

  try {
    const [ivHex, encryptedHex] = encrypted.split(":");
    if (!ivHex || !encryptedHex) return encrypted;

    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString();
  } catch (error) {
    console.error("[Config Decryption Error]: Fallo al descifrar el valor. Devolviendo raw.", error);
    return encrypted;
  }
}

export type ConfigCategoryType = 
  | "TWILIO" 
  | "RESEND" 
  | "WHATSAPP" 
  | "PAYMENT" 
  | "UPLOADTHING" 
  | "GENERAL" 
  | "NOTIFICATIONS" 
  | "CLOUDINARY";

/**
 * Obtiene una configuración desde la base de datos (con fallback de Organización a Global)
 */
export async function getConfig(key: string, organizationId?: string | null): Promise<string | null> {
  const targetOrgId = organizationId ?? null;

  if (targetOrgId) {
    const orgConfig = await prisma.systemConfig.findFirst({
      where: { organizationId: targetOrgId, key },
    });
    if (orgConfig) {
      return orgConfig.isEncrypted ? decrypt(orgConfig.value) : orgConfig.value;
    }
  }

  const globalConfig = await prisma.systemConfig.findFirst({
    where: { organizationId: null, key },
  });
  
  if (!globalConfig) return null;
  return globalConfig.isEncrypted ? decrypt(globalConfig.value) : globalConfig.value;
}

/**
 * Guarda o actualiza una configuración en la base de datos para una Organización o Global
 */
export async function setConfig(
  key: string,
  value: string,
  category: ConfigCategoryType,
  shouldEncrypt = false,
  userId?: string,
  organizationId?: string | null
): Promise<void> {
  const targetOrgId = organizationId ?? null;

  const existing = await prisma.systemConfig.findFirst({
    where: { organizationId: targetOrgId, key },
  });

  if (existing) {
    await prisma.systemConfig.update({
      where: { id: existing.id },
      data: {
        value: shouldEncrypt ? encrypt(value) : value,
        isEncrypted: shouldEncrypt,
        updatedById: userId,
        category,
      },
    });
  } else {
    await prisma.systemConfig.create({
      data: {
        organizationId: targetOrgId,
        key,
        value: shouldEncrypt ? encrypt(value) : value,
        isEncrypted: shouldEncrypt,
        category,
        updatedById: userId,
      },
    });
  }
}

/**
 * Obtiene un mapa de configuraciones de forma masiva (con fallback de Organización a Global)
 */
export async function getConfigMap(keys: string[], organizationId?: string | null) {
  const result: Record<string, string> = {};

  // 1. Obtener configuraciones globales primero
  const globalConfigs = await prisma.systemConfig.findMany({
    where: { organizationId: "global", key: { in: keys } },
  });
  for (const c of globalConfigs) {
    result[c.key] = c.isEncrypted ? decrypt(c.value) : c.value;
  }

  // 2. Sobrescribir con configuraciones específicas de la Organización si existe
  if (organizationId && organizationId !== "global") {
    const orgConfigs = await prisma.systemConfig.findMany({
      where: { organizationId, key: { in: keys } },
    });
    for (const c of orgConfigs) {
      result[c.key] = c.isEncrypted ? decrypt(c.value) : c.value;
    }
  }

  return result;
}

