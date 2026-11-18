"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MaintenanceAlertsCardProps {
  alerts: any[];
  selectedBranchName: string;
}

export function MaintenanceAlertsCard({
  alerts,
  selectedBranchName,
}: MaintenanceAlertsCardProps) {
  if (!alerts.length) return null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 backdrop-blur-md space-y-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="size-9 shrink-0 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 dark:text-rose-400">
          <AlertTriangle className="size-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            Alertas Urgentes de Mantenimiento ({selectedBranchName})
          </h2>
          <p className="text-xs text-rose-700 dark:text-rose-300/80">
            Equipos de gimnasio que requieren revisión técnica o reparación inmediata.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3">
        {alerts.map((item: any) => (
          <div
            key={item.id}
            className="flex flex-col justify-between p-3.5 rounded-2xl bg-card/90 dark:bg-zinc-950/80 border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer group shadow-md"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                {item.name}
              </p>
              <p className="text-[9px] uppercase font-mono text-muted-foreground">
                {item.category}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="text-[8px] border-rose-500/30 text-rose-600 dark:text-rose-400 uppercase font-bold px-2 py-0.5"
              >
                {item.status === "MAINTENANCE" ? "En Reparación" : "Vencido"}
              </Badge>
              <span className="text-[9px] text-muted-foreground font-mono truncate">
                {item.serialNumber || "S/N"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
