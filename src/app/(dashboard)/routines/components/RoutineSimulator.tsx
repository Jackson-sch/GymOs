"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Target,
  Trophy,
  Activity,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Video,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoutineSimulatorProps {
  exercises: any[];
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export function RoutineSimulator({
  exercises,
  isOpen,
  onClose,
  planName,
}: RoutineSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [restTime, setRestTime] = useState<number | null>(null);
  const [isRestActive, setIsRestActive] = useState(false);

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setCurrentIndex(0);
      setRestTime(null);
      setIsRestActive(false);
    }
  }

  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isRestActive && restTime !== null && restTime > 0) {
      interval = setInterval(() => {
        setRestTime((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restTime === 0) {
      setIsRestActive(false);
    }
    return () => clearInterval(interval);
  }, [isRestActive, restTime]);

  if (!currentExercise) return null;

  // Extract properties safely regardless of data structure
  const ex = currentExercise.exercise || currentExercise;
  const exerciseName = ex.name || "Ejercicio";
  const muscleGroup = ex.muscleGroup || "General";
  const description =
    ex.description ||
    "Mantén el control en cada movimiento. La técnica es más importante que la carga.";
  const demoUrl = ex.demoUrl || ex.videoUrl || null;
  const sets = currentExercise.sets || 3;
  const reps = currentExercise.reps || "12";

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRestTime(null);
      setIsRestActive(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setRestTime(null);
      setIsRestActive(false);
    }
  };

  const startRestTimer = (seconds: number = 60) => {
    setRestTime(seconds);
    setIsRestActive(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[95vw] sm:max-w-4xl p-0! overflow-hidden bg-transparent! border-none! shadow-none! ring-0! focus-visible:outline-none"
      >
        <div className="relative w-full h-[85vh] max-h-[820px] min-h-[580px] flex flex-col bg-background/95 dark:bg-zinc-950/95 backdrop-blur-3xl rounded-[28px] md:rounded-[36px] border border-border/80 dark:border-white/10 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-border/60 bg-muted/30 dark:bg-white/[0.02] shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Activity className="size-4 animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-[0.25em]">
                  Simulador de Entrenamiento
                </span>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-serif text-foreground leading-tight">
                {planName}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Interfaz de simulación interactiva para el plan {planName}.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-3">
              {/* Rest Timer Widget */}
              {restTime !== null && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-2xl border font-mono text-xs font-bold transition-colors",
                    restTime > 0
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  )}
                >
                  <Timer className={cn("size-3.5", isRestActive && restTime > 0 && "animate-spin")} />
                  <span>{restTime > 0 ? `${restTime}s Descanso` : "¡A Entrenar!"}</span>
                  <button
                    type="button"
                    aria-label={isRestActive ? "Pause timer" : "Play timer"}
                    onClick={() => setIsRestActive(!isRestActive)}
                    className="p-1 hover:bg-foreground/10 rounded-md transition-colors"
                  >
                    {isRestActive ? <Pause className="size-3" /> : <Play className="size-3" />}
                  </button>
                </div>
              )}

              <button
                type="button"
                aria-label="Close simulator"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-background/80 border border-border/80 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shadow-xs"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-6 overflow-y-auto custom-scrollbar min-h-0">
            {/* Image / GIF or Dumbbell Icon Frame */}
            <div className="relative group scale-95 md:scale-100 shrink-0">
              <div className="absolute -inset-6 bg-primary/15 rounded-full blur-3xl group-hover:bg-primary/25 transition-colors duration-700 opacity-70" />

              <div className="relative size-40 sm:size-48 md:size-56 rounded-[32px] bg-linear-to-br from-primary/10 via-muted/50 to-background dark:from-white/10 dark:via-white/5 dark:to-transparent border border-border/80 dark:border-white/15 flex items-center justify-center shadow-xl overflow-hidden">
                {demoUrl && (demoUrl.startsWith("http") || demoUrl.startsWith("/")) ? (
                  /* Demo Image / GIF Animation */
                  <Image
                    src={demoUrl}
                    alt={exerciseName}
                    fill
                    sizes="(max-width: 768px) 160px, 224px"
                    unoptimized
                    className="object-cover rounded-[30px] group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  /* Fallback Dumbbell Icon */
                  <Dumbbell className="size-20 md:size-24 text-primary drop-shadow-sm" />
                )}
              </div>

              {/* Number Badge */}
              <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-primary text-primary-foreground border-2 border-background flex items-center justify-center font-serif text-base font-bold shadow-lg tabular-nums">
                {currentIndex + 1}
              </div>
            </div>

            {/* Exercise Name & Muscle Info */}
            <div className="space-y-2.5 max-w-xl">
              <div className="flex items-center justify-center flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 border-primary/30 text-primary text-[10px] uppercase font-bold tracking-widest px-3 py-0.5"
                >
                  {muscleGroup}
                </Badge>
                {currentExercise.day && (
                  <Badge
                    variant="outline"
                    className="bg-muted/60 border-border text-muted-foreground text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5"
                  >
                    {currentExercise.day}
                  </Badge>
                )}
                {demoUrl && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5"
                  >
                    Guía Visual GIF
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif text-foreground tracking-tight leading-tight">
                {exerciseName}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md mx-auto italic px-2">
                &ldquo;{currentExercise.notes || description}&rdquo;
              </p>
            </div>

            {/* Exercise Prescription Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-xl">
              <div className="p-4 rounded-2xl bg-card dark:bg-white/[0.04] border border-border/80 dark:border-white/10 shadow-xs space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Target className="size-3.5 text-primary" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Series
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground tabular-nums">
                  {sets}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card dark:bg-white/[0.04] border border-border/80 dark:border-white/10 shadow-xs space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Activity className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Reps
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground tabular-nums">
                  {reps}
                </p>
              </div>

              <button
                type="button"
                onClick={() => startRestTimer(60)}
                className="p-4 rounded-2xl bg-card dark:bg-white/[0.04] border border-border/80 dark:border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 shadow-xs space-y-1 flex flex-col items-center justify-center group transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Timer className="size-3.5 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Descanso
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  60s
                </p>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-5 border-t border-border/60 bg-muted/30 dark:bg-white/[0.02] flex flex-col gap-4 shrink-0">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Progreso del Entrenamiento ({currentIndex + 1} de {exercises.length})
                </p>
                <p className="text-xs font-serif font-bold text-primary tabular-nums">
                  {Math.round(progress)}% Completado
                </p>
              </div>
              <div className="h-2 w-full bg-muted dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="h-11 rounded-xl border-border/80 bg-background hover:bg-muted text-foreground px-5 gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-35 transition-colors flex-1 sm:flex-none"
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>

              <div className="flex-1 hidden sm:flex justify-center">
                <div className="flex items-center gap-1.5">
                  {exercises.map((ex, i) => (
                    <button
                      key={`${ex.id || ex.exerciseId || ex.name || "step"}-${i}`}
                      type="button"
                      aria-label={`Go to exercise ${i + 1}`}
                      onClick={() => {
                        setCurrentIndex(i);
                        setRestTime(null);
                        setIsRestActive(false);
                      }}
                      className={cn(
                        "h-2 rounded-full transition-colors duration-300",
                        i === currentIndex
                          ? "w-6 bg-primary"
                          : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>
              </div>

              {currentIndex === exercises.length - 1 ? (
                <Button
                  size="lg"
                  onClick={onClose}
                  className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 gap-2 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-primary/20 flex-1 sm:flex-none"
                >
                  Finalizar
                  <Trophy className="size-4" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 gap-2 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-primary/20 flex-1 sm:flex-none"
                >
                  Siguiente
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
