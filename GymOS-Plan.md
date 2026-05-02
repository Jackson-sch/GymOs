# GymOS — Plan de Implementación del Sistema de Gestión para Gimnasio

> Stack: Next.js 16 · Prisma 7 · PostgreSQL · Bun · shadcn/ui · Tailwind CSS 4 · Nuqs · Twilio · Resend · React Email · Rosen Charts · pdfx · NextAuth v5 · Zod · Zustand · date-fns · uploadthing

---

## Índice

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Esquema Prisma](#3-esquema-prisma)
4. [Módulos del sistema](#4-módulos-del-sistema)
5. [API Keys desde base de datos](#5-api-keys-desde-base-de-datos)
6. [Servicios externos](#6-servicios-externos)
7. [Notificaciones automáticas](#7-notificaciones-automáticas)
8. [Reportes y analytics](#8-reportes-y-analytics)
9. [Autenticación y roles (RBAC)](#9-autenticación-y-roles-rbac)
10. [Fases de implementación](#10-fases-de-implementación)
11. [Comandos iniciales con Bun](#11-comandos-iniciales-con-bun)

---

## 1. Stack tecnológico

### Core

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.x (App Router) | Framework fullstack |
| Bun | 1.x | Runtime + package manager |
| TypeScript | 5.x | Tipado estático |
| PostgreSQL | 16.x | Base de datos principal |
| Prisma | 7.x | ORM + migraciones |

### UI

| Tecnología | Rol |
|---|---|
| shadcn/ui | Componentes base |
| Tailwind CSS 4 | Estilos utilitarios |
| Rosen Charts | Gráficos y dashboards |
| Nuqs | Estado en URL (filtros, paginación) |
| Zustand | Estado global cliente |

### Servicios / Comunicación

| Tecnología | Rol |
|---|---|
| Twilio | SMS — alertas, vencimientos, check-in |
| Resend | Email transaccional |
| React Email | Plantillas de correo |
| uploadthing | Subida de fotos y documentos |
| pdfx | Generación de facturas y reportes PDF |

### Seguridad / Auth

| Tecnología | Rol |
|---|---|
| NextAuth v5 | Autenticación con sesiones |
| Zod | Validación de esquemas |
| bcrypt | Hash de contraseñas |
| AES-256 (crypto nativo) | Encriptación de API keys en BD |

### Utilidades adicionales

| Tecnología | Rol |
|---|---|
| date-fns | Manipulación de fechas |
| qrcode | Generación de QR por miembro |
| html5-qrcode | Escaneo de QR por cámara |
| next-cron / Vercel Cron | Jobs programados |
| papaparse | Exportación a CSV |

---

## 2. Estructura del proyecto

```
gymos/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            ← sidebar + navbar
│   │   │   ├── page.tsx              ← dashboard principal
│   │   │   ├── members/
│   │   │   │   ├── page.tsx          ← lista de miembros
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      ← perfil del miembro
│   │   │   │   └── new/
│   │   │   │       └── page.tsx      ← registro
│   │   │   ├── plans/
│   │   │   │   └── page.tsx
│   │   │   ├── memberships/
│   │   │   │   └── page.tsx
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   ├── classes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── trainers/
│   │   │   │   └── page.tsx
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx          ← API keys, roles, config
│   │   ├── checkin/
│   │   │   └── page.tsx              ← pantalla pública de check-in
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts
│   │   │   ├── webhooks/
│   │   │   │   └── route.ts
│   │   │   └── uploadthing/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── actions/                       ← Server Actions
│   │   ├── members.ts
│   │   ├── memberships.ts
│   │   ├── payments.ts
│   │   ├── attendance.ts
│   │   ├── classes.ts
│   │   ├── notifications.ts
│   │   └── config.ts
│   ├── components/
│   │   ├── ui/                        ← shadcn/ui components
│   │   ├── forms/
│   │   │   ├── MemberForm.tsx
│   │   │   ├── PlanForm.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── ClassForm.tsx
│   │   ├── tables/
│   │   │   ├── MembersTable.tsx
│   │   │   ├── PaymentsTable.tsx
│   │   │   └── AttendanceTable.tsx
│   │   ├── charts/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── AttendanceChart.tsx
│   │   │   └── MembershipChart.tsx
│   │   ├── emails/                    ← React Email templates
│   │   │   ├── WelcomeEmail.tsx
│   │   │   ├── ExpirationEmail.tsx
│   │   │   ├── PaymentReceiptEmail.tsx
│   │   │   └── ClassReminderEmail.tsx
│   │   └── shared/
│   │       ├── QRScanner.tsx
│   │       ├── QRCode.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── prisma.ts                  ← Prisma client singleton
│   │   ├── auth.ts                    ← NextAuth config
│   │   ├── config.ts                  ← Lee API keys desde BD (AES-256)
│   │   ├── twilio.ts
│   │   ├── resend.ts
│   │   ├── pdf.ts                     ← pdfx helpers
│   │   ├── qr.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── emails/                            ← Preview de React Email
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Esquema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          UserRole  @default(RECEPTIONIST)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  auditLogs     AuditLog[]
  configUpdates SystemConfig[]

  @@map("users")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  RECEPTIONIST
  TRAINER
}

// ─────────────────────────────────────────
// MIEMBROS
// ─────────────────────────────────────────

model Member {
  id            String         @id @default(cuid())
  fullName      String
  email         String?        @unique
  phone         String
  dni           String?        @unique
  birthDate     DateTime?
  gender        Gender?
  photo         String?
  qrCode        String         @unique @default(cuid())
  status        MemberStatus   @default(ACTIVE)
  emergencyContact String?
  emergencyPhone   String?
  notes         String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  memberships   Membership[]
  attendances   Attendance[]
  payments      Payment[]
  bodyMetrics   BodyMetric[]
  classBookings ClassBooking[]

  @@map("members")
}

enum MemberStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

model BodyMetric {
  id        String   @id @default(cuid())
  memberId  String
  weight    Float?
  height    Float?
  bmi       Float?
  bodyFat   Float?
  muscle    Float?
  notes     String?
  measuredAt DateTime @default(now())

  member    Member   @relation(fields: [memberId], references: [id])

  @@map("body_metrics")
}

// ─────────────────────────────────────────
// PLANES Y MEMBRESÍAS
// ─────────────────────────────────────────

model Plan {
  id            String      @id @default(cuid())
  name          String
  description   String?
  price         Decimal     @db.Decimal(10, 2)
  durationDays  Int
  maxFreezeDays Int         @default(0)
  allowedClasses Boolean    @default(true)
  features      Json        @default("[]")
  isActive      Boolean     @default(true)
  color         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  memberships   Membership[]

  @@map("plans")
}

model Membership {
  id          String           @id @default(cuid())
  memberId    String
  planId      String
  startDate   DateTime
  endDate     DateTime
  status      MembershipStatus @default(ACTIVE)
  autoRenew   Boolean          @default(false)
  frozenAt    DateTime?
  frozenDays  Int              @default(0)
  price       Decimal          @db.Decimal(10, 2)
  notes       String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  member      Member    @relation(fields: [memberId], references: [id])
  plan        Plan      @relation(fields: [planId], references: [id])
  payments    Payment[]

  @@map("memberships")
}

enum MembershipStatus {
  ACTIVE
  EXPIRED
  FROZEN
  CANCELLED
  PENDING
}

// ─────────────────────────────────────────
// ASISTENCIA
// ─────────────────────────────────────────

model Attendance {
  id        String          @id @default(cuid())
  memberId  String
  checkIn   DateTime        @default(now())
  checkOut  DateTime?
  method    CheckInMethod   @default(QR)
  classId   String?
  notes     String?

  member    Member    @relation(fields: [memberId], references: [id])
  class     Class?    @relation(fields: [classId], references: [id])

  @@map("attendances")
}

enum CheckInMethod {
  QR
  NFC
  PIN
  MANUAL
}

// ─────────────────────────────────────────
// PAGOS
// ─────────────────────────────────────────

model Payment {
  id            String        @id @default(cuid())
  memberId      String
  membershipId  String?
  amount        Decimal       @db.Decimal(10, 2)
  method        PaymentMethod
  status        PaymentStatus @default(PENDING)
  reference     String?
  invoiceUrl    String?
  invoiceNumber String?       @unique
  notes         String?
  paidAt        DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  member        Member      @relation(fields: [memberId], references: [id])
  membership    Membership? @relation(fields: [membershipId], references: [id])

  @@map("payments")
}

enum PaymentMethod {
  CASH
  CARD
  TRANSFER
  YAPE
  PLIN
  CULQI
  MERCADOPAGO
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// ─────────────────────────────────────────
// CLASES
// ─────────────────────────────────────────

model Class {
  id           String      @id @default(cuid())
  name         String
  description  String?
  trainerId    String
  maxCapacity  Int
  durationMins Int
  location     String?
  color        String?
  isRecurring  Boolean     @default(false)
  recurrence   Json?
  startTime    DateTime
  endTime      DateTime
  status       ClassStatus @default(SCHEDULED)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  trainer      Trainer      @relation(fields: [trainerId], references: [id])
  bookings     ClassBooking[]
  attendances  Attendance[]

  @@map("classes")
}

enum ClassStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model ClassBooking {
  id        String        @id @default(cuid())
  classId   String
  memberId  String
  status    BookingStatus @default(CONFIRMED)
  bookedAt  DateTime      @default(now())

  class     Class   @relation(fields: [classId], references: [id])
  member    Member  @relation(fields: [memberId], references: [id])

  @@unique([classId, memberId])
  @@map("class_bookings")
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  ATTENDED
  NO_SHOW
}

// ─────────────────────────────────────────
// ENTRENADORES
// ─────────────────────────────────────────

model Trainer {
  id           String    @id @default(cuid())
  fullName     String
  email        String    @unique
  phone        String
  photo        String?
  specialties  String[]
  bio          String?
  commissionPct Decimal? @db.Decimal(5, 2)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  classes      Class[]

  @@map("trainers")
}

// ─────────────────────────────────────────
// INVENTARIO
// ─────────────────────────────────────────

model Equipment {
  id               String          @id @default(cuid())
  name             String
  category         String
  serialNumber     String?         @unique
  purchaseDate     DateTime?
  purchasePrice    Decimal?        @db.Decimal(10, 2)
  status           EquipmentStatus @default(OPERATIONAL)
  lastMaintenance  DateTime?
  nextMaintenance  DateTime?
  notes            String?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@map("equipment")
}

enum EquipmentStatus {
  OPERATIONAL
  MAINTENANCE
  OUT_OF_SERVICE
}

// ─────────────────────────────────────────
// CONFIGURACIÓN DEL SISTEMA (API Keys)
// ─────────────────────────────────────────

model SystemConfig {
  key          String          @id
  value        String
  isEncrypted  Boolean         @default(false)
  category     ConfigCategory
  description  String?
  updatedAt    DateTime        @updatedAt
  updatedById  String?

  updatedBy    User?  @relation(fields: [updatedById], references: [id])

  @@map("system_configs")
}

enum ConfigCategory {
  TWILIO
  RESEND
  PAYMENT
  UPLOADTHING
  GENERAL
  NOTIFICATIONS
}

// ─────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String
  entity     String
  entityId   String?
  oldData    Json?
  newData    Json?
  ipAddress  String?
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}

// ─────────────────────────────────────────
// NOTIFICACIONES
// ─────────────────────────────────────────

model Notification {
  id        String             @id @default(cuid())
  memberId  String?
  type      NotificationType
  channel   NotificationChannel
  status    NotificationStatus @default(PENDING)
  subject   String?
  body      String
  sentAt    DateTime?
  error     String?
  createdAt DateTime           @default(now())

  @@map("notifications")
}

enum NotificationType {
  WELCOME
  MEMBERSHIP_EXPIRING
  MEMBERSHIP_EXPIRED
  PAYMENT_RECEIPT
  PAYMENT_OVERDUE
  CLASS_REMINDER
  CLASS_CANCELLED
  CUSTOM
}

enum NotificationChannel {
  EMAIL
  SMS
  BOTH
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
}
```

---

## 4. Módulos del sistema

### 4.1 Módulo de Miembros

Funcionalidades principales:
- Registro con datos personales, foto (uploadthing), contacto de emergencia
- Generación automática de QR único por miembro
- Métricas corporales con historial (peso, talla, IMC, grasa corporal)
- Búsqueda avanzada con filtros por estado, plan, vencimiento (Nuqs)
- Vista de perfil con historial de asistencias, pagos y membresías

Rutas: `GET/POST /members` · `GET/PUT/DELETE /members/[id]`

### 4.2 Módulo de Planes y Membresías

Funcionalidades principales:
- CRUD de planes con precios, duración, características y límite de congelamiento
- Asignación de membresía a miembro con fecha inicio/fin calculada automáticamente
- Congelamiento de membresía (extiende automáticamente la fecha fin)
- Renovación manual o automática
- Alertas de vencimiento (3 días antes y al vencer)

### 4.3 Módulo de Asistencia / Check-in

Funcionalidades principales:
- Pantalla pública `/checkin` para escaneo de QR con `html5-qrcode`
- Check-in manual por búsqueda de nombre o DNI
- Check-in por PIN de 4 dígitos
- Validación en tiempo real: membresía activa, foto del miembro, días restantes
- Registro automático de entrada y salida
- Reporte de asistencia por día, semana y mes (Rosen Charts)

### 4.4 Módulo de Pagos

Funcionalidades principales:
- Registro de cobros con múltiples métodos (efectivo, Yape, Plin, tarjeta, transferencia)
- Numeración automática de facturas (`GYM-2024-0001`)
- Generación de facturas PDF con `pdfx` (logo, datos del gimnasio, detalle)
- Historial de pagos filtrable por período, método y estado (Nuqs)
- Panel de deudas y pagos pendientes
- Integración con Culqi o Mercado Pago para cobros en línea

### 4.5 Módulo de Clases

Funcionalidades principales:
- CRUD de clases con horario, capacidad máxima y entrenador asignado
- Calendario semanal/mensual de clases
- Sistema de reservas con lista de espera
- Confirmación de reserva vía SMS/email
- Control de asistencia por clase
- Clases recurrentes con configuración de días y horas

### 4.6 Módulo de Entrenadores

Funcionalidades principales:
- Perfiles con especialidades, bio y foto
- Asignación de clases y clientes
- Cálculo de comisiones por clases dictadas
- Disponibilidad y horarios
- Historial de clases dictadas

### 4.7 Módulo de Inventario

Funcionalidades principales:
- Registro de equipos con número de serie y fecha de compra
- Estados: operacional, en mantenimiento, fuera de servicio
- Alertas automáticas de mantenimiento programado
- Historial de mantenimientos

### 4.8 Módulo de Reportes

Funcionalidades principales:
- Dashboard principal con KPIs (ingresos del mes, miembros activos, asistencia hoy, clases del día)
- Gráfico de ingresos por mes (Rosen Charts BarChart)
- Gráfico de asistencia por día de semana (Rosen Charts LineChart)
- Distribución de membresías por plan (Rosen Charts PieChart)
- Tasa de retención y churn mensual
- Exportación a PDF (`pdfx`) y CSV (`papaparse`)
- Rango de fechas con filtros en URL (Nuqs)

### 4.9 Módulo de Configuración

Funcionalidades principales:
- Gestión de API keys (Twilio, Resend, pasarela de pago) guardadas en BD encriptadas con AES-256
- Datos del gimnasio (nombre, logo, dirección, RUC)
- Configuración de notificaciones automáticas (activar/desactivar, plantillas)
- Gestión de usuarios y roles (RBAC)
- Audit log completo de cambios
- Backup y exportación de datos

---

## 5. API Keys desde base de datos

```typescript
// src/lib/config.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"
import { prisma } from "./prisma"

const ENCRYPTION_KEY = scryptSync(process.env.CONFIG_SECRET!, "salt", 32)
const ALGORITHM = "aes-256-cbc"

function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`
}

function decrypt(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ])
  return decrypted.toString()
}

export async function getConfig(key: string): Promise<string | null> {
  const config = await prisma.systemConfig.findUnique({ where: { key } })
  if (!config) return null
  return config.isEncrypted ? decrypt(config.value) : config.value
}

export async function setConfig(
  key: string,
  value: string,
  category: string,
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
      category: category as any,
      updatedById: userId,
    },
  })
}

// Helpers por servicio
export const getConfigMap = async (keys: string[]) => {
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: keys } },
  })
  return Object.fromEntries(
    configs.map((c) => [c.key, c.isEncrypted ? decrypt(c.value) : c.value])
  )
}
```

---

## 6. Servicios externos

### 6.1 Twilio (SMS)

```typescript
// src/lib/twilio.ts
import twilio from "twilio"
import { getConfigMap } from "./config"

