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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Sparkles className="size-3.5" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold">Bienvenido de nuevo</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif leading-tight tracking-tight text-foreground">
            Hola, {member.fullName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground font-sans max-w-md">
            Tu viaje hacia la excelencia continúa. Aquí tienes el resumen de tu actividad y membresía.
          </p>
        </div>

        <Link
          href="/portal/qr"
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors self-start sm:self-auto shrink-0"
        >
          <QrCode className="size-4" />
          Mostrar Pase QR
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membership Card */}
        <div className="glass-card p-7 border-border/70 dark:border-white/10 relative overflow-hidden group flex flex-col justify-between space-y-5 h-full">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none">
            <CreditCard className="size-24 rotate-12" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <CreditCard className="size-4" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold">Membresía</span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] uppercase font-bold",
                  daysLeft > 5
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                )}
              >
                {membership ? "Activa" : "Sin plan"}
              </Badge>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-serif font-bold tabular-nums text-foreground">
                {daysLeft}{" "}
                <span className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-widest">
                  Días restantes
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Plan <span className="font-semibold text-foreground">{membership?.plan?.name || "No activo"}</span>
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-border/60 dark:border-white/10 space-y-3 relative z-10">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <span>Vence: {membership && mounted ? format(new Date(membership.endDate), "d MMM", { locale: es }) : "--"}</span>
              <span className="text-primary font-bold tabular-nums">{Math.min(100, Math.round((daysLeft / 30) * 100))}%</span>
            </div>
            <div className="w-full h-2 bg-muted dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-700"
                style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
              />
            </div>
            <div className="pt-1">
              <OnlinePaymentModal member={member} currentMembership={membership} plans={plans} />
            </div>
          </div>
        </div>

        {/* Next Class Card */}
        <div className="glass-card p-7 border-border/70 dark:border-white/10 relative overflow-hidden group flex flex-col justify-between space-y-5 h-full">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none">
            <Calendar className="size-24 -rotate-12" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Calendar className="size-4" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Próxima Clase</span>
            </div>
            {nextClass ? (
              <div className="space-y-1.5">
                <p className="text-2xl font-serif font-bold truncate leading-tight text-foreground">
                  {nextClass.class.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5 text-primary" />
                  <span className="capitalize">
                    {mounted ? format(new Date(nextClass.class.startTime), "EEEE d, HH:mm", { locale: es }) : "..."}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-2xl font-serif text-muted-foreground">Sin reservas</p>
                <p className="text-xs text-muted-foreground">Reserva tu lugar en las clases grupales de hoy.</p>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-border/60 dark:border-white/10 relative z-10">
            {nextClass ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Ubicación</span>
                  <span className="text-xs font-semibold text-foreground">{nextClass.class.location || "Sala Principal"}</span>
                </div>
                <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                  Confirmada
                </Badge>
              </div>
            ) : (
              <Link
                href="/portal/classes"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
              >
                Explorar horarios <ChevronRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Attendance Card */}
        <div className="glass-card p-7 border-border/70 dark:border-white/10 relative overflow-hidden group flex flex-col justify-between space-y-5 h-full">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none">
            <Activity className="size-24" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
              <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Activity className="size-4" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Entrenamientos</span>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-serif font-bold tabular-nums text-foreground">
                12{" "}
                <span className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-widest">
                  Sesiones
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Registradas este mes</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border/60 dark:border-white/10 space-y-3 relative z-10">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <span>Meta: 15 sesiones</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">80%</span>
            </div>
            <div className="w-full h-2 bg-muted dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-[width] duration-700"
                style={{ width: "80%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 border-border/70 dark:border-white/10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-2 text-primary mb-1">
                <TrendingUp className="size-3.5" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Evolución Corporal</p>
              </div>
              <h2 className="text-2xl font-serif text-foreground">Tu Progreso de Peso</h2>
            </div>
            <Link
              href="/portal/progress"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Ver detalle <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="h-[360px] sm:h-[420px]">
            {weightHistory.length > 0 ? (
              <StackedAreaChart data={weightHistory} tooltipLabel="kg" height={360} />
            ) : (
              <div className="h-full rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <TrendingUp className="size-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">Aún no hay registros de peso</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Cuando tu entrenador registre tus mediciones corporales, verás tu evolución aquí.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="glass-card p-6 sm:p-8 border-border/70 dark:border-white/10 h-full flex flex-col">
            <div className="mb-6">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Atajos</p>
              <h3 className="text-xl font-serif text-foreground">Acciones Rápidas</h3>
            </div>
            <div className="space-y-3 flex-1">
              {[
                { id: "qr", label: "Mi Tarjeta Virtual", desc: "Acceso QR dinámico", icon: QrCode, color: "text-primary bg-primary/10 border-primary/20", href: "/portal/qr" },
                { id: "routines", label: "Mis Rutinas", desc: "Ejercicios y temporizador", icon: Dumbbell, color: "text-primary bg-primary/10 border-primary/20", href: "/portal/routines" },
                { id: "classes", label: "Reservar Clases", desc: "Horarios y cupos en vivo", icon: Calendar, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20", href: "/portal/classes" },
                { id: "progress", label: "Medidas Corporales", desc: "Peso, grasa y asistencias", icon: Activity, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20", href: "/portal/progress" },
                { id: "profile", label: "Mi Perfil", desc: "Datos y contacto", icon: User, color: "text-foreground bg-muted border-border", href: "/portal/profile" },
              ].map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className="w-full p-3.5 rounded-2xl bg-muted/30 dark:bg-white/[0.04] border border-border/70 dark:border-white/10 hover:border-primary/40 hover:bg-muted/60 dark:hover:bg-white/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={cn("size-10 rounded-xl border flex items-center justify-center shrink-0", action.color)}>
                      <action.icon className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{action.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{action.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
