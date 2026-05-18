---
name: documentation-maintenance
description: Habilidad autónoma para asegurar la sincronización y actualización continua de toda la documentación técnica, arquitectónica y guías de despliegue de GymOS tras cualquier cambio en el código.
---

# 📚 Habilidad de Mantenimiento de Documentación (Documentation Maintenance)

Esta habilidad define los protocolos obligatorios para los agentes de Inteligencia Artificial que trabajan en el repositorio **GymOS Platform**. Su propósito es garantizar que la documentación técnica del proyecto refleje siempre el estado exacto y actual de la base de código, la base de datos y la configuración.

## 🎯 Objetivo de la Habilidad
Evitar la obsolescencia ("drift") de la documentación técnica. Cada vez que se implementa una nueva funcionalidad, se altera el esquema de Prisma o se modifican variables de entorno, esta habilidad obliga al agente a auditar y actualizar los documentos correspondientes antes de finalizar su turno.

---

## 📋 Normativas de Ejecución Obligatoria

### 1. Cuándo activar esta habilidad (Triggers)
El agente **DEBE** revisar y actualizar la documentación en los siguientes escenarios:
- **Modificación de Variables de Entorno (`.env` / `APITab.tsx`)**: Al añadir o cambiar claves de API, secretos o URLs.
- **Cambios en Modelos de Base de Datos (`schema.prisma`)**: Al crear nuevas tablas, relaciones o campos relevantes.
- **Nuevas Integraciones Externa (APIs / Webhooks)**: Al conectar nuevos servicios de mensajería, pago, almacenamiento o analítica.
- **Nuevos Roles o Permisos (RBAC)**: Al modificar la jerarquía de roles o reglas de acceso en el `middleware.ts`.

### 2. Directorio Oficial de Documentación (`docs/`)
Todos los cambios deben plasmarse en el documento correspondiente dentro de la carpeta `docs/` o en la raíz:
1. `README.md`: Resumen general, características principales y comandos de arranque local.
2. `PRODUCTION_DEPLOYMENT.md`: Guía de despliegue en producción, checklist de lanzamiento, variables de entorno y webhooks en vivo.
3. `docs/ARCHITECTURE.md`: Topología del proyecto, patrones Next.js 16 (App Router), Server Actions y diseño *Liquid Glass*.
4. `docs/API_AND_WEBHOOKS.md`: Pasarelas de pago (Mercado Pago, Culqi), Resend, Cloudinary y tareas programadas (Cron jobs).
5. `docs/USER_ROLES_AND_PERMISSIONS.md`: Jerarquía de roles (SuperAdmin, Admin, Trainer, Member) y verificación de sesiones.

---

## 🔄 Flujo de Trabajo para el Agente AI

```text
┌────────────────────────────────────────────────────────┐
│            1. DETECCIÓN DE CAMBIO EN CÓDIGO            │
│  (Ej. Nuevo campo en DB o nueva API Key en Ajustes)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              2. IDENTIFICACIÓN DE DOCUMENTO            │
│  (Seleccionar el archivo de docs/ afectado)            │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│            3. ACTUALIZACIÓN E INSERCIÓN DIFF           │
│  (Añadir la explicación técnica y ejemplo de uso)      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│           4. VERIFICACIÓN Y REPORTE AL USUARIO         │
│  (Confirmar que los enlaces y formato sean correctos)  │
└────────────────────────────────────────────────────────┘
```

## 📝 Lista de Verificación de Calidad de Documentación
- [ ] ¿La sintaxis de Markdown es completamente válida (bloques de código tipados, tablas bien formadas)?
- [ ] ¿Los nombres de variables de entorno coinciden exactamente con los esperados por el código?
- [ ] ¿Se han mantenido actualizados los diagramas de flujo ASCII si cambió la arquitectura de un servicio?
- [ ] ¿Se ha informado al usuario de forma proactiva qué archivos de documentación se han actualizado?
