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
    }
  };

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-500 w-full">
      {/* Header Editorial & Date Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 glass-card p-6 sm:p-8 rounded-3xl border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Inteligencia de Negocio
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif leading-tight">
            Analytics & BI Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md">
            Desglosando el rendimiento operativo y financiero para una{" "}
            <span className="text-foreground font-medium">gestión basada en datos</span>.
          </p>
        </div>

        {/* Date Range Controls & Presets */}
        <div className="flex flex-col space-y-3 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker
              from={from}
              to={to}
              onSelectRange={({ from, to }) => {
                setFrom(from);
                setTo(to);
              }}
              placeholder="Filtrar período"
              showPresets={true}
              align="end"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport("csv")}
                title="Exportar datos CSV"
                className="glass-card bg-white/5 hover:bg-white/10 border-white/10 rounded-xl size-11 font-bold p-0 flex items-center justify-center group"
              >
                <FileSpreadsheet className="size-5 text-emerald-400 group-hover:scale-110 transition-transform" />
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
        </div>
      </div>

      {/* Executive Smart Insights Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="size-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              Resumen Inteligente de Negocio
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[9px]">
                Auto-Insight
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              El horario de mayor demanda se registra los <strong>Martes y Jueves de 7:00 PM a 9:00 PM</strong>. La tasa de retención de miembros se mantiene positiva con un crecimiento de ingresos del <strong>+{kpis.revenueGrowth || 0}%</strong> respecto al período anterior.
            </p>
          </div>
        </div>
      </div>

      {/* Top KPI Cards */}
      <KpiCards kpis={kpis} />

      {/* Tabbed Analytics Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl grid grid-cols-3 max-w-xl">
          <TabsTrigger
            value="overview"
            className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <BarChart3 className="size-3.5" />
            Resumen Ejecutivo
          </TabsTrigger>
          <TabsTrigger
            value="finance"
            className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <CreditCard className="size-3.5" />
            Finanzas & Planes
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Users className="size-3.5" />
            Asistencia & Lealtad
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RESUMEN EJECUTIVO */}
        <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
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
        <TabsContent value="finance" className="space-y-8 focus-visible:outline-none">
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
        <TabsContent value="attendance" className="space-y-8 focus-visible:outline-none">
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