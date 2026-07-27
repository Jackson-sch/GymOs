"use client";

import React, { useState } from "react";
import {
  Bell,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  AlertTriangle,
  Play,
  Mail,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  processExpiringMembershipsAction,
  processExpiredMembershipsAction,
  processInactivityReengagementAction
} from "@/lib/actions/cron-actions";

export function AutomationsTab() {
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const automations = [
    {
      id: "expiring",
      name: "Alertas Preventivas de Vencimiento",
      description: "Envía un recordatorio por Email/WhatsApp a los socios a 7, 3 y 1 días de vencer su membresía con su botón de pago online.",
      status: "ACTIVADO",
      icon: Clock,
      action: processExpiringMembershipsAction,
    },
    {
      id: "expired",
      name: "Notificación de Membresía Expirada",
      description: "Detecta membresías vencidas en el día 0, suspende el código QR de acceso y envía una alerta amigable de renovación.",
      status: "ACTIVADO",
      icon: AlertTriangle,
      action: processExpiredMembershipsAction,
    },
    {
      id: "inactivity",
      name: "Re-engagement por Inactividad (14 Días)",
      description: "Detecta deportistas activos que no registran asistencias en 14+ días y les envía un mensaje motivacional de retorno.",
      status: "ACTIVADO",
      icon: Zap,
      action: processInactivityReengagementAction,
    },
  ];

  const handleRunManualCron = async (id: string, actionFn: () => Promise<any>) => {
    setRunningAction(id);
    toast.info("Ejecutando motor de automatización...");
    const res = await actionFn();
    setRunningAction(null);

    if (res.success) {
      toast.success(`Ejecutado con éxito. ${res.processed} registros procesados.`);
    } else {
      toast.error(res.error || "Error al ejecutar automatización");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="size-3.5" />
            Motor de Retención Automatizado
          </div>
          <h2 className="text-2xl font-serif">Reglas & Automatizaciones de Marketing</h2>
          <p className="text-xs text-muted-foreground">
            Configura y prueba en vivo los disparadores automáticos de retención y alertas a deportistas.
          </p>
        </div>

        <Button
          onClick={() => handleRunManualCron("all", async () => {
            await processExpiringMembershipsAction();
            await processExpiredMembershipsAction();
            await processInactivityReengagementAction();
            return { success: true, processed: "Todas las reglas" };
          })}
          disabled={!!runningAction}
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-2 shadow-lg shadow-primary/20"
        >
          {runningAction === "all" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Ejecutar Todas las Automatizaciones
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {automations.map((item) => {
          const Icon = item.icon;
          const isRunning = runningAction === item.id;
          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary/30 transition-all shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Icon className="size-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-serif font-bold text-foreground">
                      {item.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans max-w-xl">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  onClick={() => handleRunManualCron(item.id, item.action)}
                  disabled={!!runningAction}
                  variant="outline"
                  className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border-white/10 text-xs font-bold gap-2"
                >
                  {isRunning ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5 text-primary" />
                  )}
                  Probar Disparador
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
