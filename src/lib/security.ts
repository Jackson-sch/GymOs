import { headers } from "next/headers";
import { auth } from "./auth";

export type SessionUser = typeof auth.$Infer.Session["user"];

import { getUserRole } from "./utils";

export { getUserRole };

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

  return session;
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
