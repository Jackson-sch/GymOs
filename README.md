# 🏋️‍♂️ GymOS Platform - Sistema Integral de Gestión de Gimnasios, Franquicias y Centros Fitness (Multi-Tenant SaaS)

**GymOS** es una plataforma moderna, escalable y visualmente deslumbrante diseñada para la administración integral de gimnasios, cadenas deportivas, clubes de entrenamiento y sistemas de franquicias. Construida bajo los más altos estándares del ecosistema **Next.js 16 (App Router)**, **TypeScript** y **Prisma ORM**.

---

## ✨ Características Principales

### 1. 🏢 SaaS Multi-Tenant & Torre de Control Super Admin (`/super-admin`)
- **Gestión Ejecutiva de Gimnasios**: Registro, edición de slug/subdominio, cambio de planes SaaS y suspensión/activación de clientes.
- **Tiers & Escalabilidad SaaS**: Planes `STARTER` ($49/mes), `PRO` ($99/mes) y `ENTERPRISE` ($199/mes) con cálculo automático de MRR (Ingreso Mensual Recurrente).

### 2. 🌐 Franquicias & Gestión Multisede Físicas (`/branches`)
- **Control por Sucursal**: Alta y administración de sedes físicas (*Miraflores*, *San Isidro*, *Surco*, etc.).
- **Selector de Sede Global (`BranchSwitcher`)**: Desplegable en la barra superior para alternar entre el consolidado global (`Todas las Sedes`) o una sede física individual.
- **Scoping & RBAC por Sede**: Filtrado dinámico de socios, ingresos y asistencias según la ubicación asignada.

### 3. 💳 Checkout de Auto-Inscripción Pública (`/join/[slug]`)
- **Landing de Registro Online**: Cada gimnasio cuenta con su portal público en `/join/nombre-gimnasio`.
- **Inscripción y Pago en 1-Click**: Los atletas eligen su plan, ingresan sus datos y pagan con **Tarjeta**, **Culqi**, **Mercado Pago**, **Yape** o **Plin**.
- **Activación Instantánea**: Creación de usuario PWA y generación inmediata de credencial QR.

### 4. ⚡ Motor de Automatizaciones & Alertas de Retención (`cron-actions.ts`)
- **Recordatorios Preventivos de Vencimiento**: Alertas automáticas a 7, 3 y 1 días de vencer con botón de pago.
- **Re-engagement por Inactividad**: Identificación automática de socios activos sin check-in en 14+ días con envío de mensajes de motivación.
- **Centro de Pruebas de Automatizaciones**: Tab en `/settings` para probar los disparadores en tiempo real.

### 5. 📱 Portal PWA para Deportistas & Credencial QR Dinámica (`/portal`)
- **Credencial QR Anti-Pantallazos (`/portal/qr`)**: Código QR que regenera su token de acceso cada 30 segundos de forma 100% offline.
- **Ejecutor de Rutinas & Temporizador de Descanso (`/portal/routines`)**: Marcado de series en vivo con cronómetro de descanso inter-series (30s, 60s, 90s).
- **Reserva de Clases Grupales (`/portal/classes`)**: Agendamiento en vivo con aforo disponible y cancelación en 1-tap.

### 6. 🎨 Diseño Visual Premium ("Liquid Glass")
- Estética **Glassmorphism** de vanguardia con desenfoques translúcidos, fondos oscuros vibrantes y micro-animaciones fluidas.

---

## 🛠️ Tecnologías Utilizadas

- **Core**: Next.js 16 (App Router / Turbopack), React 19, TypeScript, Zustand.
- **Base de Datos y ORM**: Prisma ORM v7.8, PostgreSQL.
- **Autenticación & Seguridad**: Better Auth (Email/Password, RBAC).
- **Estilos y UI**: Tailwind CSS v4, Shadcn/ui, Lucide Icons.
- **Pagos & Servicios**: Culqi, Mercado Pago, Resend (Emails), QRCode.

---

## 🚀 Desarrollo Local

Para ejecutar el proyecto en tu entorno local:

```bash
# 1. Instalar dependencias con Bun o PNPM
bun install

# 2. Generar cliente de base de datos Prisma
bunx prisma generate

# 3. Aplicar cambios a la base de datos PostgreSQL
bunx prisma db push

# 4. Poblar datos iniciales de prueba (Super Admin & Demo Gym)
bun prisma/seed.ts

# 5. Iniciar el servidor de desarrollo
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para comenzar a explorar GymOS.

---

## 🧪 Pruebas y Compilación de Producción

```bash
# Ejecutar suite de pruebas Vitest (14 tests)
bunx vitest run

# Compilación optimizada de producción (49 rutas)
bun run build
```

---

Powered by **GymOS Platform** &copy; 2026
