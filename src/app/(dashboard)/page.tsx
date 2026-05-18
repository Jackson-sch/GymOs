"use client";

import { useState, useEffect, useReducer } from "react";
import { Users, CreditCard, UserCheck, TrendingUp, Sparkles, Activity, Clock, PieChart, UserPlus, Settings, ShieldCheck, AlertTriangle } from "lucide-react";
import { RosenChart } from "@/components/shared/RosenChart";
import { RadialDonutChart } from "@/components/charts/RadialDonutChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { cn } from "@/lib/utils";
import { 
  getDashboardStats, 
  getRevenueData, 
  getPlanComposition, 
  getRecentActivity, 
  getAttendanceHeatmap,
  getWeeklyAttendance,
  getCurrentOccupancyAction 
} from "@/lib/actions/dashboard";
import { getMaintenanceAlerts } from "@/lib/actions/inventory-actions";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const getActionIcon = (type: string) => {
  switch (type) {
    case "ATTENDANCE": return UserCheck;
    case "MEMBER_CREATE": return UserPlus;
    case "PAYMENT": return CreditCard;
    case "SYSTEM_UPDATE": return Settings;
    default: return ShieldCheck;
  }
};

const dashboardReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };
    case "SET_MOUNTED":
      return { ...state, mounted: action.payload };
    default:
      return state;
  }
};

