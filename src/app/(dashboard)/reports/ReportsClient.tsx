"use client";

import React from "react";
import Papa from "papaparse";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { RadialDonutChart } from "@/components/charts/RadialDonutChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useQueryState, parseAsString } from "nuqs";
import { KpiCards } from "./KpiCards";
import { TopMembersRanking } from "./TopMembersRanking";

const ReportExport = dynamic(() => import("./ReportExport"), {
  ssr: false,
  loading: () => (
    <Button variant="outline" disabled className="glass-card bg-primary/10 border-primary/20 text-primary rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest opacity-50">
      Cargando PDF…
    </Button>
  )
});
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { X, Calendar as CalendarIcon, FileText, FileChartColumn, PieChart, TrendingUp, Sparkles, Activity, FileSpreadsheet } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
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

  const [reportState, setReportState] = React.useReducer((s: any, a: any) => ({ ...s, ...a }), {
    mounted: false,
    reportGeneratedDate: "",
    reportFileNameDate: ""
  });
  const { mounted, reportGeneratedDate, reportFileNameDate } = reportState;

  React.useEffect(() => {
    const now = new Date();
    setReportState({
      mounted: true,
      reportGeneratedDate: now.toLocaleDateString("es-PE"),
      reportFileNameDate: now.toISOString().split("T")[0]
    });
  }, []);

  const dateRange: DateRange | undefined = React.useMemo(() => ({
    from: from ? new Date(from + "T00:00:00") : undefined,
    to: to ? new Date(to + "T00:00:00") : undefined,
  }), [from, to]);

  const handleSelectRange = (range: DateRange | undefined) => {
    if (range?.from) {
      setFrom(format(range.from, "yyyy-MM-dd"));
    } else {
      setFrom(null);
    }
    
    if (range?.to) {
      setTo(format(range.to, "yyyy-MM-dd"));
    } else {
      setTo(null);
    }
  };

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

  const attendanceData = attendanceByDay.map((d: any) => ({
    name: d.date,
    value: d.count,
  }));

  const heatmapData = React.useMemo(() => {
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
        data: revenueByMonth.map((d: any) => [d.month, d.revenue])
      });

      const plansSheet = Papa.unparse({
        fields: ["Plan", "Cantidad_Miembros"],
        data: membershipsByPlan.map((d: any) => [d.plan, d.count])
      });

      const attendanceSheet = Papa.unparse({
        fields: ["Fecha", "Asistencias"],
        data: attendanceByDay.map((d: any) => [d.date, d.count])
      });

      const topMembersSheet = Papa.unparse({
        fields: ["Miembro", "Asistencias", "Ultima_Asistencia"],
        data: topMembers.map((d: any) => [
          d.fullName, 
          d.attendancesCount, 
          d.lastAttendance ? format(new Date(d.lastAttendance), "yyyy-MM-dd HH:mm") : "N/A"
        ])
      });

      const combinedCsv = [
        "=== FLUJO DE INGRESOS MENSUAL ===",
        revenueSheet,
        "=== DISTRIBUCION POR PLANES ===",
        plansSheet,
        "=== ASISTENCIA POR DIA ===",
        attendanceSheet,
        "=== TOP SOCIOS MAS ACTIVOS ===",
        topMembersSheet
      ].join("\n\n");

      const blob = new Blob(["\uFEFF" + combinedCsv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-gymos-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-1000">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Inteligencia de Negocio</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Analytics</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Desglosando el rendimiento operativo y financiero para una <span className="text-foreground font-medium">gestión basada en datos</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="glass-card bg-white/2 hover:bg-white/10 border-white/10 rounded-xl h-12 px-6 font-bold text-[10px] uppercase tracking-widest transition-all gap-3 flex-1 md:flex-none">
                <CalendarIcon className="size-4 text-primary" />
                {mounted && dateRange?.from && dateRange?.to ? 
                  `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM")}` : 
                  "Filtrar período"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl w-auto" align="end">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleSelectRange}
                numberOfMonths={2}
                className="p-3"
              />
              {(from || to) && (
                <div className="p-3 border-t border-white/5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setFrom(null); setTo(null); }}
                    className="w-full h-9 text-[9px] uppercase tracking-widest font-bold hover:bg-rose-500/10 text-rose-500 transition-colors gap-2"
                  >
                    <X className="size-3" />
                    Resetear Filtros
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => handleExport("csv")} 
              title="Exportar CSV"
              className="glass-card bg-white/2 hover:bg-white/10 border-white/10 rounded-xl size-12 font-bold transition-all p-0 flex items-center justify-center group flex-1 md:flex-none"
            >
              <FileSpreadsheet className="size-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            </Button>
            
            {mounted && (
              <div className="flex-1 md:flex-none">
                <ReportExport
                  kpis={kpis}
                  revenueByMonth={revenueByMonth}
                  attendanceByDay={attendanceByDay}
                  membershipsByPlan={membershipsByPlan}
                  membersByStatus={membersByStatus}
                  topMembers={topMembers}
                  startDate={dateRange?.from}
                  endDate={dateRange?.to}
                  generatedDate={reportGeneratedDate}
                  fileNameDate={reportFileNameDate}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <KpiCards kpis={kpis} />

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 glass-card overflow-hidden group">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div>
              <div className="flex items-center gap-2 text-primary mb-1">
                <TrendingUp className="size-3" />
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Rendimiento Histórico</p>
              </div>
              <h3 className="text-2xl font-serif">Flujo de Ingresos</h3>
            </div>
            <Badge variant="outline" className="text-[8px] uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary border-primary/20 font-bold">Mensual</Badge>
          </div>
          <div className="p-8">
            <StackedAreaChart 
              data={revenueData} 
              tooltipLabel="Ingresos S/." 
              height={300}
            />
          </div>
        </div>

        <div className="lg:col-span-4 glass-card overflow-hidden group">
          <div className="p-8 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-2 text-accent mb-1">
              <PieChart className="size-3" />
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Composición</p>
            </div>
            <h3 className="text-2xl font-serif">Planes de Éxito</h3>
          </div>
          <div className="p-8 h-[300px] flex items-center justify-center">
            <RadialDonutChart data={planData} />
          </div>
        </div>
      </div>

      {/* Secondary Analysis Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 glass-card overflow-hidden group">
          <div className="p-8 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Sparkles className="size-3" />
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Salud de la Base</p>
            </div>
            <h3 className="text-2xl font-serif">Estados de Membresía</h3>
          </div>
          <div className="p-8 h-[300px] flex items-center justify-center">
            <RadialDonutChart data={statusData} />
          </div>
        </div>

        <div className="lg:col-span-8 glass-card overflow-hidden group">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <Activity className="size-3" />
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Dinámica de Asistencia</p>
              </div>
              <h3 className="text-2xl font-serif">Horas Pico & Afluencia</h3>
            </div>
            <Badge variant="outline" className="text-[8px] uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">Últimos 30 días</Badge>
          </div>
          <div className="p-8">
            <ActivityHeatmap data={heatmapData} />
          </div>
        </div>
      </div>

      {/* Deep Analysis with Rosen Chart */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
           <TopMembersRanking topMembers={topMembers} />
        </div>
        <div className="lg:col-span-7 glass-card p-8 group">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp className="size-3" />
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Análisis Comparativo</p>
            </div>
            <h3 className="text-2xl font-serif">Ingresos Recientes (Rosen Style)</h3>
            <p className="text-xs text-muted-foreground mt-2">Visualización de los últimos meses con énfasis en el crecimiento relativo.</p>
          </div>
          <RosenChart data={rosenRevenueData} />
        </div>
      </div>
    </div>
  );
}