export async function getTwilioClient() {
  const cfg = await getConfigMap([
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
  ])
  return {
    client: twilio(cfg.TWILIO_ACCOUNT_SID, cfg.TWILIO_AUTH_TOKEN),
    from: cfg.TWILIO_PHONE_NUMBER,
  }
}

export async function sendSMS(to: string, body: string) {
  const { client, from } = await getTwilioClient()
  return client.messages.create({ to, from, body })
}
```

### 6.2 Resend + React Email

```typescript
// src/lib/resend.ts
import { Resend } from "resend"
import { getConfig } from "./config"

export async function getResendClient() {
  const apiKey = await getConfig("RESEND_API_KEY")
  return new Resend(apiKey!)
}

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  const resend = await getResendClient()
  const fromEmail = (await getConfig("RESEND_FROM_EMAIL")) ?? "gym@ejemplo.com"

  return resend.emails.send({
    from: fromEmail,
    to,
    subject,
    react,
  })
}
```

### 6.3 Plantilla React Email — Bienvenida

```tsx
// src/components/emails/WelcomeEmail.tsx
import {
  Body, Container, Head, Heading, Html,
  Preview, Section, Text, Button,
} from "@react-email/components"

interface WelcomeEmailProps {
  memberName: string
  planName: string
  startDate: string
  endDate: string
  qrCodeUrl: string
  gymName: string
}

