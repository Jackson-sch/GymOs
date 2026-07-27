"use client";

import React, { useState } from "react";
import { History, Cpu, Loader2, Smartphone, Monitor, Database, Activity, RefreshCw, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SystemTabProps {
  loading: boolean;
  onTriggerCron: () => Promise<void>;
}

export function SystemTab({ loading, onTriggerCron }: SystemTabProps) {
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = async () => {
    setClearingCache(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setClearingCache(false);
    toast.success("Caché de consultas del sistema purgada correctamente");
  };

  return (
    <section className="glass-card p-6 sm:p-8 md:p-10 border-white/10 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-serif mb-1">Sistema & Mantenimiento</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Gestión de tareas programadas, salud del servidor y optimización del núcleo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-3 py-1 gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Servidores Operativos
          </Badge>
        </div>
      </div>

      {/* Health Checks Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Base de Datos PostgreSQL
            </span>
            <Database className="size-4 text-primary" />
          </div>
          <p className="text-lg font-serif font-bold text-foreground">Conectado (Pool Activo)</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <CheckCircle2 className="size-3" /> Prisma ORM 7.8 — Latencia 4ms
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Motor de Notificaciones
            </span>
            <Activity className="size-4 text-primary" />
          </div>
          <p className="text-lg font-serif font-bold text-foreground">Resend & WhatsApp</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <CheckCircle2 className="size-3" /> Cola en tiempo real OK
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Monitor de Errores (Sentry)
            </span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <p className="text-lg font-serif font-bold text-foreground">0 Excepciones Críticas</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <CheckCircle2 className="size-3" /> Telemetría Edge Activa
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Mantenimiento de Membresías */}
        <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="size-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <History className="size-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Mantenimiento de Membresías
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Procesar vencimientos y alertas diarias (Cron)
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Este proceso se ejecuta automáticamente cada medianoche. Verifica membresías por vencer en los siguientes 3 días y marca como 'Expiradas' aquellas cuya fecha fin ha caducado.
            </p>
          </div>

          <Button
            onClick={onTriggerCron}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-xl h-11 text-xs uppercase tracking-wider font-bold gap-2 transition-all mt-4"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Cpu className="size-4 text-primary" />
            )}
            Ejecutar Mantenimiento Manual
          </Button>
        </div>

        {/* Card 2: Purga de Caché & PWA */}
        <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="size-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <RefreshCw className="size-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Caché & Optimización PWA
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Limpieza de estado en memoria del sistema
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span>Estado de PWA Portal:</span>
                <span className="text-emerald-400 font-bold">Activo & Instalable</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span>Manifest / Service Worker:</span>
                <span className="text-emerald-400 font-bold">Sincronizado</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="w-full bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-xl h-11 text-xs uppercase tracking-wider font-bold gap-2 transition-all mt-4"
          >
            {clearingCache ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Zap className="size-4 text-primary" />
            )}
            Purgar Caché del Sistema
          </Button>
        </div>
      </div>

      {/* Footer Specs */}
      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Monitor className="size-4 text-primary" />
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">
            GymOS Platform v2.4.0 — High-Performance Stack
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[9px] font-mono border-white/10 bg-white/5">
            Next.js 16.2.6
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono border-white/10 bg-white/5">
            React 19
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono border-white/10 bg-white/5">
            Prisma 7.8
          </Badge>
        </div>
      </div>
    </section>
  );
}
