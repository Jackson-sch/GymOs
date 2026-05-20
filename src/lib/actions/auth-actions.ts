"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function clearMustChangePasswordFlag() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mustChangePassword: false },
  });

  return { success: true };
}