export function WelcomeEmail({
  memberName,
  planName,
  startDate,
  endDate,
  qrCodeUrl,
  gymName,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido a {gymName}!</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "24px 0" }}>
          <Section style={{ backgroundColor: "#fff", borderRadius: 12, padding: 32 }}>
            <Heading style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              ¡Bienvenido, {memberName}!
            </Heading>
            <Text style={{ color: "#52525b", lineHeight: 1.6 }}>
              Tu membresía <strong>{planName}</strong> está activa desde el{" "}
              <strong>{startDate}</strong> hasta el <strong>{endDate}</strong>.
            </Text>
            <Text style={{ color: "#52525b" }}>
              Usa tu código QR para registrar tu asistencia:
            </Text>
            <img src={qrCodeUrl} alt="QR Code" width={160} height={160} />
            <Button
              href="#"
              style={{
                backgroundColor: "#18181b",
                color: "#fff",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 14,
              }}
            >
              Ver mi perfil
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

### 6.4 Generación de PDF con pdfx

```typescript
// src/lib/pdf.ts
import { PDFDocument, rgb, StandardFonts } from "pdfx"

export async function generateInvoicePDF(payment: {
  invoiceNumber: string
  memberName: string
  planName: string
  amount: number
  method: string
  paidAt: Date
  gymName: string
  gymAddress: string
  gymRuc: string
}): Promise<Buffer> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()

  // Header
  page.drawText(payment.gymName, {
    x: 50, y: height - 60,
    size: 22, font: fontBold, color: rgb(0.1, 0.1, 0.1),
  })
  page.drawText(payment.gymAddress, {
    x: 50, y: height - 82,
    size: 10, font, color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText(`RUC: ${payment.gymRuc}`, {
    x: 50, y: height - 96,
    size: 10, font, color: rgb(0.4, 0.4, 0.4),
  })

  // Invoice number
  page.drawText(`RECIBO ${payment.invoiceNumber}`, {
    x: width - 200, y: height - 60,
    size: 14, font: fontBold, color: rgb(0.1, 0.1, 0.1),
  })

  // Divider
  page.drawLine({
    start: { x: 50, y: height - 115 },
    end: { x: width - 50, y: height - 115 },
    thickness: 1, color: rgb(0.9, 0.9, 0.9),
  })

  // Body
  const rows = [
    ["Cliente:", payment.memberName],
    ["Plan:", payment.planName],
    ["Método de pago:", payment.method],
    ["Fecha:", payment.paidAt.toLocaleDateString("es-PE")],
    ["Total:", `S/. ${payment.amount.toFixed(2)}`],
  ]

  rows.forEach(([label, value], i) => {
    const y = height - 150 - i * 28
    page.drawText(label, { x: 50, y, size: 11, font: fontBold, color: rgb(0.3, 0.3, 0.3) })
    page.drawText(value, { x: 200, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) })
  })

  const bytes = await doc.save()
  return Buffer.from(bytes)
}
```

