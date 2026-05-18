"use client";

import React from "react";
import { History, Cpu, Loader2, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemTabProps {
  loading: boolean;
  onTriggerCron: () => Promise<void>;
}

export function SystemTab({ loading, onTriggerCron }: SystemTabProps) {
  return (
    <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-serif mb-1">Sistema & Mantenimiento</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Gestión de procesos automáticos y salud del servidor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <History className="size-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-serif text-lg">Mantenimiento de Membresías</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                Procesar vencimientos y alertas diarias
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Este proceso normalmente se ejecuta de forma automática cada
            medianoche. Verifica membresías por vencer (3 días) y marca como
            'Expiradas' las que ya pasaron su fecha fin.
          </p>

          <Button
            onClick={onTriggerCron}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 text-foreground border-white/10 rounded-xl h-11 text-[10px] uppercase tracking-widest font-semibold"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Cpu className="size-4 mr-2" />
            )}
            Ejecutar Mantenimiento Manual
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Smartphone className="size-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-serif text-lg">App Móvil (PWA)</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                Estado de instalación para socios
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            El portal de socios está configurado como una PWA. Los socios pueden
            instalarla desde sus navegadores para acceder instantáneamente a su
            tarjeta virtual.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-semibold">
              <span className="text-muted-foreground">Manifest</span>
              <span className="text-emerald-500">Configurado</span>
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-semibold">
              <span className="text-muted-foreground">Service Worker</span>
              <span className="text-emerald-500">Activo (Nativo)</span>
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-semibold">
              <span className="text-muted-foreground">Iconos Premium</span>
              <span className="text-emerald-500">512x512 / 192x192</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Monitor className="size-4" />
          <p className="text-[9px] uppercase tracking-[0.3em] font-semibold">
            GymOS v1.2.0 — Núcleo de Estabilidad
          </p>
        </div>
      </div>
    </section>
  );
}
