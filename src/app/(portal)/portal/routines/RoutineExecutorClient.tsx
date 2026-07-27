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
  const [timerInitial, setTimerInitial] = useState<number>(60);
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
    setTimerInitial(seconds);
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
      <div className="max-w-xl mx-auto text-center py-16 space-y-6 glass-card p-8 border-white/10">
        <div className="size-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
          <Dumbbell className="size-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold">Sin Rutinas Asignadas</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Aún no tienes rutinas de entrenamiento asignadas por tu entrenador. Pide a tu instructor que configure tu plan en la sede.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="size-3.5" />
            Entrenamiento Inteligente
          </div>
          <h1 className="text-3xl font-serif font-bold">Mis Rutinas de Ejercicio</h1>
          <p className="text-xs text-muted-foreground">
            Ejecuta tus rutinas diarias con seguimiento de series y temporizador de descanso.
          </p>
        </div>

        {activeRoutine && (
          <Button
            onClick={() => setActiveRoutine(null)}
            variant="outline"
            className="h-10 px-4 rounded-xl bg-white/5 border-white/10 text-xs font-bold"
          >
            ← Volver a Rutinas
          </Button>
        )}
      </div>

      {restSecondsLeft !== null && (
        <div className="sticky top-4 z-50 glass-card p-4 border-primary/40 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-mono font-bold text-sm">
              {restSecondsLeft}s
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Tiempo de Descanso</p>
              <p className="text-[10px] text-muted-foreground">
                {isTimerRunning ? "Descansando..." : "Descanso terminado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
            >
              {isTimerRunning ? "Pausar" : "Reanudar"}
            </button>
            <button
              onClick={() => setRestSecondsLeft(null)}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-muted-foreground hover:text-foreground font-semibold"
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
              onClick={() => setActiveRoutine(routine)}
              className="glass-card p-6 border-white/10 hover:border-primary/40 cursor-pointer transition-all space-y-4 group shadow-xl"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold">
                  {routine.category || "Hipertrofia"}
                </Badge>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                  {routine.name}
                </h3>
                {routine.description && (
                  <p className="text-xs text-muted-foreground">{routine.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/10">
                <span className="flex items-center gap-1 font-semibold">
                  <Flame className="size-4 text-amber-400" />
                  {routine.exercises?.length || 0} Ejercicios
                </span>
                <span className="text-primary font-bold flex items-center gap-1">
                  Iniciar Rutina <Play className="size-3.5 fill-primary" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/10 space-y-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold">
              Modo Entrenamiento Activo
            </Badge>
            <h2 className="text-2xl font-serif font-bold">{activeRoutine.name}</h2>
            <p className="text-xs text-muted-foreground">
              Marca las series a medida que las vayas completando para iniciar el cronómetro de descanso automático.
            </p>
          </div>

          <div className="space-y-6">
            {activeRoutine.exercises?.map((ex, exIdx) => (
              <div key={ex.id || exIdx} className="glass-card p-6 border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="size-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-primary">
                      #{exIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-serif font-bold text-base text-foreground">{ex.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {ex.sets} Series × {ex.reps} Reps
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => startRestTimer(ex.restSeconds || 60)}
                      variant="outline"
                      className="h-8 text-[11px] bg-white/5 border-white/10 gap-1.5 font-semibold"
                    >
                      <Clock className="size-3 text-primary" />
                      Descanso ({ex.restSeconds || 60}s)
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {Array.from({ length: ex.sets || 4 }).map((_, setIdx) => {
                    const setKey = `${ex.id || exIdx}_${setIdx}`;
                    const isDone = !!completedSets[setKey];
                    return (
                      <button
                        key={setIdx}
                        type="button"
                        onClick={() => toggleSetCompleted(ex.id || String(exIdx), setIdx, ex.restSeconds || 60)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          isDone
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        <span>Serie {setIdx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60">{ex.reps}</span>
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
