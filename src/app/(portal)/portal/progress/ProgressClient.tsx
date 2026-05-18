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
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ProgressClientProps {
  initialData: any;
}

export function ProgressClient({ initialData }: ProgressClientProps) {
  const { bodyMetrics, attendances, workoutLogs } = initialData;

  const latest = bodyMetrics[0] || {};
  const previous = bodyMetrics[1] || {};

  const getChange = (current: number, prev: number) => {
    if (!prev) return null;
    const diff = current - prev;
    return {
      value: Math.abs(diff).toFixed(1),
      isIncrease: diff > 0,
      color: diff > 0 ? "text-red-500" : "text-green-500"
    };
  };

  const weightChange = getChange(latest.weight, previous.weight);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div>
        <h1 className="text-4xl font-serif tracking-tight mb-2">Mi Progreso</h1>
        <p className="text-muted-foreground">Monitorea tus cambios físicos y actividad de entrenamiento</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Weight className="w-5 h-5 text-blue-500" />
            </div>
            {weightChange && (
              <span className={cn("text-xs font-bold px-2 py-1 rounded-full bg-white/5", weightChange.color)}>
                {weightChange.isIncrease ? "+" : "-"}{weightChange.value} kg
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Peso Actual</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif">{latest.weight || "--"}</span>
            <span className="text-muted-foreground text-sm font-medium">kg</span>
          </div>
        </div>

        <div className="glass-card p-6 border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Grasa Corporal</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif">{latest.bodyFat || "--"}</span>
            <span className="text-muted-foreground text-sm font-medium">%</span>
          </div>
        </div>

        <div className="glass-card p-6 border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
              <Target className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Entrenamientos (Mes)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif">{workoutLogs.length}</span>
            <span className="text-muted-foreground text-sm font-medium">sesiones</span>
          </div>
        </div>

        <div className="glass-card p-6 border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Asistencias (Mes)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif">{attendances.length}</span>
            <span className="text-muted-foreground text-sm font-medium">clases</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <div className="glass-card p-8 border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-serif flex items-center gap-3">
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
              <div className="h-[200px] flex items-center justify-center text-muted-foreground italic">
                Sin datos suficientes para graficar
              </div>
            )}
          </div>
        </div>

        {/* Workout History List */}
        <div className="glass-card p-8 border-white/5">
          <h2 className="text-xl font-serif flex items-center gap-3 mb-8">
            <Dumbbell className="w-5 h-5 text-primary" />
            Historial de Entrenamiento
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {workoutLogs.length > 0 ? (
              workoutLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{format(parseISO(log.date), "d 'de' MMMM", { locale: es })}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{format(parseISO(log.date), "yyyy")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-serif">
                      {log._count?.exercises || 0} Ejercicios
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground italic">
                Aún no has registrado entrenamientos
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Measurements List */}
        <div className="glass-card p-8 border-white/5">
          <h2 className="text-xl font-serif flex items-center gap-3 mb-8">
            <Scale className="w-5 h-5 text-primary" />
            Historial de Medidas
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {bodyMetrics.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{format(parseISO(m.measuredAt), "d 'de' MMMM", { locale: es })}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{format(parseISO(m.measuredAt), "yyyy")}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-sm font-bold">{m.weight} kg</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Peso</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{m.bodyFat}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Grasa</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Log */}
        <div className="glass-card p-8 border-white/5">
          <h2 className="text-xl font-serif flex items-center gap-3 mb-8">
            <Activity className="w-5 h-5 text-primary" />
            Registro de Asistencia
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {attendances.map((a: any) => (
              <div key={a.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{format(parseISO(a.checkIn), "EEEE d 'de' MMMM", { locale: es })}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Entrada: {format(parseISO(a.checkIn), "HH:mm")}</span>
                    {a.checkOut && (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Salida: {format(parseISO(a.checkOut), "HH:mm")}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Progress Gallery */}
      <div className="glass-card p-8 border-white/5 mt-8">
        <h2 className="text-xl font-serif flex items-center gap-3 mb-8">
          <Camera className="w-5 h-5 text-primary" />
          Galería de Progreso Visual
        </h2>
        {bodyMetrics.filter((m: any) => m.photoFrontUrl || m.photoBackUrl || m.photoSideUrl).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bodyMetrics.filter((m: any) => m.photoFrontUrl || m.photoBackUrl || m.photoSideUrl).map((metric: any) => (
              <div key={metric.id} className="glass-card p-4 border-white/5 flex flex-col gap-3 bg-white/5">
                <div className="flex justify-between items-center text-xs font-bold px-2 py-1 bg-black/40 rounded-lg">
                  <span>{format(parseISO(metric.measuredAt), "dd MMM yyyy", { locale: es })}</span>
                  <span className="text-primary">{metric.weight ? `${metric.weight} kg` : ""}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {metric.photoFrontUrl ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                      <Image src={metric.photoFrontUrl} alt="Frontal" fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-primary">Frontal</div>
                    </div>
                  ) : <div className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-widest border border-dashed border-white/10">Sin Frontal</div>}
                  {metric.photoBackUrl ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                      <Image src={metric.photoBackUrl} alt="Espalda" fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-primary">Espalda</div>
                    </div>
                  ) : <div className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-widest border border-dashed border-white/10">Sin Espalda</div>}
                  {metric.photoSideUrl ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                      <Image src={metric.photoSideUrl} alt="Perfil" fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-primary">Perfil</div>
                    </div>
                  ) : <div className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-widest border border-dashed border-white/10">Sin Perfil</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-40 border-2 border-dashed border-white/10 rounded-2xl bg-background/30">
            <Camera className="w-12 h-12 mb-4 text-muted-foreground" />
            <p className="text-sm font-bold uppercase tracking-widest">Sin fotos de progreso registradas</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">Tus fotos corporales subidas en cada medición se mostrarán aquí para evaluar tu transformación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
