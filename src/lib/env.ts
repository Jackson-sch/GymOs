import { z } from 'zod';

const serverSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida de PostgreSQL'),
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET es requerido'),
  CRON_SECRET: z.string().optional(),
  ALLOWED_DEV_ORIGIN: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL debe ser una URL válida').optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('NEXT_PUBLIC_SENTRY_DSN debe ser una URL válida').optional(),
});

const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
  ALLOWED_DEV_ORIGIN: process.env.ALLOWED_DEV_ORIGIN,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
};

const parsedServer = serverSchema.safeParse(processEnv);
const parsedClient = clientSchema.safeParse(processEnv);

if (!parsedServer.success || !parsedClient.success) {
  console.error(
    '❌ Variables de entorno inválidas:',
    parsedServer.success ? '' : JSON.stringify(parsedServer.error.format(), null, 2),
    parsedClient.success ? '' : JSON.stringify(parsedClient.error.format(), null, 2)
  );
  throw new Error('Variables de entorno mal configuradas');
}

export const env = {
  ...parsedServer.data,
  ...parsedClient.data,
};
