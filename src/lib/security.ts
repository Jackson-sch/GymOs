import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";

export type SessionUser = typeof auth.$Infer.Session["user"];

import { getUserRole } from "./utils";

export { getUserRole };

/**
 * Checks whether the authenticated user and their organization are active.
 * SUPER_ADMIN accounts bypass organization suspension checks.
 */
export async function checkActiveAccess(session: { user?: any } | null) {
  if (!session?.user?.id) {
    return { ok: false as const, reason: "UNAUTHENTICATED" as const };
  }

  const role = getUserRole(session);
  if (role === "SUPER_ADMIN") {
    return { ok: true as const };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isActive: true,
      organizationId: true,
      organization: {
        select: {
          isActive: true,
          name: true,
        },
      },
    },
  });

  if (!dbUser || !dbUser.isActive) {
    return { ok: false as const, reason: "USER_SUSPENDED" as const };
  }

  if (dbUser.organizationId && dbUser.organization && !dbUser.organization.isActive) {
    return {
      ok: false as const,
      reason: "ORG_SUSPENDED" as const,
      orgName: dbUser.organization.name,
    };
  }

  return { ok: true as const };
}

/**
 * Verifies if there is an active session and optionally checks for specific roles.
 * Returns the session if successful, or throws an error if unauthorized.
 * 
 * @param roles Optional array of roles allowed to perform the action.
 * @returns The session object.
 */
export async function verifySession(roles?: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("UNAUTHORIZED: Debes iniciar sesión para realizar esta acción");
  }

  const userRole = getUserRole(session);

  if (roles && !roles.includes(userRole)) {
    throw new Error(`FORBIDDEN: No tienes permisos suficientes (${roles.join(", ")} requeridos)`);
  }

  const access = await checkActiveAccess(session);
  if (!access.ok) {
    if (access.reason === "ORG_SUSPENDED") {
      throw new Error("SUSPENDED: La cuenta de tu gimnasio se encuentra suspendida.");
    }
    throw new Error("SUSPENDED: Tu cuenta de usuario se encuentra suspendida.");
  }

  return session;
}

export function isExpectedAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.startsWith("UNAUTHORIZED:") ||
    error.message.startsWith("FORBIDDEN:") ||
    error.message.startsWith("SUSPENDED:")
  );
}

/**
 * Convenience helper to check for ADMIN or SUPER_ADMIN roles.
 */
export async function isAdmin() {
  const session = await verifySession(["ADMIN", "SUPER_ADMIN"]);
  return session;
}

/**
 * Convenience helper to check for TRAINER role.
 */
export async function isTrainer() {
  const session = await verifySession(["TRAINER"]);
  return session;
}

/**
 * Throws an error if the user is not an admin.
 */
export async function requireAdmin() {
  return await verifySession(["ADMIN", "SUPER_ADMIN"]);
}

/**
 * Standard security response for unauthorized access in Server Actions.
 */
export const UNAUTHORIZED_RESPONSE = {
  success: false,
  error: "No autorizado: Inicie sesión o verifique sus permisos"
};

/**
 * Obtiene la información del usuario en sesión y su organización activa (tenant).
 */
export async function getCurrentTenant() {
  const session = await verifySession();
  const user = session.user as any;
  return {
    user,
    organizationId: user.organizationId as string | null | undefined,
    role: getUserRole(session),
  };
}
