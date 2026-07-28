"use client";

import React, { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  UserCheck,
  TrendingUp,
  Sparkles,
  Activity,
  Clock,
  PieChart,
  UserPlus,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  ChevronRight,
  QrCode,
  Plus,
  Zap,
  Building2,
  Filter,
} from "lucide-react";
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
  getCurrentOccupancyAction,
} from "@/lib/actions/dashboard";
import { getMaintenanceAlerts } from "@/lib/actions/inventory-actions";
import { registerAttendanceAction } from "@/lib/actions/attendance-actions";
import { getMembersAction } from "@/lib/actions/members-actions";
import { getPlansAction } from "@/lib/actions/plans-actions";
import { getTrainersAction } from "@/lib/actions/trainers-actions";
import { getBranchAnalyticsAction } from "@/lib/actions/branch-actions";
import { useBranchStore } from "@/store/use-branch-store";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberForm } from "@/components/shared/forms/MemberForm";
import { PaymentForm } from "@/components/shared/forms/PaymentForm";
import { ClassForm } from "@/components/shared/forms/ClassForm";
import { QRScanner } from "@/components/shared/QRScanner";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formats";

const getActionIcon = (type: string) => {
  switch (type) {
    case "ATTENDANCE":
      return UserCheck;
    case "MEMBER_CREATE":
      return UserPlus;
    case "PAYMENT":
      return CreditCard;
    case "SYSTEM_UPDATE":
      return Settings;
    default:
      return ShieldCheck;
  }
};

const dashboardReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_MOUNTED":
      return { ...state, mounted: action.payload };
    default:
      return state;
  }
};

const initialState = {
  mounted: false,
  loading: false,
  stats: null,
  revenueData: [],
  planData: [],
  activityData: [],
  heatmapData: undefined,
  weeklyData: [],
  maintenanceAlerts: [],
  occupancy: { percentage: 0, count: 0 },
};

