"use client";

import React from "react";
import { Activity, Clock, CreditCard, PieChart } from "lucide-react";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { RadialDonutChart } from "@/components/charts/RadialDonutChart";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RecentActivityCard } from "./RecentActivityCard";

interface DashboardAnalyticsProps {
  revenueData: any[];
  planData: any[];
  weeklyData: any[];
  activityData: any[];
  heatmapData: any;
  occupancy: { percentage: number; count: number };
  selectedBranchName: string;
}

export function DashboardAnalytics({
  revenueData,
  planData,
  weeklyData,
  activityData,
  heatmapData,
  occupancy,
  selectedBranchName,
}: DashboardAnalyticsProps) {
  return (
    <>
      {/* Row 1: Finance Chart & Membership Plan Composition */}
      <div className="grid grid-cols-1 gap-6 xl:gap-8 xl:grid-cols-12 items-stretch">
        <div className="xl:col-span-7 glass-card p-5 sm:p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <CreditCard className="size-4 shrink-0" />
                <span>Análisis Financiero</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
                Recaudación de Ingresos
              </h2>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 font-mono text-xs font-bold px-3 py-1 shrink-0"
            >
              Últimos 6 Meses
            </Badge>
          </div>
          <div className="w-full overflow-hidden">
            <StackedAreaChart
              data={revenueData.map((d: any) => ({ name: d.key, value: d.value }))}
              tooltipLabel="S/."
            />
          </div>
        </div>

        <div className="xl:col-span-5 glass-card p-5 sm:p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <PieChart className="size-4 shrink-0" />
                <span>Distribución Comerciales</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
                Planes Populares
              </h2>
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <RadialDonutChart data={planData} />
          </div>
        </div>
      </div>

      {/* Row 2: Attendance Trend & Live Activity Stream */}
      <div className="grid grid-cols-1 gap-6 xl:gap-8 xl:grid-cols-12 items-stretch">
        <div className="xl:col-span-7 glass-card p-5 sm:p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <Activity className="size-4 shrink-0" />
                <span>Tráfico de Asistencia</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
                Tendencia Semanal de Accesos
              </h2>
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <StackedAreaChart data={weeklyData} />
          </div>
        </div>

        <RecentActivityCard activityData={activityData} />
      </div>

      {/* Row 3: Peak Hours Heatmap */}
      <div className="glass-card p-5 sm:p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <Clock className="size-4 shrink-0" />
              <span>Monitoreo de Afluencia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              Mapa de Calor: Horas Pico de Concurrencia
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Capacidad Actual ({selectedBranchName})
            </p>
            <p
              className={cn(
                "text-xs font-mono font-bold",
                occupancy.percentage > 80
                  ? "text-rose-600 dark:text-rose-400"
                  : occupancy.percentage > 50
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {occupancy.percentage}% Ocupación ({occupancy.count} socios en sala)
            </p>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <ActivityHeatmap data={heatmapData} />
        </div>
      </div>
    </>
  );
}
