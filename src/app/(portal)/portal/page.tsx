import React from "react";
import { getPortalDashboardData } from "@/lib/actions/portal-actions";
import { PortalClient } from "./PortalClient";

export default async function PortalPage() {
  const res = await getPortalDashboardData();

  if (!res.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-serif text-muted-foreground">{res.error}</h2>
        <p className="max-w-md text-sm text-muted-foreground/60">
          Si eres socio nuevo, es posible que tu cuenta aún no esté vinculada a tu registro de socio. 
          Por favor, contacta a la administración.
        </p>
      </div>
    );
  }

  return <PortalClient data={res.data} />;
}