---

## 7. Notificaciones automáticas

### Cron jobs (Vercel Cron o next-cron)

```typescript
// src/app/api/cron/notifications/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/twilio"
import { sendEmail } from "@/lib/resend"
import { ExpirationEmail } from "@/components/emails/ExpirationEmail"
import { addDays, isBefore, isAfter } from "date-fns"

export const runtime = "nodejs"

// Vercel cron: "0 9 * * *" → todos los días a las 9am
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  const threeDaysAhead = addDays(today, 3)

  // Membresías que vencen en 3 días
  const expiringMemberships = await prisma.membership.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: today,
        lte: threeDaysAhead,
      },
    },
    include: { member: true, plan: true },
  })

  for (const membership of expiringMemberships) {
    const { member, plan } = membership
    const daysLeft = Math.ceil(
      (membership.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (member.phone) {
      await sendSMS(
        member.phone,
        `Hola ${member.fullName}, tu membresía ${plan.name} vence en ${daysLeft} día(s). Renueva para seguir entrenando.`
      )
    }

    if (member.email) {
      await sendEmail({
        to: member.email,
        subject: `Tu membresía vence en ${daysLeft} días`,
        react: ExpirationEmail({
          memberName: member.fullName,
          planName: plan.name,
          endDate: membership.endDate.toLocaleDateString("es-PE"),
          daysLeft,
        }),
      })
    }

    // Registrar notificación enviada
    await prisma.notification.create({
      data: {
        memberId: member.id,
        type: "MEMBERSHIP_EXPIRING",
        channel: member.email ? "BOTH" : "SMS",
        status: "SENT",
        body: `Vencimiento en ${daysLeft} días`,
        sentAt: new Date(),
      },
    })
  }

  return NextResponse.json({
    ok: true,
    processed: expiringMemberships.length,
  })
}
```

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/expire-memberships",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## 8. Reportes y Analytics