export default function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const {
    mounted,
    loading,
    stats,
    revenueData,
    planData,
    activityData,
    heatmapData,
    weeklyData,
    maintenanceAlerts,
    occupancy,
  } = state;

  // Multi-branch Zustand Store Subscription
  const { selectedBranchId, branches, setSelectedBranchId, setBranches } = useBranchStore();

  // Quick Action Modal States
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);

  // Pre-loaded options for forms
  const [modalData, setModalData] = useState<{ members: any[]; plans: any[]; trainers: any[] }>({
    members: [],
    plans: [],
    trainers: [],
  });

  const loadModalData = async () => {
    if (modalData.members.length > 0 && modalData.plans.length > 0) return;
    const [mRes, pRes, tRes] = await Promise.all([
      getMembersAction({ branchId: selectedBranchId }),
      getPlansAction(),
      getTrainersAction(),
    ]);
    setModalData({
      members: mRes.success ? (mRes.data as any[]) : [],
      plans: pRes.success ? (pRes.data as any[]) : [],
      trainers: tRes.success ? (tRes.data as any[]) : [],
    });
  };

  // Load available branches for selector on mount
  useEffect(() => {
    dispatch({ type: "SET_MOUNTED", payload: true });
    getBranchAnalyticsAction().then((res) => {
      if (res.success && res.data) {
        setBranches(res.data);
      }
    });
  }, [setBranches]);

  // Main Dashboard Data Fetching (Re-runs automatically when selectedBranchId changes!)
  useEffect(() => {
    let isMounted = true;
    dispatch({ type: "SET_LOADING", payload: true });

    const fetchData = async () => {
      const [s, r, p, a, h, w, m, o] = await Promise.all([
        getDashboardStats(selectedBranchId),
        getRevenueData(selectedBranchId),
        getPlanComposition(selectedBranchId),
        getRecentActivity(selectedBranchId),
        getAttendanceHeatmap(selectedBranchId),
        getWeeklyAttendance(selectedBranchId),
        getMaintenanceAlerts(selectedBranchId),
        getCurrentOccupancyAction(selectedBranchId),
      ]);

      if (isMounted) {
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
            occupancy: o.success
              ? { percentage: o.percentage, count: o.count }
              : { percentage: 0, count: 0 },
            loading: false,
          },
        });
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId]);

  const handleQrScan = async (memberId: string) => {
    const result = await registerAttendanceAction(memberId, "QR");
    if (result.success) {
      toast.success("Check-in con QR registrado correctamente");
      setIsQrOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const selectedBranchName =
    selectedBranchId === "ALL"
      ? "Todas las Sedes (Consolidado)"
      : branches.find((b) => b.id === selectedBranchId)?.name || "Sede Seleccionada";

  const kpis = [
    {
      label: "Socios Activos",
      value: stats?.totalMembers ?? "...",
      icon: Users,
      trend: stats?.activeTrend ?? "...",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Ingresos del Mes",
      value: stats?.revenue !== undefined ? formatCurrency(stats.revenue) : "...",
      icon: CreditCard,
      trend: stats?.revenueTrend ?? "...",
      badgeColor: "bg-primary/10 text-primary border-primary/30",
    },
    {
      label: "Asistencia Hoy",
      value: stats?.attendanceToday ?? "...",
      icon: UserCheck,
      trend: "En Vivo",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    },
    {
      label: "Nuevos Socios (Mes)",
      value: stats?.newMembers !== undefined ? `+${stats.newMembers}` : "...",
      icon: TrendingUp,
      trend: stats?.newMemberTrend ?? "...",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    {
      label: "Por Vencer (7 Días)",
      value: stats?.expiringMemberships ?? "...",
      icon: AlertTriangle,
      trend: "Atención",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    {
      label: "Clases Hoy",
      value: stats?.classesToday ?? "...",
      icon: Calendar,
      trend: "Programadas",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    },
  ];

  if (!mounted) return <div className="w-full aspect-video animate-pulse bg-white/5 rounded-3xl" />;

  return (
    <div className="space-y-8 animate-fade-in w-full pb-8">
      {/* Editorial Header & Multi-Branch Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Sparkles className="size-4" />
            <span>Centro de Control 360°</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground tracking-tight">
            Vista General
          </h1>
          <p className="text-muted-foreground font-sans max-w-md text-sm">
            Monitoreo en tiempo real para:{" "}
            <span className="text-primary font-bold">{selectedBranchName}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Multi-Branch Selector Dropdown (shadcn UI) */}
          <div className="flex items-center gap-2">
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="h-11 px-4 rounded-2xl border-white/15 bg-zinc-950/90 text-xs font-bold text-foreground shadow-lg focus:ring-primary/30">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary shrink-0" />
                  <SelectValue placeholder="Seleccionar sede..." />
                </div>
              </SelectTrigger>
              <SelectContent className="glass-card border-white/15 bg-zinc-950/95 backdrop-blur-2xl text-foreground rounded-2xl">
                <SelectItem value="ALL" className="text-xs font-bold focus:bg-white/10 cursor-pointer">
                  Consolidado (Todas las Sedes)
                </SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs font-bold focus:bg-white/10 cursor-pointer">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="glass-card px-5 py-3 rounded-2xl border-white/10 bg-zinc-950/80 backdrop-blur-md flex items-center gap-3 shadow-lg shrink-0">
            <div className={cn("size-3 rounded-full", loading ? "bg-amber-500 animate-spin" : "bg-emerald-500 animate-ping")} />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Estado Sede</p>
              <p className="text-xs font-bold text-foreground">
                {loading ? "Cargando métricas..." : "Sincronizado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 hover:border-primary/40 transition-colors shadow-xl"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] font-bold uppercase px-2 py-0.5", kpi.badgeColor)}>
                    {kpi.trend}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                    {loading ? "..." : kpi.value}
                  </p>
                  <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                    {kpi.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Tactical Command Actions Bar - MODALS INTEGRATED */}
      <div className="glass-card p-4 rounded-3xl border-white/10 bg-zinc-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-md">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 flex items-center gap-2">
          <Zap className="size-4 text-primary" /> Accesos Directos Rápidos (Modales en Vivo):
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Modal Marcación QR */}
          <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform">
                <QrCode className="size-3.5 mr-1.5" /> Marcación QR
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Escáner de Acceso QR</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Apunta la cámara al código QR del socio para registrar su entrada en {selectedBranchName}.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                {isQrOpen && <QRScanner onScan={handleQrScan} />}
              </div>
            </DialogContent>
          </Dialog>

          {/* 2. Modal Nuevo Socio */}
          <Dialog open={isMemberOpen} onOpenChange={setIsMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform">
                <Plus className="size-3.5 mr-1.5" /> Nuevo Socio
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-4xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Registrar Nuevo Socio</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Ingresa los datos personales y de membresía para dar de alta al socio.
                </DialogDescription>
              </DialogHeader>
              {isMemberOpen && (
                <MemberForm
                  onSuccess={() => {
                    setIsMemberOpen(false);
                    toast.success("Socio creado exitosamente");
                    window.location.reload();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* 3. Modal Registrar Pago */}
          <Dialog
            open={isPaymentOpen}
            onOpenChange={(open) => {
              setIsPaymentOpen(open);
              if (open) loadModalData();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-foreground">
                <CreditCard className="size-3.5 mr-1.5 text-primary" /> Registrar Pago
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Registrar Pago en Caja</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Vincula un socio a un plan y registra el ingreso financiero.
                </DialogDescription>
              </DialogHeader>
              {isPaymentOpen && (
                <PaymentForm
                  members={modalData.members}
                  plans={modalData.plans}
                  trainers={modalData.trainers}
                  onSuccess={() => {
                    setIsPaymentOpen(false);
                    toast.success("Pago registrado con éxito");
                    window.location.reload();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* 4. Modal Programar Clase */}
          <Dialog
            open={isClassOpen}
            onOpenChange={(open) => {
              setIsClassOpen(open);
              if (open) loadModalData();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-foreground">
                <Calendar className="size-3.5 mr-1.5 text-primary" /> Programar Clase
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Programar Clase Grupal</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Define el horario, capacidad y entrenador a cargo de la sesión.
                </DialogDescription>
              </DialogHeader>
              {isClassOpen && (
                <ClassForm
                  trainers={modalData.trainers}
                  onSuccess={() => {
                    setIsClassOpen(false);
                    toast.success("Clase programada exitosamente");
                    window.location.reload();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Priority Row: Equipment Maintenance Alerts */}
      {maintenanceAlerts.length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 backdrop-blur-md space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="size-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400">
                Alertas Urgentes de Mantenimiento ({selectedBranchName})
              </h2>
              <p className="text-xs text-rose-300/80">
                Equipos de gimnasio que requieren revisión técnica o reparación inmediata.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {maintenanceAlerts.map((item: any) => (
              <div
                key={item.id}
                className="flex flex-col justify-between p-3.5 rounded-2xl bg-zinc-950/80 border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer group shadow-md"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground group-hover:text-rose-400 transition-colors truncate">
                    {item.name}
                  </p>
                  <p className="text-[9px] uppercase font-mono text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-[8px] border-rose-500/30 text-rose-400 uppercase font-bold px-2 py-0.5"
                  >
                    {item.status === "MAINTENANCE" ? "En Reparación" : "Vencido"}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {item.serialNumber || "S/N"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Finance Chart & Membership Plan Composition */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 glass-card p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <CreditCard className="size-4" />
                <span>Análisis Financiero</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Recaudación de Ingresos</h2>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-xs font-bold px-3 py-1">
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

        <div className="lg:col-span-5 glass-card p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <PieChart className="size-4" />
                <span>Distribución Comerciales</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Planes Populares</h2>
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <RadialDonutChart data={planData} />
          </div>
        </div>
      </div>

      {/* Row 2: Attendance Trend & Live Activity Stream */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 glass-card p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <Activity className="size-4" />
                <span>Tráfico de Asistencia</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Tendencia Semanal de Accesos</h2>
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <StackedAreaChart data={weeklyData} />
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                  <Clock className="size-4" />
                  <span>Bitácora en Tiempo Real</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-foreground">Actividad Reciente</h2>
              </div>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {activityData.length > 0 ? (
                activityData.map((item: any) => {
                  const Icon = getActionIcon(item.type);
                  return (
                    <div key={item.id} className="flex items-center gap-3 group p-2.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                      <div
                        className={cn(
                          "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors font-bold",
                          item.status === "emerald"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : item.status === "primary"
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/30",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-foreground truncate capitalize">
                          {item.action.toLowerCase()}:{" "}
                          <span className="text-muted-foreground font-normal">{item.user}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase" suppressHydrationWarning>
                          Hace {formatDistanceToNow(new Date(item.date), { locale: es, addSuffix: false })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Activity className="size-8 text-primary/40 mb-2" />
                  <p className="text-xs font-bold uppercase">Sin actividad reciente</p>
                </div>
              )}
            </div>
          </div>

          <Button asChild variant="outline" className="w-full h-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-wider text-primary">
            <Link href="/audit-log">
              Ver Historial de Auditoría Completo <ChevronRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Row 3: Peak Hours Heatmap */}
      <div className="glass-card p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <Clock className="size-4" />
              <span>Monitoreo de Afluencia</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Mapa de Calor: Horas Pico de Concurrencia</h2>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Capacidad Actual ({selectedBranchName})</p>
            <p
              className={cn(
                "text-xs font-mono font-bold",
                occupancy.percentage > 80
                  ? "text-rose-400"
                  : occupancy.percentage > 50
                  ? "text-amber-400"
                  : "text-emerald-400",
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
    </div>
  );
}
