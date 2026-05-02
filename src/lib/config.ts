import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { prisma } from "../../prisma";

// Clave maestra desde .env
const CONFIG_SECRET = process.env.CONFIG_SECRET || "default-secret-change-me";
const ENCRYPTION_KEY = scryptSync(CONFIG_SECRET, "salt", 32);
const ALGORITHM = "aes-256-cbc";

/**
 * Encripta un texto usando AES-256-CBC
 */
function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decripta un texto usando AES-256-CBC
 */
function decrypt(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(":");
  if (!ivHex || !encryptedHex) return encrypted;
  
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
}

/**
 * Obtiene una configuración desde la base de datos
 */
export async function getConfig(key: string): Promise<string | null> {
  const config = await prisma.systemConfig.findUnique({ where: { key } });
  if (!config) return null;
  return config.isEncrypted ? decrypt(config.value) : config.value;
}

/**
 * Guarda o actualiza una configuración en la base de datos
 */
export async function setConfig(
  key: string,
  value: string,
  category: "TWILIO" | "RESEND" | "PAYMENT" | "UPLOADTHING" | "GENERAL" | "NOTIFICATIONS" | "CLOUDINARY",
  shouldEncrypt = false,
  userId?: string
): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { key },
    update: {
      value: shouldEncrypt ? encrypt(value) : value,
      isEncrypted: shouldEncrypt,
      updatedById: userId,
    },
    create: {
      key,
      value: shouldEncrypt ? encrypt(value) : value,
      isEncrypted: shouldEncrypt,
      category,
      updatedById: userId,
    },
  });
}

/**
 * Obtiene un mapa de configuraciones de forma masiva
 */
export async function getConfigMap(keys: string[]) {
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: keys } },
  });
  
  const result: Record<string, string> = {};
  for (const c of configs) {
    result[c.key] = c.isEncrypted ? decrypt(c.value) : c.value;
  }
  return result;
}
