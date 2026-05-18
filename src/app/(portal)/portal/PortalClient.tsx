"use client";

import React from "react";
import { 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Sparkles, 
  Activity,
  Clock,
  ChevronRight,
  Dumbbell,
  User,
  QrCode
} from "lucide-react";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { OnlinePaymentModal } from "@/components/shared/modals/OnlinePaymentModal";
import { toast } from "sonner";

export function PortalClient({ data }: { data: any }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment");
      if (paymentStatus === "success") {
        toast.success("¡Tu membresía se renovó exitosamente con Mercado Pago!");
      } else if (paymentStatus === "failure") {
        toast.error("El pago con Mercado Pago no pudo completarse.");
      }
    }
  }, []);

  const { member, membership, daysLeft, nextClass, plans = [] } = data;
  const weightHistory = member.bodyMetrics.map((m: any) => ({
    name: mounted ? format(new Date(m.measuredAt), "MMM d", { locale: es }) : "...",
    value: m.weight
  })).reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Bienvenido de nuevo</span>
          </div>
          <h1 className="text-5xl font-serif leading-tight">{member.fullName.split(' ')[0]}</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Tu viaje hacia la excelencia continúa. Aquí está tu estado actual.
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membership Card */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden group min-h-[260px] flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <CreditCard className="size-20 rotate-12" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2 text-primary">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <CreditCard className="size-4" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold">Membresía</span>
            </div>
            <div>
              <p className="text-4xl font-sans font-light">{daysLeft} <span className="text-sm text-muted-foreground uppercase tracking-widest">Días</span></p>
              <p className="text-xs text-muted-foreground mt-1">Plan {membership?.plan?.name || "No activo"}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 space-y-3 relative z-10">
            <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter text-muted-foreground font-semibold">
              <span>Vence: {membership && mounted ? format(new Date(membership.endDate), "d MMM", { locale: es }) : "--"}</span>
              <span className="text-primary">{Math.round((daysLeft/30)*100)}% restante</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }} 
              />
            </div>
            <div className="pt-2">
              <OnlinePaymentModal member={member} currentMembership={membership} plans={plans} />
            </div>
          </div>
        </div>

        {/* Next Class Card */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="size-20 -rotate-12" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                <Calendar className="size-4" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold">Próxima Clase</span>
            </div>
            {nextClass ? (
              <div className="space-y-1">
                <p className="text-2xl font-serif truncate leading-none">{nextClass.class.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {mounted ? format(new Date(nextClass.class.startTime), "EEEE d, HH:mm", { locale: es }) : "..."}
                </div>
              </div>
            ) : (
              <Link href="/portal/classes">
                <p className="text-xl font-serif text-muted-foreground">Sin reservas</p>
                <p className="text-[10px] uppercase tracking-widest mt-1 text-primary hover:underline">Explorar horarios</p>
              </Link>
            )}
          </div>
          {nextClass && (
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Ubicación</span>
                  <span className="text-[10px] font-semibold">{nextClass.class.location || "Sala Principal"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Estado</span>
                  <Badge variant="outline" className="text-[8px] h-4 px-1 border-emerald-500/30 text-emerald-500 uppercase font-semibold">Confirmada</Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Card */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="size-20" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Activity className="size-4" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold">Entrenamientos</span>
            </div>
            <div>
              <p className="text-4xl font-sans font-light">12</p>
              <p className="text-xs text-muted-foreground mt-1">Sesiones este mes</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 space-y-3">
             <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter text-muted-foreground font-semibold">
              <span>Meta: 15 sesiones</span>
              <span className="text-emerald-500">80% completado</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: "80%" }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-8 border-white/5">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary mb-1">
                <TrendingUp className="size-3" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Evolución</p>
              </div>
              <h2 className="text-2xl font-serif">Tu Progreso de Peso</h2>
            </div>
          </div>
          <div className="h-[450px]">
             <StackedAreaChart data={weightHistory} tooltipLabel="kg" height={400} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 border-white/5 h-full">
             <h3 className="text-sm font-semibold uppercase tracking-widest mb-6">Acciones Rápidas</h3>
             <div className="space-y-3">
                {[
                  { id: "qr", label: "Mi Tarjeta Virtual", icon: QrCode, color: "text-primary", href: "/portal/qr" },
                  { id: "routines", label: "Mis Rutinas", icon: Dumbbell, color: "text-primary", href: "/portal/routines" },
                  { id: "progress", label: "Medidas Corporales", icon: Activity, color: "text-emerald-500", href: "/portal/progress" },
                  { id: "profile", label: "Mi Perfil", icon: User, href: "/portal/profile" },
                ].map((action) => (
                  <Link 
                   key={action.id} 
                  href={action.href}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group"
                 >
                   <div className="flex items-center gap-3">
                     <action.icon className={cn("size-4", action.color)} />
                     <span className="text-sm font-medium">{action.label}</span>
                   </div>
                   <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                 </Link>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
