"use client";

import React, { useState, useEffect } from "react";
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RoutineExercise {
  id: string;
  name?: string;
  sets: number;
  reps?: string | null;
  restSeconds?: number;
  notes?: string | null;
}

interface Routine {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  exercises: any[];
}

export function RoutineExecutorClient({ routines }: { routines: Routine[] }) {
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const timerInitialRef = React.useRef<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && restSecondsLeft !== null && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restSecondsLeft === 0) {
      setIsTimerRunning(false);
      toast.success("⏰ ¡Tiempo de descanso finalizado! A darlo todo en la siguiente serie.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restSecondsLeft]);

  const startRestTimer = (seconds: number) => {
    timerInitialRef.current = seconds;
    setRestSecondsLeft(seconds);
    setIsTimerRunning(true);
    toast.info(`⏱️ Temporizador de descanso iniciado: ${seconds} segundos`);
  };

  const toggleSetCompleted = (exerciseId: string, setIndex: number, restSec = 60) => {
    const key = `${exerciseId}_${setIndex}`;
    const nextState = !completedSets[key];
    setCompletedSets((prev) => ({ ...prev, [key]: nextState }));

    if (nextState) {
      startRestTimer(restSec);
    }
  };

  if (!routines || routines.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-5 glass-card p-5 sm:p-8 border-border/70 dark:border-white/10">
        <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
          <Dumbbell className="size-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Sin Rutinas Asignadas</h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Aún no tienes rutinas de entrenamiento asignadas por tu entrenador. Pide a tu instructor que configure tu plan en la sede.
        </p>
      </div>
    );
  }

  const totalSets = activeRoutine
    ? activeRoutine.exercises?.reduce((acc, ex) => acc + (ex.sets || 4), 0) || 0
    : 0;
  const completedCount = activeRoutine
    ? activeRoutine.exercises?.reduce((acc, ex, exIdx) => {
        const count = Array.from({ length: ex.sets || 4 }).filter(
          (_, setIdx) => completedSets[`${ex.id || exIdx}_${setIdx}`]
        ).length;
        return acc + count;
      }, 0) || 0
    : 0;
  const sessionPct = totalSets > 0 ? Math.round((completedCount / totalSets) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 dark:border-white/10 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-1">
            <Sparkles className="size-3.5" />
            Entrenamiento Inteligente
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Mis Rutinas de Ejercicio</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ejecuta tus rutinas diarias con seguimiento de series y temporizador de descanso.
          </p>
        </div>

        {activeRoutine && (
          <Button
            onClick={() => setActiveRoutine(null)}
            variant="outline"
            className="h-10 px-4 rounded-xl bg-background border-border/80 hover:bg-muted text-xs font-bold self-start sm:self-auto"
          >
            ← Volver a Rutinas
          </Button>
        )}
      </div>

      {restSecondsLeft !== null && (
        <div className="sticky top-20 md:top-4 z-50 glass-card p-4 border-primary/40 bg-card/95 dark:bg-zinc-950/95 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-mono font-bold text-sm tabular-nums">
              {restSecondsLeft}s
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Tiempo de Descanso</p>
              <p className="text-[11px] text-muted-foreground">
                {isTimerRunning ? "Recuperando para la siguiente serie..." : "Descanso terminado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              {isTimerRunning ? "Pausar" : "Reanudar"}
            </button>
            <button
              type="button"
              onClick={() => setRestSecondsLeft(null)}
              className="px-3 py-2 rounded-xl bg-muted/70 dark:bg-white/10 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {!activeRoutine ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map((routine) => (
            <div
              key={routine.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
              onClick={() => setActiveRoutine(routine)}
              className="glass-card p-6 border-border/70 dark:border-white/10 hover:border-primary/40 cursor-pointer transition-colors space-y-4 group shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-[10px] uppercase font-bold">
                    {routine.category || "Plan Personalizado"}
                  </Badge>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                    {routine.name}
                  </h3>
                  {routine.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{routine.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60 dark:border-white/10">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Flame className="size-4 text-amber-500" />
                  {routine.exercises?.length || 0} Ejercicios
                </span>
                <span className="text-primary font-bold flex items-center gap-1.5">
                  Iniciar Rutina <Play className="size-3.5 fill-primary" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6 border-border/70 dark:border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-[10px] uppercase font-bold">
                  Modo Entrenamiento Activo
                </Badge>
                <h2 className="text-2xl font-serif font-bold text-foreground">{activeRoutine.name}</h2>
                <p className="text-xs text-muted-foreground">
                  Marca las series a medida que las completes para iniciar el cronómetro de descanso.
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Progreso</p>
                <p className="text-2xl font-serif font-bold text-primary tabular-nums">
                  {completedCount} / {totalSets}{" "}
                  <span className="text-xs font-sans text-muted-foreground font-semibold">series</span>
                </p>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-500"
                style={{ width: `${sessionPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-5">
            {activeRoutine.exercises?.map((ex, exIdx) => (
              <div key={ex.id || exIdx} className="glass-card p-6 border-border/70 dark:border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 dark:border-white/10 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-xs text-primary shrink-0">
                      #{exIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-serif font-bold text-base text-foreground">{ex.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {ex.sets} Series × {ex.reps} Reps
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => startRestTimer(ex.restSeconds || 60)}
                    variant="outline"
                    className="h-9 text-xs bg-background border-border/80 hover:bg-muted gap-1.5 font-semibold self-start sm:self-auto rounded-xl"
                  >
                    <Clock className="size-3.5 text-primary" />
                    Descanso ({ex.restSeconds || 60}s)
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {Array.from({ length: ex.sets || 4 }).map((_, setIdx) => {
                    const setKey = `${ex.id || exIdx}_${setIdx}`;
                    const isDone = !!completedSets[setKey];
                    return (
                      <button
                        key={setIdx}
                        type="button"
                        onClick={() => toggleSetCompleted(ex.id || String(exIdx), setIdx, ex.restSeconds || 60)}
                        className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                          isDone
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted/40 dark:bg-white/5 border-border/70 dark:border-white/10 text-foreground hover:bg-muted/70 dark:hover:bg-white/10"
                        }`}
                      >
                        <span>Serie {setIdx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">{ex.reps}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