### KPIs del dashboard

```typescript
// src/actions/reports.ts
"use server"
import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"

export async function getDashboardKPIs() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const [
    activeMembers,
    newMembersThisMonth,
    revenueThisMonth,
    attendanceToday,
    expiringThisWeek,
    classesToday,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.member.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED", paidAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.attendance.count({
      where: { checkIn: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.membership.count({
      where: {
        status: "ACTIVE",
        endDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.class.count({
      where: {
        startTime: { gte: todayStart, lte: todayEnd },
        status: { not: "CANCELLED" },
      },
    }),
  ])

  return {
    activeMembers,
    newMembersThisMonth,
    revenueThisMonth: revenueThisMonth._sum.amount ?? 0,
    attendanceToday,
    expiringThisWeek,
    classesToday,
  }
}
```

### Gráfico de ingresos con Rosen Charts

```tsx
// src/components/charts/RevenueChart.tsx
"use client"
import React, { CSSProperties } from "react";
import { scaleBand, scaleLinear, max } from "d3";

const data = [
  { key: "Technology", value: 38.1, color: "#F5A5DB" },
  { key: "Financials", value: 25.3, color: "#B89DFB" },
  { key: "Energy", value: 23.1, color: "#758bcf" },
  { key: "Cyclical", value: 19.5, color: "#33C2EA" },
  { key: "Defensive", value: 14.7, color: "#FFC182" },
  { key: "Utilities", value: 5.8, color: "#87db72" },
].toSorted((a, b) => b.value - a.value);

export function HorizontalBarChart() {
  // Scales
  const yScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.175);

  const xScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([0, 100]);
  const radius = 2; // Adjust the radius for the rounded corners

  // Function to create a path for each bar with rounded right corners
  const roundedBarPath = (x: number, y: number, width: number, height: number, radius: number) => {
    return `M${x},${y}
            h${width - radius}
            a${radius},${radius} 0 0 1 ${radius},${radius}
            v${height - 2 * radius}
            a${radius},${radius} 0 0 1 -${radius},${radius}
            h${-width + radius}
            Z`;
  };

  const roundedInnerBarPath = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    strokeWidth: number
  ) => {
    // Adjusted dimensions for inner stroke
    const innerWidth = width - strokeWidth;
    const innerHeight = height - strokeWidth;
    const innerX = x + strokeWidth / 2;
    const innerY = y + strokeWidth / 2;
    const innerRadius = radius - strokeWidth / 2;

    return `M ${innerX}, ${innerY}
            h ${innerWidth - innerRadius}
            a ${innerRadius},${innerRadius} 0 0 1 ${innerRadius},${innerRadius}
            v ${innerHeight - 2 * innerRadius}
            a ${innerRadius},${innerRadius} 0 0 1 -${innerRadius},${innerRadius}
            h ${-innerWidth + innerRadius}
            `;
  };

  const longestWord = max(data.map((d) => d.key.length)) || 1;
  return (
    <div
      className="relative w-full h-72"
      style={
        {
          "--marginTop": "20px",
          "--marginRight": "8px",
          "--marginBottom": "25px",
          "--marginLeft": `${longestWord > 16 ? 112 : longestWord * 6.75}px`,
        } as CSSProperties
      }
    >
      {/* Chart Area */}
      <svg
        className="absolute inset-0
          z-10
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        <svg
          className="absolute overflow-hidden inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {xScale
            .ticks(8)
            .map(xScale.tickFormat(8, "d"))
            .map((active, i) => (
              <g
                transform={`translate(${xScale(+active)},0)`}
                className="text-gray-300/80 dark:text-gray-800/80"
                key={i}
              >
                <line
                  y1={0}
                  y2={100}
                  stroke="currentColor"
                  strokeDasharray="6,5"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}

          {/* Bars with Rounded Right Corners */}
          {data.map((d, index) => {
            const barWidth = xScale(d.value);
            const barHeight = yScale.bandwidth();
            const innerStrokeWidth = 0.25; // Adjust as needed

            const barPath = roundedBarPath(0, yScale(d.key)!, barWidth, barHeight, radius);

            const innerBarPath = roundedInnerBarPath(
              0,
              yScale(d.key)!,
              barWidth,
              barHeight,
              radius,
              innerStrokeWidth
            );
            return (
              <g key={index}>
                {/* Main Bar */}
                <path
                  d={barPath}
                  fill={`url(#bar0-gradient-line${index})`}
                  vectorEffect="non-scaling-stroke"
                />

                {/* Define the gradient */}
                <defs>
                  <linearGradient id={`bar0-gradient-line${index}`} x1="1" x2="1" y1="1" y2="1">
                    <stop offset="0%" stopColor={d.color} />
                    <stop offset="30%" stopColor={singleColor ?? d.color} />
                  </linearGradient>
                  <linearGradient id={`overlay-gradient${index}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="10%" stopColor="rgba(255, 255, 255, 0.45)" />
                    <stop offset="80%" stopColor="rgba(255, 255, 255, 0.1)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                  </linearGradient>
                </defs>

                {/* Inner stroke path, positioned to align with the edge of the main bar */}
                <path
                  d={innerBarPath}
                  fill="none"
                  stroke="#ffffff33"
                  strokeWidth={innerStrokeWidth}
                />

                {/* Overlay gradient */}
                <path
                  d={barPath}
                  fill={`url(#overlay-gradient${index})`}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>
      </svg>
      {/* Y Axis (Letters) */}
      <svg
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          translate-y-[var(--marginTop)]
          overflow-visible"
      >
        <g className="translate-x-[calc(var(--marginLeft)-8px)]">
          {data.map((entry, i) => (
            <text
              key={i}
              x="0"
              y={`${yScale(entry.key)! + yScale.bandwidth() / 2}%`}
              dy=".35em"
              textAnchor="end"
              fill="currentColor"
              className="text-xs text-zinc-400"
            >
              {entry.key.length > 16 ? entry.key.slice(0, 15) + "..." : entry.key}
            </text>
          ))}
        </g>
      </svg>

      {/* X Axis (Values) */}
      <svg
        className="absolute inset-0
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          h-[calc(100%-var(--marginBottom))]
          translate-y-4
          overflow-visible
        "
      >
        <g className="overflow-visible">
          {xScale.ticks(4).map((value, i) => (
            <text
              key={i}
              x={`${xScale(value)}%`}
              y="100%"
              textAnchor="middle"
              fill="currentColor"
              className="text-xs tabular-nums text-gray-400"
            >
              {value}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}

```

---

## 9. Autenticación y roles (RBAC)

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = loginSchema.parse(credentials)
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !await bcrypt.compare(password, user.password)) return null
        if (!user.isActive) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
  pages: { signIn: "/login" },
})

// Middleware de permisos
export const PERMISSIONS = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["members", "plans", "payments", "classes", "trainers", "reports", "inventory"],
  RECEPTIONIST: ["members", "attendance", "payments", "classes"],
  TRAINER: ["classes", "attendance"],
} as const
```

---

## 10. Fases de implementación

### Fase 1 — Fundación (Semana 1-2)

- Inicializar proyecto con Bun + Next.js 15
- Configurar Prisma + PostgreSQL + migraciones
- NextAuth v5 con roles (SUPER_ADMIN, ADMIN, RECEPTIONIST, TRAINER)
- Layout del dashboard con Sidebar (shadcn/ui)
- Módulo `SystemConfig` para API keys desde BD con AES-256
- Variables de entorno mínimas (`DATABASE_URL`, `NEXTAUTH_SECRET`, `CONFIG_SECRET`)

### Fase 2 — Núcleo (Semana 3-4)

- CRUD de Miembros con foto (uploadthing) y generación de QR
- CRUD de Planes de membresía
- Asignación y gestión de Membresías
- Pantalla pública de Check-in `/checkin` con escáner QR

### Fase 3 — Pagos (Semana 5)

- Registro de cobros con múltiples métodos
- Generación de facturas PDF con `pdfx`
- Historial y estados de pago
- Integración Culqi o Mercado Pago (según preferencia)

### Fase 4 — Clases y Entrenadores (Semana 6)

- CRUD de Entrenadores
- CRUD de Clases con calendario
- Sistema de reservas con control de cupos
- Asignación de clientes a entrenadores

### Fase 5 — Notificaciones (Semana 7)

- Plantillas React Email (bienvenida, vencimiento, recibo)
- Integración Twilio para SMS
- Integración Resend para email
- Cron jobs: vencimientos, mantenimiento, recordatorios

### Fase 6 — Reportes y Pulido (Semana 8)

- Dashboard con KPIs y gráficos Rosen Charts
- Exportación PDF y CSV
- Módulo de inventario
- Audit log
- Tests E2E básicos
- Deploy en Vercel + Neon (PostgreSQL)

---

## 11. Comandos iniciales con Bun

```bash
# Crear proyecto
bun create next-app gymos --typescript --tailwind --app --src-dir --import-alias "@/*"
cd gymos

# Dependencias de producción
bun add prisma @prisma/client
bun add next-auth@beta @auth/prisma-adapter
bun add @uploadthing/next uploadthing
bun add twilio resend @react-email/components
bun add Rosen Charts
bun add nuqs
bun add zustand
bun add zod
bun add date-fns
bun add qrcode
bun add html5-qrcode
bun add pdfx
bun add papaparse
bun add bcryptjs

# Tipos
bun add -d @types/qrcode @types/papaparse @types/bcryptjs prisma

# shadcn/ui
bunx --bun shadcn@latest init
bunx --bun shadcn@latest add button input label table card dialog sheet badge
bunx --bun shadcn@latest add select textarea form skeleton tabs separator
bunx --bun shadcn@latest add dropdown-menu avatar calendar popover

# Inicializar Prisma
bunx prisma init

# Después de configurar schema.prisma:
bunx prisma migrate dev --name init
bunx prisma generate

# Scripts en package.json
# "dev": "bun --bun next dev"
# "build": "bun --bun next build"
# "db:migrate": "bunx prisma migrate dev"
# "db:studio": "bunx prisma studio"
# "db:seed": "bun run prisma/seed.ts"
# "email:dev": "bunx email dev"
```

### Variables de entorno `.env.local`

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/gymos"

# Auth
NEXTAUTH_SECRET="tu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# Encriptación de API keys en BD
CONFIG_SECRET="clave-maestra-para-aes-256"

# Cron
CRON_SECRET="token-para-proteger-crons"

# Uploadthing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="tu-app-id"

# Las siguientes van en la BD (SystemConfig), no aquí:
# TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
# RESEND_API_KEY, RESEND_FROM_EMAIL
# CULQI_PUBLIC_KEY, CULQI_SECRET_KEY
```

---

## Notas de arquitectura

**Server Actions primero.** Toda mutación va como Server Action en `src/actions/`. Los Route Handlers se reservan para webhooks, cron jobs y endpoints públicos (check-in por QR de dispositivos externos).

**API keys en BD.** El modelo `SystemConfig` permite que el administrador cambie las credenciales desde la UI sin redeploy. Los valores sensibles se encriptan con AES-256 en reposo. Solo la `CONFIG_SECRET` vive en variables de entorno.

**Nuqs para estado de URL.** Todos los filtros de tablas (búsqueda, estado, fecha, página) se sincronizan con la URL usando `nuqs`. Permite compartir filtros y funciona con el botón atrás del navegador.

**Zustand para estado global.** Usado principalmente para el estado del escáner de QR, la sesión del usuario en cliente y preferencias de UI (sidebar colapsado, tema).

**pdfx en Server Action.** La generación de PDF corre en el servidor. El cliente recibe un `Blob` que se descarga o se guarda en `uploadthing` para envío por email.

**Pasarela de pago para Perú.** Se recomienda Culqi (nativa peruana, acepta tarjetas locales) o Mercado Pago (amplia cobertura). Ambas se configuran desde `SystemConfig`.
