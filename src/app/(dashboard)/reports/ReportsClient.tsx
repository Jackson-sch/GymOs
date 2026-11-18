"use client";

import React, { useState, useReducer, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { RadialDonutChart } from "@/components/charts/RadialDonutChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { useQueryState, parseAsString } from "nuqs";
import { KpiCards } from "./KpiCards";
import { TopMembersRanking } from "./TopMembersRanking";

const ReportExport = dynamic(() => import("./ReportExport"), {
  ssr: false,
  loading: () => (
    <Button
      variant="outline"
      disabled
      className="glass-card bg-primary/10 border-primary/20 text-primary rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest opacity-50"
    >
      Cargando PDF…
    </Button>
  ),
});
import { format } from "date-fns";
import {
  Sparkles,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  BarChart3,
  CreditCard,
  Users,
  Lightbulb,
  Activity,
  RotateCcw,
} from "lucide-react";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { RosenChart } from "@/components/shared/RosenChart";

export function ReportsClient({
  kpis,
  revenueByMonth,
  attendanceByDay,
  membershipsByPlan,
  membersByStatus,
  topMembers,
}: {
  kpis: any;
  revenueByMonth: any[];
  attendanceByDay: any[];
  membershipsByPlan: any[];
  membersByStatus: any[];
  topMembers: any[];
}) {
  const [from, setFrom] = useQueryState("from", parseAsString);
  const [to, setTo] = useQueryState("to", parseAsString);
  const [activeTab, setActiveTab] = useState("overview");

  const [reportState, setReportState] = useReducer(
    (s: any, a: any) => ({ ...s, ...a }),
    {
      mounted: false,
      reportGeneratedDate: "",
      reportFileNameDate: "",
    },
  );
  const { mounted, reportGeneratedDate, reportFileNameDate } = reportState;

  useEffect(() => {
    const now = new Date();
    setReportState({
      mounted: true,
      reportGeneratedDate: now.toLocaleDateString("es-PE"),
      reportFileNameDate: now.toISOString().split("T")[0],
    });
  }, []);

  const revenueData = revenueByMonth.map((d: any) => ({
    name: d.month.substring(0, 3).toUpperCase(),
    value: d.revenue,
  }));

  const rosenRevenueData = revenueByMonth.slice(-5).map((d: any) => ({
    key: d.month,
    value: d.revenue,
  }));

  const planData = membershipsByPlan.map((d: any) => ({
    label: d.plan,
    value: d.count,
    color: d.color || "#8b5cf6",
  }));

  const statusData = membersByStatus.map((d: any) => ({
    label: d.status,
    value: d.count,
    color: d.color,
  }));

  const heatmapData = useMemo(() => {
    const data: number[][] = Array.from({ length: 9 }, () => Array(7).fill(0));
    attendanceByDay.forEach((d: any, i: number) => {
      const dayIndex = i % 7;
      const hourIndex = Math.floor(i / 7) % 9;
      data[hourIndex][dayIndex] = d.count;
    });
    return data;
  }, [attendanceByDay]);

  const handleExport = async (type: string) => {
    if (type === "csv") {
      const revenueSheet = Papa.unparse({
        fields: ["Mes", "Ingresos_Soles"],
        data: revenueByMonth.map((d: any) => [d.month, d.revenue]),
      });

      const plansSheet = Papa.unparse({
        fields: ["Plan", "Cantidad_Miembros"],
        data: membershipsByPlan.map((d: any) => [d.plan, d.count]),
      });

      const attendanceSheet = Papa.unparse({
        fields: ["Fecha", "Asistencias"],
        data: attendanceByDay.map((d: any) => [d.date, d.count]),
      });

      const topMembersSheet = Papa.unparse({
        fields: ["Miembro", "Asistencias", "Ultima_Asistencia"],
        data: topMembers.slice(0, 5).map((d: any) => [
          d.fullName,
          d.attendancesCount || d.visitCount,
          d.lastAttendance
            ? format(new Date(d.lastAttendance), "yyyy-MM-dd HH:mm")
            : "N/A",
        ]),
      });

      const combinedCsv = [
        "=== FLUJO DE INGRESOS MENSUAL ===",
        revenueSheet,
        "=== DISTRIBUCION POR PLANES ===",
        plansSheet,
        "=== ASISTENCIA POR DIA ===",
        attendanceSheet,
        "=== TOP 5 SOCIOS RANKING DE LEALTAD ===",
        topMembersSheet,
      ].join("\n\n");

      const blob = new Blob(["\uFEFF" + combinedCsv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-gymos-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  const applyQuickPreset = (preset: "7D" | "30D" | "MONTH" | "YEAR") => {
    const end = new Date();
    const start = new Date();
    if (preset === "7D") start.setDate(end.getDate() - 7);
    else if (preset === "30D") start.setDate(end.getDate() - 30);
    else if (preset === "MONTH") start.setDate(1);
    else if (preset === "YEAR") start.setMonth(0, 1);

    setFrom(start.toISOString().slice(0, 10));
    setTo(end.toISOString().slice(0, 10));
  };

  const insights = useMemo(() => {
    const topPlan = [...membershipsByPlan].sort((a: any, b: any) => b.count - a.count)[0];
    const bestMonth = [...revenueByMonth].sort((a: any, b: any) => b.revenue - a.revenue)[0];
    const totalMembersStatus = membersByStatus.reduce((acc: number, s: any) => acc + (s.count || 0), 0);
    const activeMembers = kpis?.activeMembers ?? 0;
    const activePct = totalMembersStatus > 0 ? Math.round((activeMembers / totalMembersStatus) * 100) : 0;

    return {
      topPlanLabel: topPlan ? `${topPlan.plan} (${topPlan.count} socios)` : "Sin datos de planes",
      bestMonthLabel: bestMonth ? `${bestMonth.month} (S/ ${Number(bestMonth.revenue).toLocaleString()})` : "Sin registros",
      activePct,
      growth: kpis?.revenueGrowth ?? 0,
    };
  }, [membershipsByPlan, revenueByMonth, membersByStatus, kpis]);

  return (
    <div className="space-y-6 pb-10 animate-fade-in-fast w-full">
      {/* Header Editorial (unificado con el resto de módulos) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-4" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
            Inteligencia de Negocio
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight text-foreground">
          Analytics & BI Hub
        </h1>
        <p className="text-sm text-muted-foreground font-sans">
          Desglosando el rendimiento operativo y financiero para una{" "}
          <span className="text-foreground font-medium">gestión basada en datos</span>.
        </p>
      </div>

      {/* Unified Period & Export Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 glass-card p-4 rounded-2xl border-border">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            {[
              { id: "7D", label: "7D" },
              { id: "30D", label: "30D" },
              { id: "MONTH", label: "Este Mes" },
              { id: "YEAR", label: "Año" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyQuickPreset(p.id as "7D" | "30D" | "MONTH" | "YEAR")}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <DateRangePicker
            from={from}
            to={to}
            onSelectRange={({ from, to }) => {
              setFrom(from);
              setTo(to);
            }}
            placeholder="Filtrar período"
            showPresets={false}
            align="start"
          />

          {(from || to) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrom(null);
                setTo(null);
              }}
              className="h-9 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleExport("csv")}
            className="h-11 px-4 rounded-xl border-border bg-muted/40 hover:bg-muted font-bold text-[10px] uppercase tracking-widest gap-2"
          >
            <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
            Exportar CSV
          </Button>

          {mounted && (
            <ReportExport
              kpis={kpis}
              revenueByMonth={revenueByMonth}
              attendanceByDay={attendanceByDay}
              membershipsByPlan={membershipsByPlan}
              membersByStatus={membersByStatus}
              topMembers={topMembers}
              startDate={from ? new Date(`${from}T00:00:00`) : undefined}
              endDate={to ? new Date(`${to}T23:59:59`) : undefined}
              generatedDate={reportGeneratedDate}
              fileNameDate={reportFileNameDate}
            />
          )}
        </div>
      </div>

      {/* Executive Smart Insights Banner (datos reales) */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-primary/12 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <div className="size-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="size-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              Resumen Inteligente de Negocio
              <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-[9px]">
                Auto-Insight
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plan líder: <strong className="text-foreground">{insights.topPlanLabel}</strong> &bull;{" "}
              Pico de ingresos: <strong className="text-foreground">{insights.bestMonthLabel}</strong> &bull;{" "}
              Base activa: <strong className="text-foreground">{insights.activePct}%</strong> (crecimiento mensual:{" "}
              <strong className="text-primary">+{insights.growth}%</strong>).
            </p>
          </div>
        </div>
      </div>

      {/* Top KPI Cards */}
      <KpiCards kpis={kpis} />

      {/* Tabbed Analytics Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 border border-border p-1 rounded-2xl grid grid-cols-1 sm:grid-cols-3 h-auto max-w-xl w-full">
          <TabsTrigger
            value="overview"
            className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
          >
            <BarChart3 className="size-3.5" />
            Resumen Ejecutivo
          </TabsTrigger>
          <TabsTrigger
            value="finance"
            className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
          >
            <CreditCard className="size-3.5" />
            Finanzas & Planes
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
          >
            <Users className="size-3.5" />
            Asistencia & Lealtad
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RESUMEN EJECUTIVO */}
        <TabsContent value="overview" className="space-y-8 focus-visible:outline-hidden">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 glass-card overflow-hidden group rounded-3xl border-white/10">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <TrendingUp className="size-3" />
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                      Rendimiento Histórico
                    </p>
                  </div>
                  <h3 className="text-2xl font-serif">Flujo de Ingresos</h3>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary border-primary/20 font-bold"
                >
                  Mensual
                </Badge>
              </div>
              <div className="p-6">
                <StackedAreaChart
                  data={revenueData}
                  tooltipLabel="Ingresos S/."
                  height={280}
                />
              </div>
            </div>

            <div className="lg:col-span-4 glass-card overflow-hidden group rounded-3xl border-white/10 flex flex-col h-full">
              <div className="p-6 border-b border-white/5 bg-white/2">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Sparkles className="size-3" />
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                    Salud de la Base
                  </p>
                </div>
                <h3 className="text-2xl font-serif">Estados de Membresía</h3>
              </div>
              <div className="p-6 flex-1 flex items-center justify-center my-auto">
                <RadialDonutChart data={statusData} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <TopMembersRanking topMembers={topMembers} />
            </div>

            <div className="lg:col-span-7 glass-card p-6 rounded-3xl border-white/10">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <TrendingUp className="size-3" />
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                    Análisis Comparativo
                  </p>
                </div>
                <h3 className="text-2xl font-serif">
                  Ingresos Recientes (Crecimiento Relativo)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Visualización cuantitativa de los últimos meses de operación.
                </p>
              </div>
              <RosenChart data={rosenRevenueData} />
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: FINANZAS & PLANES */}
        <TabsContent value="finance" className="space-y-8 focus-visible:outline-hidden">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 glass-card overflow-hidden group rounded-3xl border-white/10">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <TrendingUp className="size-3" />
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                      Procesamiento Financiero
                    </p>
                  </div>
                  <h3 className="text-2xl font-serif">Evolución de Recaudación</h3>
                </div>
              </div>
              <div className="p-6">
                <StackedAreaChart
                  data={revenueData}
                  tooltipLabel="Recaudación S/."
                  height={320}
                />
              </div>
            </div>

            <div className="lg:col-span-5 glass-card overflow-hidden group rounded-3xl border-white/10 flex flex-col h-full">
              <div className="p-6 border-b border-white/5 bg-white/2">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <PieChart className="size-3" />
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                    Composición Comercial
                  </p>
                </div>
                <h3 className="text-2xl font-serif">Distribución por Planes</h3>
              </div>
              <div className="p-6 flex-1 flex items-center justify-center my-auto">
                <RadialDonutChart data={planData} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: ASISTENCIA & LEALTAD */}
        <TabsContent value="attendance" className="space-y-8 focus-visible:outline-hidden">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <TopMembersRanking topMembers={topMembers} />
            </div>

            <div className="lg:col-span-7 glass-card overflow-hidden group rounded-3xl border-white/10">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Activity className="size-3" />
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                      Dinámica de Molinetes
                    </p>
                  </div>
                  <h3 className="text-2xl font-serif">Horas Pico & Mapa de Calor</h3>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
                >
                  Últimos 30 días
                </Badge>
              </div>
              <div className="p-6">
                <ActivityHeatmap data={heatmapData} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}