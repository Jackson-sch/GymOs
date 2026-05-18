# 🔐 Roles de Usuario y Control de Acceso (RBAC)

**GymOS Platform** implementa un modelo estricto de Control de Acceso Basado en Roles (RBAC) gestionado por **Better Auth** e integrado en todas las capas del sistema (Frontend, Middleware y Server Actions).

---

## 👥 1. Jerarquía de Roles y Permisos

```text
┌────────────────────────────────────────────────────────┐
│                      SUPER ADMIN                       │
│  Acceso irrestricto, configuración global, borrado SQL │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                         ADMIN                          │
│     Gestión de socios, pagos, inventario, reportes     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                        TRAINER                         │
│   Portal de entrenadores, rutinas, asistencia clases   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                         MEMBER                         │
│     Portal de socios, pagos online, reservas, QR       │
└────────────────────────────────────────────────────────┘
```

### 👑 Super Admin
- El rol de más alto nivel en el sistema.
- **Permisos Exclusivos**:
  - Modificación de variables y secretos en `SystemConfig` y Canales API.
  - Gestión de roles de otros administradores.
  - Acceso a registros de auditoría completos (`AuditLog`).
  - Eliminación permanente de registros financieros o históricos.

### 🛡️ Admin
- Diseñado para el personal administrativo y recepcionistas del gimnasio.
- **Permisos**:
  - Creación, modificación y renovación de membresías de socios.
  - Registro de pagos en efectivo o tarjeta desde caja.
  - Venta de productos de inventario (Bebidas, suplementos, ropa).
  - Visualización de reportes financieros, de asistencia y registros de auditoría del sistema (`AuditLog`).
- **Restricciones**: No puede cambiar la configuración global del sistema ni eliminar administradores.

### 🏋️‍♂️ Trainer (Entrenador)
- Diseñado para el equipo de instructores y entrenadores personales.
- **Permisos**:
  - Acceso exclusivo al portal de entrenadores (`/portal/trainer`).
  - Creación y edición de rutinas de entrenamiento (`WorkoutRoutine`, `Exercise`).
  - Registro de asistencia y evaluación antropométrica de los socios en sus clases.
  - Monitoreo del progreso de los socios asignados.
- **Restricciones**: No tiene acceso a módulos financieros, nómina ni configuración.

### 🏃‍♂️ Member (Socio)
- Diseñado para los clientes del gimnasio.
- **Permisos**:
  - Acceso al portal personal web y móvil (`/portal`).
  - Compra y renovación de planes con tarjeta mediante pasarela online.
  - Reserva de plazas en clases grupales.
  - Visualización de su carnet digital y código QR para ingreso en torniquete/kiosko.
  - Registro y seguimiento de su peso y medidas corporales.

---

## 🛡️ 2. Verificación de Permisos en el Código

### Helper de Resolución Isomorfa (`getUserRole`)
Para mantener la consistencia entre componentes de Servidor y Cliente, se dispone del helper seguro en `src/lib/utils.ts` y re-exportado en `src/lib/security.ts`:

```typescript
import { getUserRole } from "@/lib/utils";

// Determina el rol de forma robusta con fallback a MEMBER
const role = getUserRole(session);
```

### En Server Actions (Lógica de Negocio)
Cada Server Action verifica la sesión y el rol antes de realizar cualquier operación con Prisma utilizando el helper centralizado `verifySession`:

```typescript
import { verifySession } from "@/lib/security";

export async function createPlanAction(data: any) {
  // Verifica la sesión y requiere roles específicos
  const session = await verifySession(["SUPER_ADMIN", "ADMIN"]);

  // Ejecución segura de lógica
}
```

### En Middleware (Protección de Rutas)
El archivo `middleware.ts` en la raíz intercepta todas las peticiones a rutas protegidas (`/settings`, `/members`, `/reports`, `/portal/trainer`) y verifica las cookies de sesión para impedir el acceso no autorizado antes de renderizar la página.
