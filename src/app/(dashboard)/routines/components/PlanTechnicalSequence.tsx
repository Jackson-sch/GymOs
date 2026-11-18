"use client";

import React from "react";
import { Dumbbell, Target, Play, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlanTechnicalSequenceProps {
  exercises: any[];
  exerciseCount: number;
  onAddExercises?: () => void;
  onSimulate: () => void;
}

export function PlanTechnicalSequence({
  exercises,
  exerciseCount,
  onAddExercises,
  onSimulate,
}: PlanTechnicalSequenceProps) {
  return (
    <div className="glass-card border-border/70 dark:border-white/10 rounded-3xl flex flex-col h-full bg-card/80 dark:bg-white/[0.02] overflow-hidden backdrop-blur-md">
      <div className="p-5 sm:p-6 border-b border-border/60 dark:border-white/10 bg-muted/20 dark:bg-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
            <Target className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-serif font-bold text-foreground">
              Secuencia Técnica
            </h3>
            <p className="text-xs text-muted-foreground">
              Prescripción de cargas del plan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="text-[10px] font-bold uppercase bg-primary/10 text-primary border-primary/30"
          >
            {exerciseCount} Ejercicios
          </Badge>
          {onAddExercises && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAddExercises}
              className="h-8 px-3 rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 text-[10px] font-bold uppercase tracking-wider gap-1"
            >
              <Plus className="size-3.5" />
              Agregar
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-4 max-h-[600px]">
        {exercises.length > 0 ? (
          exercises.map((item: any, idx: number) => (
            <div
              key={item.id || item.exerciseId || item.exercise?.id || item.exercise?.name || idx}
              className="p-4 rounded-2xl bg-muted/30 dark:bg-white/5 border border-border/70 dark:border-white/10 hover:border-primary/30 transition-colors duration-300 group/ex space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-serif font-bold text-primary shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-foreground group-hover/ex:text-primary transition-colors truncate">
                      {item.exercise?.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {item.exercise?.muscleGroup || "General"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-background/80 dark:bg-black/20 border border-border/60 dark:border-white/5 text-center">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold">
                    Series
                  </p>
                  <p className="text-sm font-serif font-bold text-foreground tabular-nums">
                    {item.sets}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 dark:bg-black/20 border border-border/60 dark:border-white/5 text-center">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold">
                    Reps
                  </p>
                  <p className="text-sm font-serif font-bold text-foreground tabular-nums">
                    {item.reps}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 dark:bg-black/20 border border-border/60 dark:border-white/5 text-center">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold">
                    Descanso
                  </p>
                  <p className="text-sm font-serif font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    60s
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 dark:bg-black/20 border border-border/60 dark:border-white/5 text-center">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold">
                    Objetivo
                  </p>
                  <p className="text-sm font-serif font-bold text-amber-600 dark:text-amber-400">
                    RPE 8
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4 space-y-4">
            <div className="opacity-50">
              <Dumbbell className="size-10 mx-auto mb-3" />
              <p className="text-xs uppercase font-bold tracking-widest">
                Sin ejercicios configurados
              </p>
            </div>
            {onAddExercises && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddExercises}
                className="rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 gap-1.5 text-xs font-semibold"
              >
                <Plus className="size-3.5" />
                Añadir Ejercicios al Plan
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="p-5 bg-muted/20 dark:bg-white/[0.02] border-t border-border/60 dark:border-white/10 mt-auto">
        <Button
          onClick={onSimulate}
          disabled={!exercises.length}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <Play className="size-4 fill-current" />
          Simular Rutina Interactivamente
        </Button>
      </div>
    </div>
  );
}
