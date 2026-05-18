# 🌐 APIs, Webhooks e Integraciones Externas

**GymOS Platform** se conecta de manera transparente con servicios líderes en la nube para procesar pagos en vivo, enviar notificaciones omnicanal, gestionar imágenes y automatizar flujos de trabajo.

---

## 💳 1. Pasarelas de Pago y Webhooks Atómicos

GymOS soporta de forma nativa dos de las pasarelas más importantes en Latinoamérica: **Mercado Pago** y **Culqi**.

```text
┌─────────────────────────┐         HTTP POST          ┌─────────────────────────┐
│ Mercado Pago / Culqi    ├───────────────────────────►│ GymOS API Endpoint      │
│ Servidor de Webhooks    │  (Evento: Pago Exitoso)    │ (/api/webhooks/...)     │
└─────────────────────────┘                            └────────────┬────────────┘
                                                                    │
                                                     1. Validar Firma / Token
                                                     2. Transacción Idempotente
                                                                    │
                                                       ┌────────────▼────────────┐
                                                       │ Prisma Database         │
                                                       │ - Crear Payment         │
                                                       │ - Renovar Membresía     │
                                                       └────────────┬────────────┘
                                                                    │
                                                     3. Disparar Notificación
                                                                    │
                                                       ┌────────────▼────────────┐
                                                       │ Resend / Twilio         │
                                                       │ Envío de Recibo & QR    │
                                                       └─────────────────────────┘
```

### Hub General de Webhooks
- **Endpoint Raíz**: `/api/webhooks`
  - Implementa manejadores `GET` (para verificación de disponibilidad y pings de salud desde paneles de desarrolladores) y `POST` (como proxy de recepción general).

### Mercado Pago
- **Generación de Preferencias**: Se realiza desde el Server Action `createMercadoPagoPreferenceAction`, el cual devuelve un `init_point` y un `sandbox_init_point` para redirigir al usuario al flujo de pago seguro.
- **Webhook Endpoint**: `/api/webhooks/mercadopago`
  - Implementa `GET` para pings de verificación y `POST` para notificaciones en vivo.
  - Escucha eventos de tipo `payment`.
  - Consulta la API de Mercado Pago con el ID recibido para verificar el estado `approved`.
  - Procesa atómicamente la renovación de la membresía y registra el pago en la tabla `Payment`.

### Culqi (Perú)
- **Tokenización y Cargo**: El modal cliente `OnlinePaymentModal.tsx` utiliza el SDK de Culqi v4 para tokenizar la tarjeta de crédito/débito o Yape.
- **Procesamiento de Pago**: Se ejecuta en el servidor mediante `processCulqiPaymentAction`.
- **Webhook Endpoint**: `/api/webhooks/culqi`
  - Escucha el evento asíncrono `charge.creation.succeeded`.
  - Verifica si el ID de cargo ya fue procesado para evitar duplicidad (Idempotencia).

---

## 📧 2. Notificaciones y Correos Electrónicos (Resend)

La mensajería de GymOS está centralizada en la utilidad `src/lib/email.ts`.

### Flujo de Envío con Auditoría (`sendEmailWithLog`)
1. **Renderizado de Plantilla HTML**: Se utiliza `@react-email/components` para construir plantillas modernas (ej. `WelcomeEmail.tsx`, `ReceiptEmail.tsx`).
2. **Transformación de QR**: Si la plantilla requiere mostrar el código QR de acceso del socio, el identificador crudo se transforma en una URL universal compatible mediante la API de `api.qrserver.com`.
3. **Envío y Fallback**:
   - Se envía a través de la API de **Resend**.
   - En modo desarrollo o si no hay un dominio verificado configurado en `RESEND_FROM_EMAIL`, se utiliza automáticamente el remitente de pruebas `onboarding@resend.dev`.
4. **Registro de Auditoría**: El resultado (éxito o error) se persiste en la tabla `AppNotification` para su visualización en tiempo real en la pantalla **Centro de Comunicaciones** (`/settings/notifications`).

---

## 🖼️ 3. Gestión de Medios en la Nube (Cloudinary)

Todas las fotografías antropométricas, avatares de socios y logos del gimnasio se cargan directamente a **Cloudinary** para no saturar el servidor de base de datos ni el almacenamiento de la aplicación.

- **Componente**: `ImageUpload.tsx`
- **Configuración requerida**: En Ajustes > Canales API, se debe ingresar el `CLOUDINARY_CLOUD_NAME` y un `CLOUDINARY_UPLOAD_PRESET` configurado en Cloudinary con modo de firma **Unsigned**.

---

## ⏰ 4. Automatización y Cron Jobs

Para mantener la base de datos sincronizada y enviar recordatorios automáticos sin intervención humana:

- **Endpoint**: `/api/cron/check-expirations`
- **Frecuencia recomendada**: Diaria a las `00:00 UTC` (Medianoche).
- **Acciones ejecutadas**:
  1. Busca todas las membresías cuyo `endDate` sea menor a la fecha actual y tengan estado `ACTIVE`.
  2. Actualiza su estado a `EXPIRED` o `CANCELLED`.
  3. Identifica membresías próximas a vencer (en los siguientes 3 días) y dispara la notificación de alerta al correo del socio.
