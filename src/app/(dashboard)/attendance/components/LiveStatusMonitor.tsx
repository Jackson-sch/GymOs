"use client";

import React from "react";
import { Users, Cake, Zap, ShieldCheck, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const getOccupancyLevel = (pct: number) => {
  if (pct >= 85) {
    return {
      label: "Aforo Concurrido",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      barColor: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]",
    };
  }
  if (pct >= 50) {
    return {
      label: "Aforo Moderado",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      barColor: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]",
    };
  }
  return {
    label: "Aforo Óptimo",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    barColor: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
  };
};

export function LiveStatusMonitor({
  occupancy,
  stats,
}: {
  occupancy: number;
  stats: any;
}) {
  const maxCapacity = 100;
  const occupancyPct = Math.min(100, Math.round((occupancy / maxCapacity) * 100));

  const level = getOccupancyLevel(occupancyPct);

  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Live Room Occupancy Meter Card */}
      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden backdrop-blur-md relative bg-zinc-950/85 shadow-2xl">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">Aforo en Vivo</span>
            </div>
            <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 border", level.color)}>
              {level.label}
            </Badge>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-serif font-bold text-foreground tracking-tight">{occupancy}</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                / {maxCapacity} Máx.
              </span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground mt-1">
              Socios activos entrenando en sala
            </p>
          </div>

          {/* Environmental Meter Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className={cn("h-full rounded-full transition-colors duration-1000 ease-out", level.barColor)}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono font-bold text-muted-foreground">
              <span>0%</span>
              <span>{occupancyPct}% Lleno</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card border-white/10 rounded-2xl p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Ingresos Hoy</p>
              <p className="text-2xl font-serif font-bold text-foreground">{stats.totalToday || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-white/10 rounded-2xl p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
              <Cake className="size-5" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Cumpleaños</p>
              <p className="text-2xl font-serif font-bold text-pink-400">{stats.birthdaysToday || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribution by Plan */}
      <Card className="glass-card border-white/15 rounded-3xl p-6 bg-zinc-950/85 backdrop-blur-md space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Distribución de Socios
            </h3>
          </div>
          <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] font-mono">
            Por Plan
          </Badge>
        </div>

        <div className="space-y-3">
          {stats.planDistribution && stats.planDistribution.length > 0 ? (
            stats.planDistribution.map((plan: any) => {
              const planPct = occupancy > 0 ? Math.min(100, Math.round((plan.value / occupancy) * 100)) : 0;
              return (
                <div key={plan.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">{plan.name}</span>
                    <span className="font-mono text-foreground">{plan.value} socios ({planPct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-primary rounded-full transition-colors duration-700"
                      style={{ width: `${planPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Esperando registros de socios en sala...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
