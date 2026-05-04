"use client";

import { Users, CreditCard, UserCheck, TrendingUp, Sparkles, Activity, Clock, PieChart, UserPlus, Settings, ShieldCheck } from "lucide-react";
import { RosenChart } from "@/components/shared/RosenChart";
import { RadialDonutChart } from "@/components/charts/RadialDonutChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { cn } from "@/lib/utils";
import React from "react";
import { 
  getDashboardStats, 
  getRevenueData, 
  getPlanComposition, 
  getRecentActivity, 
  getAttendanceHeatmap,
  getWeeklyAttendance 
} from "@/lib/actions/dashboard";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const getActionIcon = (type: string) => {
  switch (type) {
    case "ATTENDANCE": return UserCheck;
    case "MEMBER_CREATE": return UserPlus;
    case "PAYMENT": return CreditCard;
    case "SYSTEM_UPDATE": return Settings;
    default: return ShieldCheck;
  }
};

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  const [stats, setStats] = React.useState<any>(null);
  const [revenueData, setRevenueData] = React.useState<any[]>([]);
  const [planData, setPlanData] = React.useState<any[]>([]);
  const [activityData, setActivityData] = React.useState<any[]>([]);
  const [heatmapData, setHeatmapData] = React.useState<number[][] | undefined>(undefined);
  const [weeklyData, setWeeklyData] = React.useState<any[]>([]);

  React.useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      const [s, r, p, a, h, w] = await Promise.all([
        getDashboardStats(),
        getRevenueData(),
        getPlanComposition(),
        getRecentActivity(),
        getAttendanceHeatmap(),
        getWeeklyAttendance()
      ]);
      setStats(s);
      setRevenueData(r);
      setPlanData(p);
      setActivityData(a);
      setHeatmapData(h);
      setWeeklyData(w);
    };
    fetchData();
  }, []);

  const kpis = [
    { label: "Socios Activos", value: stats?.totalMembers ?? "...", icon: Users, trend: stats?.activeTrend ?? "...", color: "text-primary" },
    { label: "Ingresos Totales", value: `S/. ${(stats?.revenue ?? 0).toLocaleString()}`, icon: CreditCard, trend: stats?.revenueTrend ?? "...", color: "text-accent" },
    { label: "Asistencia Hoy", value: stats?.attendanceToday ?? "...", icon: UserCheck, trend: "En vivo", color: "text-primary" },
    { label: "Nuevos Socios", value: `+${stats?.newMembers ?? "..."}`, icon: TrendingUp, trend: "+15%", color: "text-accent" },
  ];

  if (!mounted) return <div className="w-full aspect-video animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-8 md:pb-12 max-w-[100vw]">
      {/* Header Editorial */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Estado del Sistema</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif leading-tight">Vista General</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Gestionando la excelencia operativa y el rendimiento de <span className="text-foreground font-medium">GymOS Elite</span>.
          </p>
        </div>
        
        <div className="glass-card px-6 py-4 items-center gap-4 hidden md:flex">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Flujo en Tiempo Real</p>
            <p className="text-sm font-medium">Sistema Sincronizado</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card p-4 md:p-6 interactive-hover border-white/5 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                kpi.trend.startsWith("+") || kpi.trend === "En vivo" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              }`}>
                {kpi.trend}
              </span>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
                {kpi.label}
              </h3>
              <p className="text-xl md:text-3xl font-sans font-light tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                {kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Finance & Membership Composition */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 glass-card p-4 md:p-8 border-white/5 relative overflow-hidden">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <CreditCard className="w-3 h-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Finanzas</p>
            </div>
            <h2 className="text-lg md:text-2xl font-serif">Análisis de Ingresos</h2>
          </div>
          <div className="w-full overflow-hidden">
            <RosenChart data={revenueData} />
          </div>
        </div>
        
        <div className="lg:col-span-5 glass-card p-4 md:p-8 border-white/5 relative overflow-hidden">
          <div className="mb-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-accent mb-1">
              <PieChart className="w-3 h-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Composición</p>
            </div>
            <h2 className="text-lg md:text-2xl font-serif">Planes Populares</h2>
          </div>
          <div className="w-full overflow-hidden">
            <RadialDonutChart data={planData} />
          </div>
        </div>
      </div>

      {/* Row 2: Attendance Trend & Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 glass-card p-4 md:p-8 border-white/5 relative overflow-hidden">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Activity className="w-3 h-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Asistencia</p>
            </div>
            <h2 className="text-lg md:text-2xl font-serif">Tendencia Semanal</h2>
          </div>
          <div className="w-full overflow-hidden">
            <StackedAreaChart data={weeklyData} />
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-4 md:p-8 border-white/5 relative overflow-hidden">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-accent mb-1">
              <Clock className="w-3 h-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tiempo Real</p>
            </div>
            <h2 className="text-lg md:text-2xl font-serif">Actividad Reciente</h2>
          </div>
          
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar relative">
            {activityData.length > 0 ? (
              activityData.map((item, i) => {
                const Icon = getActionIcon(item.type);
                return (
                  <div key={i} className="flex items-center gap-3 group cursor-default max-w-full">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                      item.status === "emerald" ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                      item.status === "primary" ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white" :
                      "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs md:text-sm font-medium truncate capitalize">
                        {item.action.toLowerCase()}: <span className="text-muted-foreground normal-case">{item.user}</span>
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">
                        Hace {formatDistanceToNow(new Date(item.date), { locale: es, addSuffix: false })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="w-8 h-8 text-muted-foreground/20 mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sin actividad reciente</p>
              </div>
            )}
          </div>
          
          <button className="w-full mt-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 transition-colors">
            Ver Historial Completo
          </button>
        </div>
      </div>

      {/* Row 3: Peak Hours (Heatmap) */}
      <div className="glass-card p-4 md:p-8 border-white/5 relative overflow-hidden">
        <div className="mb-4 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Clock className="w-3 h-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Afluencia</p>
            </div>
            <h2 className="text-lg md:text-2xl font-serif">Mapa de Calor: Horas Pico</h2>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Capacidad Actual</p>
            <p className="text-xs font-medium text-emerald-500">42% Sincronizado</p>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <ActivityHeatmap data={heatmapData} />
        </div>
      </div>
    </div>
  );
}
