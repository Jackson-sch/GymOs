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
        <div className="relative w-full h-[85vh] max-h-[820px] min-h-[580px] flex flex-col bg-black/90 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-5 md:p-6 flex items-center justify-between border-b border-white/5 bg-black/40 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Activity className="size-4 animate-pulse text-emerald-400" />
                <span className="text-[10px] uppercase font-black tracking-[0.3em]">
                  Simulador de Entrenamiento
                </span>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-serif text-white leading-tight">
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border font-mono text-xs font-bold transition-colors ${
                    restTime > 0
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  <Timer className="size-3.5 animate-spin" />
                  <span>{restTime > 0 ? `${restTime}s Descanso` : "¡A Entrenar!"}</span>
                  <button type="button"
                    aria-label={isRestActive ? "Pause timer" : "Play timer"}
                    onClick={() => setIsRestActive(!isRestActive)}
                    className="p-1 hover:bg-white/10 rounded-md"
                  >
                    {isRestActive ? <Pause className="size-3" /> : <Play className="size-3" />}
                  </button>
                </div>
              )}

              <button type="button"
                aria-label="Close simulator"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-6 overflow-y-auto custom-scrollbar min-h-0">
            {/* Image / GIF or Dumbbell Icon Frame */}
            <div className="relative group scale-95 md:scale-100 shrink-0">
              <div className="absolute -inset-6 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-700 opacity-60" />

              <div className="relative size-44 sm:size-52 md:size-60 rounded-[40px] bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/15 flex items-center justify-center shadow-2xl overflow-hidden">
                {demoUrl && (demoUrl.startsWith("http") || demoUrl.startsWith("/")) ? (
                  /* Demo Image / GIF Animation */
                  <Image
                    src={demoUrl}
                    alt={exerciseName}
                    fill
                    sizes="(max-width: 768px) 176px, 240px"
                    unoptimized
                    className="object-cover rounded-[38px] group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  /* Fallback Dumbbell Icon */
                  <Dumbbell className="size-20 md:size-24 text-primary drop-shadow-lg" />
                )}
              </div>

              {/* Number Badge */}
              <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-zinc-950 border border-white/15 flex items-center justify-center font-serif text-lg font-bold text-primary shadow-xl">
                {currentIndex + 1}
              </div>
            </div>

            {/* Exercise Name & Muscle Info */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 border-primary/30 text-primary text-[10px] uppercase font-bold tracking-widest px-3 py-0.5"
                >
                  {muscleGroup}
                </Badge>
                {demoUrl && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5"
                  >
                    Guía Visual GIF
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif text-white tracking-tight leading-tight">
                {exerciseName}
              </h1>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-md mx-auto italic px-2">
                "{description}"
              </p>
            </div>

            {/* Exercise Prescription Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-xl">
              <div className="glass-card p-4 rounded-2xl border-white/10 bg-white/5 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Target className="size-3 text-primary" />
                  <span className="text-[9px] uppercase font-bold tracking-wider">
                    Series
                  </span>
                </div>
                <p className="text-2xl font-serif font-bold text-white">{sets}</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border-white/10 bg-white/5 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Timer className="size-3 text-emerald-400" />
                  <span className="text-[9px] uppercase font-bold tracking-wider">
                    Reps
                  </span>
                </div>
                <p className="text-2xl font-serif font-bold text-white">{reps}</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border-white/10 bg-white/5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => startRestTimer(60)}
                  className="w-full h-full flex flex-col items-center justify-center group"
                >
                  <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                    <Timer className="size-3 group-hover:rotate-45 transition-transform" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">
                      Descanso
                    </span>
                  </div>
                  <p className="text-2xl font-serif font-bold text-amber-400 group-hover:scale-105 transition-transform">
                    60s ⏱️
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-5 md:p-6 border-t border-white/5 bg-black/50 flex flex-col gap-5">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Progreso del Entrenamiento
                </p>
                <p className="text-xs font-serif font-bold text-primary">
                  {Math.round(progress)}% Completado
                </p>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-colors duration-500 ease-out shadow-[0_0_15px_rgba(var(--primary),0.5)]"
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
                className="h-11 rounded-2xl border-white/10 bg-white/5 px-5 gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10 disabled:opacity-20 transition-colors flex-1 sm:flex-none"
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>

              <div className="flex-1 hidden sm:flex justify-center">
                <div className="flex items-center gap-1.5">
                  {exercises.map((ex, i) => (
                    <button
                      key={ex.id || ex.exerciseId || ex.name || 'step'}
                      type="button"
                      aria-label={`Go to exercise ${i + 1}`}
                      onClick={() => {
                        setCurrentIndex(i);
                        setRestTime(null);
                      }}
                      className={cn(
                        "size-2 rounded-full transition-colors duration-300",
                        i === currentIndex ? "w-6 bg-primary" : "bg-white/20 hover:bg-white/40",
                      )}
                    />
                  ))}
                </div>
              </div>

              {currentIndex === exercises.length - 1 ? (
                <Button
                  size="lg"
                  onClick={onClose}
                  className="h-11 rounded-2xl bg-primary text-primary-foreground px-6 gap-2 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform shadow-xl shadow-primary/20 flex-1 sm:flex-none"
                >
                  Finalizar
                  <Trophy className="size-4" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="h-11 rounded-2xl bg-white text-black px-6 gap-2 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform shadow-xl shadow-white/10 flex-1 sm:flex-none"
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
