# 🏛️ Arquitectura de GymOS Platform

Este documento describe a fondo la arquitectura de software, los patrones de diseño y la topología de datos de **GymOS Platform**, un sistema integral para la administración de gimnasios y centros de entrenamiento deportivo.

---

## 🏗️ 1. Topología del Proyecto y Patrones Clave

GymOS está construido sobre **Next.js 16 (App Router)** utilizando una arquitectura fuertemente desacoplada:

```text
┌────────────────────────────────────────────────────────┐
│                   FRONTEND / UI LAYER                  │
│       React 19 / Tailwind CSS v4 / Shadcn / Lucide     │
└───────────────────────────┬────────────────────────────┘
                            │ (Server Actions / RSC)
┌───────────────────────────▼────────────────────────────┐
│                  BUSINESS LOGIC LAYER                  │
│   Server Actions / Route Handlers / Better Auth RBAC   │
└───────────────────────────┬────────────────────────────┘
                            │ (Prisma Client)
┌───────────────────────────▼────────────────────────────┐
│                    DATA STORAGE LAYER                  │
│         PostgreSQL Database / Prisma ORM / Cloudinary  │
└────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos
1. **Server Components (RSC) por defecto**: Toda la obtención de datos y renderizado inicial se realiza en el servidor para máxima velocidad y seguridad. Los componentes de cliente (`"use client"`) se utilizan únicamente cuando se requiere interactividad o manejo de estado local.
2. **Desacoplamiento de Prisma**: Ningún componente de cliente interactúa directamente con la base de datos. Todas las operaciones CRUD y transacciones financieras se canalizan a través de Server Actions tipadas y protegidas en el directorio `src/lib/actions/`.
3. **Idempotencia y Atomicidad**: Los webhooks de pago y procesos de renovación utilizan transacciones de base de datos (`prisma.$transaction`) para asegurar que no se produzcan inconsistencias ni duplicaciones ante fallos de red.

---

## 🗂️ 2. Estructura de Directorios

```text
GymOS/
├── .agents/
│   └── skills/              # Habilidades y normativas autónomas para agentes AI
├── docs/                    # Documentación técnica, arquitectónica y guías de uso
├── prisma/
│   ├── schema.prisma        # Modelos de datos y relaciones ORM
│   ├── migrations/          # Historial de migraciones SQL
│   └── seed.ts              # Script de inicialización y datos de prueba
├── public/                  # Recursos estáticos (Logos, fuentes, íconos)
└── src/
    ├── app/                 # Rutas de la aplicación (Next.js App Router)
    │   ├── (dashboard)/     # Vistas administrativas (SuperAdmin, Admin)
    │   ├── api/             # Endpoints REST y Webhooks (Culqi, MP, Cron)
    │   ├── checkin/         # Kiosko de auto-checkin físico
    │   ├── portal/          # Portales específicos para Socios y Entrenadores
    │   └── ...
    ├── components/          # Componentes modulares reutilizables
    │   ├── emails/          # Plantillas de correo HTML con @react-email
    │   ├── shared/          # Formularios, modales y tablas genéricas
    │   └── ui/              # Componentes base de diseño (Shadcn)
    └── lib/                 # Utilidades, configuración y Server Actions
        └── actions/         # Lógica de negocio atómica y tipada
```

---

## 🎨 3. Sistema de Diseño "Liquid Glass"

Toda la interfaz visual de GymOS se adhiere al sistema de diseño **Liquid Glass**, enfocado en ofrecer un aspecto sumamente premium, dinámico y moderno.

### Tokens y Utilidades Visuales
- **Glassmorphism**: Uso de fondos oscuros o claros con desenfoque (`backdrop-blur-md`, `backdrop-blur-xl`), bordes finos translúcidos (`border-white/10`) y sombras de acento (`shadow-xl shadow-primary/10`).
- **Gradients**: Degradados suaves y dinámicos para encabezados, tarjetas de estadísticas y botones de acción principal.
- **Tipografía**: Combinación de tipografías sans-serif modernas para legibilidad de datos y fuentes serif para títulos elegantes.
- **Micro-animaciones**: Transiciones fluidas al pasar el cursor (`transition-all duration-300 hover:scale-[1.02]`) y animaciones de entrada (`animate-in fade-in slide-in-from-bottom-4`).

---

## 🛡️ 4. Capa de Seguridad y Middleware (RBAC)

El acceso a las rutas y acciones se rige estrictamente por la jerarquía de roles de **Better Auth**:
- **SuperAdmin / Admin**: Acceso total a finanzas, configuración del sistema, nómina de personal y eliminación de registros.
- **Trainer (Entrenador)**: Acceso restringido al portal de entrenadores (`/portal/trainer`), visualización de clases asignadas, registro de asistencia y seguimiento de rutinas de sus socios.
- **Member (Socio)**: Acceso a su portal personal (`/portal`), perfil, historial de pagos, reservas de clases y código QR de acceso.

Cualquier intento de acceso a una ruta no autorizada es interceptado por el proxy de seguridad en `src/proxy.ts`, el cual valida de forma isomorfa los roles y redirige automáticamente a la pantalla de inicio de sesión o al portal correspondiente.

### Políticas de Seguridad Avanzadas
- **Rate Limiting en Memoria**: Protección integrada contra ataques de fuerza bruta en autenticación (máximo 15 peticiones por minuto por IP en memoria).
- **Verificación Estricta de Identidad**: Registro de cuentas protegido mediante confirmación obligatoria de correo electrónico (`requireEmailVerification: true`).
- **Encabezados HTTP de Seguridad**: Implementación de HSTS (`Strict-Transport-Security`), `X-Frame-Options` en SAMEORIGIN, `X-Content-Type-Options: nosniff` y políticas estrictas de referencia en la configuración global de Next.js.
- **Contraseñas Robustas de Incorporación**: Eliminación de contraseñas por defecto basadas en DNI; el sistema genera claves criptográficamente aleatorias de 20 caracteres e inicia inmediatamente flujos automáticos de restablecimiento de contraseña para el usuario.
- **Retroalimentación de Errores Segura**: Interceptación de excepciones de validación en Server Actions mediante `ZodError` para devolver al cliente mensajes precisos y amigables sin exponer trazas internas de ejecución.

---

## 📐 5. Normativas de Calidad y Formato de Código

Para garantizar la mantenibilidad, legibilidad y solidez de GymOS Platform, el repositorio impone estrictos estándares de calidad de software:

1. **Tipado Estricto de Extremo a Extremo**: Se prohíbe explícitamente el uso de `any` en los parámetros de entrada y retorno de las Server Actions. Todas las entidades utilizan inferencia de Zod (`z.input` / `z.infer`) y enums nativos de Prisma Client (como `MemberStatus`).
2. **Estandarización de Formato con Prettier**: El código se formatea unificadamente según `.prettierrc` (100 caracteres de ancho de línea, tabulación de 2 espacios, sin comillas simples y ordenamiento de clases Tailwind).
3. **Análisis Estático Riguroso (ESLint)**: Configuración extendida en `eslint.config.mjs` que previene el uso de variables inseguras (`var`), impone comparaciones estrictas (`eqeqeq`) y advierte sobre mutabilidad innecesaria (`prefer-const`).
4. **Resiliencia de Interfaz (Error & Suspense Boundaries)**: Implementación de límites de error globales isomorfos (`error.tsx`) y estados de carga esmerados (`loading.tsx`) que garantizan que las transiciones de rutas y fallos en componentes asíncronos ofrezcan una experiencia ininterrumpida y visualmente premium bajo la estética *Liquid Glass*.
