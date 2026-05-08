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
  User
} from "lucide-react";
import { RosenChart } from "@/components/shared/RosenChart";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function PortalClient({ data }: { data: any }) {
  const { member, membership, daysLeft, nextClass, weightHistory } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Bienvenido de nuevo</span>
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
        <div className="glass-card p-8 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard className="w-20 h-20 rotate-12" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Membresía</span>
            </div>
            <div>
              <p className="text-4xl font-sans font-light">{daysLeft} <span className="text-sm text-muted-foreground uppercase tracking-widest">Días</span></p>
              <p className="text-xs text-muted-foreground mt-1">Plan {membership?.plan?.name || "No activo"}</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next Class Card */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-20 h-20 -rotate-12" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Próxima Clase</span>
            </div>
            {nextClass ? (
              <div>
                <p className="text-2xl font-serif truncate">{nextClass.class.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(nextClass.class.startTime), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                </div>
              </div>
            ) : (
              <Link href="/portal/classes">
                <p className="text-xl font-serif text-muted-foreground">Sin reservas</p>
                <p className="text-[10px] uppercase tracking-widest mt-1 text-primary hover:underline">Reservar ahora</p>
              </Link>
            )}
          </div>
        </div>

        {/* Attendance Card */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-20 h-20" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Entrenamientos</span>
            </div>
            <div>
              <p className="text-4xl font-sans font-light">12</p>
              <p className="text-xs text-muted-foreground mt-1">Este mes (Meta: 15)</p>
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
                <TrendingUp className="w-3 h-3" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Evolución</p>
              </div>
              <h2 className="text-2xl font-serif">Tu Progreso de Peso</h2>
            </div>
          </div>
          <div className="h-[300px]">
             <RosenChart data={weightHistory} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 border-white/5 h-full">
             <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Acciones Rápidas</h3>
             <div className="space-y-3">
               {[
                 { label: "Mis Rutinas", icon: Dumbbell, color: "text-primary", href: "/portal/routines" },
                 { label: "Medidas Corporales", icon: Activity, color: "text-emerald-500", href: "/portal/progress" },
                 { label: "Mi Perfil", icon: User, href: "/portal/profile" },
               ].map((action, i) => (
                 <Link 
                  key={i} 
                  href={action.href}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group"
                 >
                   <div className="flex items-center gap-3">
                     <action.icon className={cn("w-4 h-4", action.color)} />
                     <span className="text-sm font-medium">{action.label}</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                 </Link>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
