import React from "react";
import { getTrainerPortalDataAction } from "@/lib/actions/routine-actions";
import { TrainerPortalClient } from "./TrainerPortalClient";
import { verifySession } from "@/lib/security";

export default async function TrainerPortalPage() {
  // Solo permitimos a entrenadores (y admins para supervisar)
  await verifySession(["TRAINER", "ADMIN", "SUPER_ADMIN"]);
  
  const res = await getTrainerPortalDataAction();

  if (!res.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-serif text-muted-foreground">{res.error}</h2>
        <p className="max-w-md text-sm text-muted-foreground/60">
          Hubo un problema al cargar tu portal de entrenador.
        </p>
      </div>
    );
  }

  return <TrainerPortalClient data={res.data} />;
}
