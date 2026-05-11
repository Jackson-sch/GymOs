"use client";

import React from "react";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { RadialDonutChart } from "@/components/charts/RadialDonutChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, FileChartColumn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportPDF } from "./ReportPDF";

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
  const revenueData = revenueByMonth.map((d: any) => ({
    name: d.month.substring(0, 3).toUpperCase(),
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
    label: d.date,
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
      const csvContent = [
        ["Fecha", "Ingresos"].join(","),
        ...revenueByMonth.map((d: any) => [d.month, d.revenue].join(",")),
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reportes-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight">Reportes</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] font-medium">
            Análisis de rendimiento y métricas
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-card bg-white/2 hover:bg-white/10 border-white/10 rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest transition-all">
            <Calendar className="mr-2 h-3 w-3" />
            Rango de fechas
          </Button>
          <Button variant="outline" onClick={() => handleExport("csv")} className="glass-card bg-white/2 hover:bg-white/10 border-white/10 rounded-xl h-11 w-11 font-bold text-[10px] uppercase tracking-widest transition-all">
            <FileText className="h-4 w-4" />
          </Button>
          <PDFDownloadLink
            document={
              <ReportPDF
                kpis={kpis}
                revenueByMonth={revenueByMonth}
                attendanceByDay={attendanceByDay}
                membershipsByPlan={membershipsByPlan}
                membersByStatus={membersByStatus}
                topMembers={topMembers}
              />
            }
            fileName={`reporte-gymos-${new Date().toISOString().split("T")[0]}.pdf`}
          >
            {({ loading }) => (
              <Button 
                variant="outline" 
                disabled={loading}
                className="glass-card bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                <FileChartColumn className="mr-2 h-3 w-3" />
                {loading ? "Generando..." : "PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Miembros activos", 
            value: kpis.activeMembers, 
            sub: `+${kpis.newMembersThisMonth} este mes`,
            accent: "emerald"
          },
          { 
            title: "Ingresos del mes", 
            value: `S/ ${kpis.revenueThisMonth?.toLocaleString()}`, 
            sub: `${Number(kpis.revenueGrowth) >= 0 ? "+" : ""}${kpis.revenueGrowth}% vs mes anterior`,
            accent: "violet",
            isGrowth: true
          },
          { 
            title: "Asistencia hoy", 
            value: kpis.attendanceToday, 
            sub: `${kpis.attendanceThisWeek} esta semana`,
            accent: "amber"
          },
          { 
            title: "Por vencer", 
            value: kpis.expiringThisWeek, 
            sub: "Próximos 7 días",
            accent: "rose"
          }
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 premium-gradient relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${kpi.accent}-500/10 blur-3xl rounded-full transition-all group-hover:scale-150`} />
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">
              {kpi.title}
            </p>
            <div className="space-y-1">
              <h3 className="text-3xl font-serif tracking-tight">{kpi.value}</h3>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${kpi.isGrowth ? (Number(kpis.revenueGrowth) >= 0 ? "text-emerald-500" : "text-rose-500") : "text-muted-foreground/60"}`}>
                {kpi.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-serif">Ingresos por mes</h3>
            <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-2 bg-primary/10 text-primary border-primary/20">Último año</Badge>
          </div>
          <div className="p-6">
            <StackedAreaChart data={revenueData} tooltipLabel="S/." />
          </div>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-serif">Membresías por plan</h3>
            <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-2 bg-primary/10 text-primary border-primary/20">Distribución</Badge>
          </div>
          <div className="p-6">
            <RadialDonutChart data={planData} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-serif">Estado de miembros</h3>
            <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-2 bg-primary/10 text-primary border-primary/20">Tiempo Real</Badge>
          </div>
          <div className="p-6">
            <RadialDonutChart data={statusData} />
          </div>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-serif">Asistencia últimos 30 días</h3>
            <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-2 bg-primary/10 text-primary border-primary/20">Mapa de Calor</Badge>
          </div>
          <div className="p-6">
            <ActivityHeatmap data={heatmapData} />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div>
            <h3 className="text-2xl font-serif leading-none mb-1">Top miembros más activos</h3>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Ranking de lealtad</p>
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-1 h-1 rounded-full bg-primary/20" />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {topMembers.slice(0, 10).map((member: any, i: number) => (
            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-white/2 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {member.photo ? (
                      <img src={member.photo} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="text-xs text-muted-foreground/40">{member.fullName?.[0]}</span>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {i + 1}
                  </div>
                </div>
                <div>
                  <p className="font-medium">{member.fullName}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Socio {member.dni || "S/D"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-serif leading-none">{member.visitCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Visitas</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}