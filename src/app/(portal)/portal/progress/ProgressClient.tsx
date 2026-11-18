"use client";

import React from "react";
import { 
  TrendingUp, 
  Weight, 
  Activity, 
  Calendar,
  ChevronRight,
  Target,
  Scale,
  CheckCircle2,
  Dumbbell,
  Clock,
  Camera
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { cn } from "@/lib/utils";

const getChange = (current: number, prev: number) => {
  if (!prev) return null;
  const diff = current - prev;
  return {
    value: Math.abs(diff).toFixed(1),
    isIncrease: diff > 0,
    color: diff > 0 ? "text-red-500" : "text-green-500"
  };
};
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ProgressClientProps {
  initialData: any;
}

export function ProgressClient({ initialData }: ProgressClientProps) {
  const { bodyMetrics, attendances, workoutLogs } = initialData;

  const latest = bodyMetrics[0] || {};
  const previous = bodyMetrics[1] || {};

  const weightChange = getChange(latest.weight, previous.weight);

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      <div className="space-y-1.5 border-b border-border/60 dark:border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest">
          <TrendingUp className="size-3.5" />
          Evolución Física
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-foreground">Mi Progreso</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Monitorea tus cambios físicos y actividad de entrenamiento</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 border-border/70 dark:border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Weight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            {weightChange && (
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full bg-muted dark:bg-white/5 tabular-nums", weightChange.color)}>
                {weightChange.isIncrease ? "+" : "-"}{weightChange.value} kg
              </span>
            )}
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Peso Actual</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold tabular-nums text-foreground">{latest.weight || "--"}</span>
            <span className="text-muted-foreground text-sm font-medium">kg</span>
          </div>
        </div>

        <div className="glass-card p-6 border-border/70 dark:border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Grasa Corporal</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold tabular-nums text-foreground">{latest.bodyFat || "--"}</span>
            <span className="text-muted-foreground text-sm font-medium">%</span>
          </div>
        </div>

        <div className="glass-card p-6 border-border/70 dark:border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Entrenamientos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold tabular-nums text-foreground">{workoutLogs.length}</span>
            <span className="text-muted-foreground text-sm font-medium">sesiones</span>
          </div>
        </div>

        <div className="glass-card p-6 border-border/70 dark:border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Asistencias</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold tabular-nums text-foreground">{attendances.length}</span>
            <span className="text-muted-foreground text-sm font-medium">visitas</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <div className="glass-card p-6 sm:p-8 border-border/70 dark:border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif flex items-center gap-3 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolución de Peso
            </h2>
          </div>
          <div className="w-full">
            {bodyMetrics.length > 0 ? (
              <StackedAreaChart 
                data={bodyMetrics.map((m: any) => ({
                  name: format(parseISO(m.measuredAt), "d MMM", { locale: es }) + ` (${m.id.substring(0, 3)})`,
                  value: m.weight
                })).reverse()} 
              />
            ) : (
              <div className="h-[220px] rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground italic">
                Sin datos suficientes para graficar
              </div>
            )}
          </div>
        </div>

        {/* Workout History List */}
        <div className="glass-card p-6 sm:p-8 border-border/70 dark:border-white/10">
          <h2 className="text-xl font-serif flex items-center gap-3 mb-6 text-foreground">
            <Dumbbell className="w-5 h-5 text-primary" />
            Historial de Entrenamiento
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {workoutLogs.length > 0 ? (
              workoutLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 dark:bg-white/[0.04] border border-border/70 dark:border-white/10 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{format(parseISO(log.date), "d 'de' MMMM", { locale: es })}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{format(parseISO(log.date), "yyyy")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 font-serif">
                      {log._count?.exercises || 0} Ejercicios
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 text-xs text-muted-foreground italic">
                Aún no has registrado entrenamientos
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Measurements List */}
        <div className="glass-card p-6 sm:p-8 border-border/70 dark:border-white/10">
          <h2 className="text-xl font-serif flex items-center gap-3 mb-6 text-foreground">
            <Scale className="w-5 h-5 text-primary" />
            Historial de Medidas
          </h2>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {bodyMetrics.length > 0 ? (
              bodyMetrics.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 dark:bg-white/[0.04] border border-border/70 dark:border-white/10 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-background dark:bg-white/5 p-2 rounded-xl border border-border/70 dark:border-white/10">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{format(parseISO(m.measuredAt), "d 'de' MMMM", { locale: es })}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{format(parseISO(m.measuredAt), "yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div>
                      <p className="text-sm font-bold text-foreground tabular-nums">{m.weight} kg</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Peso</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground tabular-nums">{m.bodyFat}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Grasa</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 text-xs text-muted-foreground italic">
                Aún no hay mediciones corporales registradas
              </div>
            )}
          </div>
        </div>

        {/* Attendance Log */}
        <div className="glass-card p-6 sm:p-8 border-border/70 dark:border-white/10">
          <h2 className="text-xl font-serif flex items-center gap-3 mb-6 text-foreground">
            <Activity className="w-5 h-5 text-primary" />
            Registro de Asistencia
          </h2>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {attendances.length > 0 ? (
              attendances.map((a: any) => (
                <div key={a.id} className="p-4 rounded-2xl bg-muted/40 dark:bg-white/[0.04] border border-border/70 dark:border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground capitalize truncate">{format(parseISO(a.checkIn), "EEEE d 'de' MMMM", { locale: es })}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Entrada: {format(parseISO(a.checkIn), "HH:mm")}</span>
                      {a.checkOut && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Salida: {format(parseISO(a.checkOut), "HH:mm")}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 text-xs text-muted-foreground italic">
                No tienes asistencias registradas este mes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Progress Gallery */}
      <div className="glass-card p-6 sm:p-8 border-border/70 dark:border-white/10">
        <h2 className="text-xl font-serif flex items-center gap-3 mb-6 text-foreground">
          <Camera className="w-5 h-5 text-primary" />
          Galería de Progreso Visual
        </h2>
        {bodyMetrics.some((m: any) => m.photoFrontUrl || m.photoBackUrl || m.photoSideUrl) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bodyMetrics.flatMap((metric: any) => {
              if (!(metric.photoFrontUrl || metric.photoBackUrl || metric.photoSideUrl)) return [];
              return [
              <div key={metric.id} className="p-4 rounded-2xl border border-border/70 dark:border-white/10 flex flex-col gap-3 bg-muted/30 dark:bg-white/[0.04]">
                <div className="flex justify-between items-center text-xs font-bold px-3 py-1.5 bg-background dark:bg-black/40 border border-border/60 rounded-xl">
                  <span className="text-foreground">{format(parseISO(metric.measuredAt), "dd MMM yyyy", { locale: es })}</span>
                  <span className="text-primary">{metric.weight ? `${metric.weight} kg` : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {metric.photoFrontUrl ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/70 group">
                      <Image src={metric.photoFrontUrl} alt="Frontal" fill sizes="(max-width: 768px) 33vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-white">Frontal</div>
                    </div>
                  ) : <div className="aspect-square bg-muted/40 rounded-xl flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-widest border border-dashed border-border/70">Sin Frontal</div>}
                  {metric.photoBackUrl ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/70 group">
                      <Image src={metric.photoBackUrl} alt="Espalda" fill sizes="(max-width: 768px) 33vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-white">Espalda</div>
                    </div>
                  ) : <div className="aspect-square bg-muted/40 rounded-xl flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-widest border border-dashed border-border/70">Sin Espalda</div>}
                  {metric.photoSideUrl ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/70 group">
                      <Image src={metric.photoSideUrl} alt="Perfil" fill sizes="(max-width: 768px) 33vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-white">Perfil</div>
                    </div>
                  ) : <div className="aspect-square bg-muted/40 rounded-xl flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-widest border border-dashed border-border/70">Sin Perfil</div>}
                </div>
              </div>
              ];
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/70 rounded-2xl bg-muted/20">
            <Camera className="w-10 h-10 mb-3 text-muted-foreground/50" />
            <p className="text-sm font-bold uppercase tracking-widest text-foreground/70">Sin fotos de progreso registradas</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">Tus fotos corporales subidas en cada medición se mostrarán aquí para evaluar tu transformación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