const initialState = {
  mounted: false,
  stats: null,
  revenueData: [],
  planData: [],
  activityData: [],
  heatmapData: undefined,
  weeklyData: [],
  maintenanceAlerts: [],
  occupancy: { percentage: 0, count: 0 }
};
export default function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { 
    mounted, 
    stats, 
    revenueData, 
    planData, 
    activityData, 
    heatmapData, 
    weeklyData, 
    maintenanceAlerts, 
    occupancy 
  } = state;

  useEffect(() => {
    dispatch({ type: "SET_MOUNTED", payload: true });
    const fetchData = async () => {
      const [s, r, p, a, h, w, m, o] = await Promise.all([
        getDashboardStats(),
        getRevenueData(),
        getPlanComposition(),
        getRecentActivity(),
        getAttendanceHeatmap(),
        getWeeklyAttendance(),
        getMaintenanceAlerts(),
        getCurrentOccupancyAction()
      ]);
      
      dispatch({ 
        type: "SET_DATA", 
        payload: {
          stats: s,
          revenueData: r,
          planData: p,
          activityData: a,
          heatmapData: h,
          weeklyData: w,
          maintenanceAlerts: m.success ? (m.data as any[]) : [],
          occupancy: o.success ? { percentage: o.percentage, count: o.count } : { percentage: 0, count: 0 }
        }
      });
    };
    fetchData();
  }, []);

  const kpis = [
    { label: "Socios Activos", value: stats?.totalMembers ?? "...", icon: Users, trend: stats?.activeTrend ?? "...", color: "text-primary" },
    { label: "Ingresos Totales", value: `S/. ${(stats?.revenue ?? 0).toLocaleString()}`, icon: CreditCard, trend: stats?.revenueTrend ?? "...", color: "text-accent" },
    { label: "Asistencia Hoy", value: stats?.attendanceToday ?? "...", icon: UserCheck, trend: "En vivo", color: "text-primary" },
    { label: "Nuevos Socios", value: `+${stats?.newMembers ?? "..."}`, icon: TrendingUp, trend: stats?.newMemberTrend ?? "...", color: "text-accent" },
  ];


  if (!mounted) return <div className="w-full aspect-video animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-8 md:pb-12 max-w-[100vw]">
      {/* Header Editorial */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Estado del Sistema</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif leading-tight">Vista General</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Gestionando la excelencia operativa y el rendimiento de <span className="text-foreground font-medium">GymOS Elite</span>.
          </p>
        </div>
        
        <div className="glass-card px-6 py-4 items-center gap-4 hidden md:flex">
          <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Activity className="size-5 text-emerald-500 animate-pulse" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Flujo en Tiempo Real</p>
            <p className="text-sm font-medium">Sistema Sincronizado</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card p-8 interactive-hover border-white/5 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 size-24 -mr-8 -mt-8 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl rounded-full ${kpi.color.replace('text-', 'bg-')}`} />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={cn(
                "p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-500 group-hover:scale-110",
                kpi.color
              )}>
                <kpi.icon className="size-5" />
              </div>
              <Badge variant="outline" className={cn(
                "text-[9px] font-bold px-2 py-0.5 border-none",
                kpi.trend.startsWith("+") || kpi.trend === "En vivo" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {kpi.trend}
              </Badge>
            </div>
            
            <div className="space-y-1 relative z-10">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                {kpi.label}
              </h3>
              <p className="text-4xl font-serif tracking-tight group-hover:translate-x-1 transition-transform duration-500">
                {kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>


      {/* Maintenance Alerts - Priority Row */}
      {maintenanceAlerts.length > 0 && (
        <div className="glass-card p-4 md:p-6 border-rose-500/20 bg-rose-500/5 animate-in slide-in-from-top duration-1000">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-8 rounded-full bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="size-4 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Alertas de Mantenimiento</h2>
              <p className="text-[9px] text-rose-500/60 uppercase tracking-widest font-medium">Equipos que requieren atención inmediata</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {maintenanceAlerts.map((item: any) => (
              <div key={item.id} className="flex flex-col justify-between bg-background/40 p-3 rounded-xl border border-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer group">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold truncate group-hover:text-rose-500 transition-colors">{item.name}</p>
                  <p className="text-[9px] uppercase text-muted-foreground tracking-tighter">{item.category}</p>
                </div>
                <div className="mt-2 flex justify-between items-center">
                   <Badge variant="outline" className="text-[7px] border-rose-500/30 text-rose-500 uppercase h-4 px-1.5 font-semibold">
                    {item.status === "MAINTENANCE" ? "En Reparación" : "Vencido"}
                  </Badge>
                  <span className="text-[8px] text-muted-foreground font-mono">{item.serialNumber || "S/N"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Finance & Membership Composition */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 glass-card p-4 md:p-8 border-white/5 relative overflow-hidden">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <CreditCard className="size-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Finanzas</p>
            </div>
            <h2 className="text-lg md:text-2xl font-serif">Análisis de Ingresos</h2>
          </div>
          <div className="w-full overflow-hidden">
            <StackedAreaChart 
              data={revenueData.map((d: any) => ({ name: d.key, value: d.value }))} 
              tooltipLabel="S/." 
            />
          </div>
        </div>
        
        <div className="lg:col-span-5 glass-card p-4 md:p-8 border-white/5 relative overflow-hidden">
          <div className="mb-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-accent mb-1">
              <PieChart className="size-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Composición</p>
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
              <Activity className="size-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Asistencia</p>
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
              <Clock className="size-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Tiempo Real</p>
            </div>
            <h2 className="text-lg md:text-2xl font-serif">Actividad Reciente</h2>
          </div>
          
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar relative">
            {activityData.length > 0 ? (
              activityData.map((item: any) => {
                const Icon = getActionIcon(item.type);
                return (
                  <div key={item.id} className="flex items-center gap-3 group cursor-default max-w-full">
                    <div className={cn(
                      "size-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                      item.status === "emerald" ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                      item.status === "primary" ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white" :
                      "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white"
                    )}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs md:text-sm font-medium truncate capitalize">
                        {item.action.toLowerCase()}: <span className="text-muted-foreground normal-case">{item.user}</span>
                      </p>
                      <p 
                        className="text-[10px] text-muted-foreground uppercase tracking-tighter"
                        suppressHydrationWarning
                      >
                        Hace {formatDistanceToNow(new Date(item.date), { locale: es, addSuffix: false })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div key="empty-activity" className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="size-8 text-muted-foreground/20 mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sin actividad reciente</p>
              </div>
            )}
          </div>
          
          <button className="w-full mt-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[9px] uppercase tracking-[0.3em] font-semibold hover:bg-white/10 transition-colors">
            Ver Historial Completo
          </button>
        </div>
      </div>

      {/* Row 3: Peak Hours (Heatmap) */}
      <div className="glass-card p-4 md:p-8 border-white/5 relative overflow-hidden">
        <div className="mb-4 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Clock className="size-3" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Afluencia</p>
            </div>
            <h2 className="text-lg md:text-2xl font-serif">Mapa de Calor: Horas Pico</h2>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Capacidad Actual</p>
            <p className={cn(
              "text-xs font-medium",
              occupancy.percentage > 80 ? "text-rose-500" : occupancy.percentage > 50 ? "text-amber-500" : "text-emerald-500"
            )}>
              {occupancy.percentage}% Sincronizado ({occupancy.count} personas)
            </p>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <ActivityHeatmap data={heatmapData} />
        </div>
      </div>
    </div>
  );
}
