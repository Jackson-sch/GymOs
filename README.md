# 🏋️‍♂️ GymOS Platform - Sistema Integral de Gestión de Gimnasios y Centros Fitness

**GymOS** es una plataforma moderna, escalable y visualmente deslumbrante diseñada para la administración integral de gimnasios, clubes deportivos y centros de entrenamiento. Construida bajo los más altos estándares de desarrollo y arquitectura en el ecosistema **Next.js 16 (App Router)** y **Prisma**.

---

## ✨ Características Principales

### 1. 🌟 Diseño Visual Premium ("Liquid Glass")
Toda la interfaz ha sido construida con una estética de vanguardia combinando elementos de **Glassmorphism**, desenfoques translúcidos, fondos vibrantes y micro-animaciones fluidas que brindan una experiencia de usuario altamente inmersiva y profesional tanto en escritorio como en dispositivos móviles.

### 2. 🔐 Seguridad y Control de Acceso (RBAC)
Sistema de autenticación robusto potenciado por **Better Auth**, con soporte completo para control de acceso basado en roles (Super Admin, Admin, Entrenador y Socio) y protección estricta de Server Actions mediante esquemas de validación **Zod**.

### 3. 💳 Pasarelas de Pago Online y Kiosko Físico
- **Pagos Online**: Integración nativa con **Mercado Pago** y **Culqi** para compra y renovación de membresías en tiempo real con webhooks seguros bidireccionales y envío automático de recibos PDF por correo.
- **Kiosko de Auto-Checkin**: Terminal táctil para control de asistencia presencial mediante escaneo de código QR o autenticación por PIN numérico.

### 4. 📊 Gestión Deportiva y Antropométrica
- Control de asistencia en tiempo real con cálculo de aforo y ocupación.
- Fichas antropométricas completas con historial de medidas corporales y galería visual con fotografías frontales, laterales y traseras alojadas en **Cloudinary**.
- Gestión de rutinas de entrenamiento y asignación de entrenadores personalizados.

### 5. 📬 Centro de Control de Comunicaciones
Módulo de auditoría integral que monitorea en vivo el envío de notificaciones, correos electrónicos (vía **Resend**) y recordatorios de vencimiento de membresías.

---

## 🛠️ Tecnologías Utilizadas

- **Core**: Next.js 16 (App Router), React 19, TypeScript.
- **Base de Datos y ORM**: Prisma ORM, PostgreSQL.
- **Estilos y Componentes**: Tailwind CSS v4, Shadcn/ui, Lucide Icons.
- **Servicios Externos**: Resend (Emails), Cloudinary (Media), Mercado Pago & Culqi (Pagos en vivo).

---

## 🚀 Guías de Configuración y Despliegue

Para conocer todos los detalles arquitectónicos, planes de auditoría o llevar este proyecto a un entorno de producción en vivo, consulta las siguientes guías oficiales:

- 📖 **[Guía de Despliegue en Producción (Checklist de Lanzamiento)](./PRODUCTION_DEPLOYMENT.md)**
- 🗺️ **[Plan Arquitectónico y Roadmap del Proyecto](./GymOS-Plan.md)**

---

## 💻 Desarrollo Local

Para ejecutar el proyecto en tu entorno local:

```bash
# 1. Instalar dependencias
bun install

# 2. Generar cliente de base de datos
bunx prisma generate

# 3. Ejecutar migraciones y poblar base de datos de prueba
bunx prisma migrate dev
bun prisma/seed.ts

# 4. Iniciar servidor de desarrollo
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para comenzar a explorar GymOS.
