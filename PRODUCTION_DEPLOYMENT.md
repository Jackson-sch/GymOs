# 🚀 Guía de Despliegue en Producción - GymOS Platform

Esta guía detalla los pasos, configuraciones, credenciales y variables de entorno necesarias para llevar **GymOS** desde un entorno de desarrollo/pruebas a un entorno de producción real, seguro y de alta disponibilidad.

---

## 📋 1. Variables de Entorno (`.env`)

En tu plataforma de despliegue (Vercel, AWS, VPS, Docker, Supabase, etc.), configura las siguientes variables obligatorias:

```env
# 1. Base de Datos (PostgreSQL en Supabase, Neon, AWS RDS, o Prisma Postgres)
# Asegúrate de incluir el parámetro de conexión SSL (?sslmode=require o pgbouncer=true según tu proveedor)
DATABASE_URL="postgresql://usuario:contraseña@servidor.com:5432/gymos_prod?sslmode=require"

# 2. Dominio Oficial (URL raíz de la aplicación sin barra "/" al final)
NEXT_PUBLIC_APP_URL="https://app.tugimnasio.com"

# 3. Autenticación y Sesiones (Better Auth)
BETTER_AUTH_URL="https://app.tugimnasio.com"
# Genera un secreto fuerte de 64 caracteres en la terminal con: openssl rand -base64 32
BETTER_AUTH_SECRET="tu_secreto_criptografico_super_seguro_y_aleatorio"
```

---

## 💳 2. Pasarelas de Pago y Webhooks en Vivo

Para poder recibir pagos reales y activar suscripciones de forma automatizada:

### Mercado Pago
1. **Credenciales**: Accede a tu panel en [Mercado Pago Developers](https://www.mercadopago.com/developers) y obtén tus credenciales de **Producción** (`APP_USR-...`). Reemplaza el token de pruebas (`TEST-...`) en el panel de **Ajustes > API / Integraciones** de GymOS.
2. **Webhook / IPN**: En la configuración de notificaciones de Mercado Pago, añade la URL oficial de tu servidor:
   ```text
   https://app.tugimnasio.com/api/webhooks/mercadopago
   ```
   * Eventos a suscribir: `Pagos` (`payments`).

### Culqi
1. **Credenciales**: Entra a tu cuenta en el [Culqi Panel](https://panel.culqi.com), genera tus llaves en modo **Live** (`pk_live_...` y `sk_live_...`) y configúralas en la sección de Ajustes del sistema de GymOS.
2. **Webhook**: En el panel de Culqi (sección Eventos y Webhooks), registra la URL de escucha:
   ```text
   https://app.tugimnasio.com/api/webhooks/culqi
   ```
   * Evento a suscribir: `charge.creation.succeeded`.

---

## 📧 3. Servicio de Correos (Resend)

Para asegurar la máxima tasa de entrega y que los correos no lleguen a SPAM ni se queden en modo sandbox:

1. **Verificación DNS**: Accede a [Resend](https://resend.com) y registra tu dominio (ej. `tugimnasio.com`). Copia los registros DNS proporcionados (DKIM, SPF y DMARC) y agrégalos en tu administrador de DNS (Cloudflare, GoDaddy, Namecheap, etc.).
2. **Remitente Oficial**: En el panel de Ajustes de GymOS (Ajustes > API / Integraciones), establece en el campo `RESEND_FROM_EMAIL` tu correo de dominio verificado (ejemplo: `GymOS Elite <notificaciones@tugimnasio.com>`).
3. **Manejo de Errores**: GymOS captura cualquier fallo en el envío y lo registra automáticamente en el Centro de Comunicaciones con el estado `ERROR` para que puedas auditar si ocurrió algún fallo de API Key o cuota.

---

## ⏰ 4. Tareas Programadas Automáticas (Cron Jobs)

GymOS realiza verificaciones nocturnas para detectar membresías vencidas, expirar planes y enviar correos de recordatorio.

1. El endpoint seguro para ejecutar los procesos de mantenimiento es:
   ```text
   GET https://app.tugimnasio.com/api/cron/check-expirations
   ```
2. **Si alojas en Vercel**: El archivo `vercel.json` ya incluye la declaración para ejecutar este cron de manera automática.
3. **Si alojas en VPS o plataformas de terceros**: Utiliza servicios de monitoreo gratuitos como [Cron-job.org](https://cron-job.org) o [Upstash QStash](https://upstash.com) configurando una solicitud HTTP GET diaria a la medianoche (`00:00 UTC`).

---

## 🖼️ 5. Almacenamiento de Imágenes y Medios (Cloudinary)

1. En tu cuenta de [Cloudinary](https://cloudinary.com), verifica que el **Upload Preset** configurado en GymOS (`CLOUDINARY_UPLOAD_PRESET`) tenga el modo de firma **Unsigned** habilitado.
2. Esto permitirá la subida ágil y segura de avatares de socios, entrenadores y fotografías antropométricas desde cualquier dispositivo móvil o de escritorio.

---

## 🛡️ 6. Lista de Verificación Final (Pre-Lanzamiento)

- [ ] Generar un nuevo `BETTER_AUTH_SECRET` seguro.
- [ ] Configurar credenciales de Mercado Pago y Culqi en modo LIVE.
- [ ] Registrar URLs de Webhooks en Mercado Pago y Culqi.
- [ ] Verificar registros DNS en Resend e ingresar el correo oficial en GymOS.
- [ ] Comprobar que el cron job nocturno esté activo.
- [ ] Realizar una transacción de prueba en vivo (compra de plan de menor valor) para validar el flujo completo de pago, webhook atómico y envío de recibo por correo.
