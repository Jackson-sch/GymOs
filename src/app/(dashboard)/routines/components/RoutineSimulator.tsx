"use client";

import { useState } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell, 
  Target, 
  Trophy,
  Activity,
  Timer
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
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

export function RoutineSimulator({ exercises, isOpen, onClose, planName }: RoutineSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  if (!currentExercise) return null;

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-[95vw] sm:max-w-4xl p-0! overflow-hidden bg-transparent! border-none! shadow-none! ring-0! focus-visible:outline-none"
      >
        <div className="relative w-full aspect-4/5 sm:aspect-square md:aspect-video lg:aspect-video flex flex-col bg-black/80 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Activity className="size-4 animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-[0.3em]">Sesión Activa</span>
              </div>
              <DialogTitle className="text-2xl font-serif text-white leading-tight">
                {planName}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Interfaz de simulación interactiva para el plan de entrenamiento {planName}.
              </DialogDescription>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/50 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center space-y-6 md:space-y-8">
            <div className="relative group scale-90 md:scale-100">
              <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700 opacity-50" />
              <div className="relative size-32 md:size-40 rounded-[40px] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 flex items-center justify-center shadow-2xl">
                <Dumbbell className="size-16 md:size-20 text-primary drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center font-serif text-xl font-bold text-primary shadow-xl">
                {currentIndex + 1}
              </div>
            </div>

            <div className="space-y-4 max-w-xl">
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px] uppercase font-black tracking-widest px-4 py-1">
                {currentExercise.exercise.muscleGroup || "General"}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-tight">
                {currentExercise.exercise.name}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-md mx-auto italic px-4">
                "{currentExercise.exercise.description || 'Mantén el control en cada movimiento. La técnica es más importante que el peso.'}"
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl">
              <div className="glass-card p-6 border-white/5 bg-white/5 space-y-1">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                  <Target className="size-3" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Series</span>
                </div>
                <p className="text-3xl font-serif text-white">{currentExercise.sets} <span className="text-xs font-sans text-muted-foreground italic">sets</span></p>
              </div>
              <div className="glass-card p-6 border-white/5 bg-white/5 space-y-1">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                  <Timer className="size-3" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Repeticiones</span>
                </div>
                <p className="text-3xl font-serif text-white">{currentExercise.reps} <span className="text-xs font-sans text-muted-foreground italic">movs</span></p>
              </div>
              <div className="glass-card p-6 border-white/5 bg-white/5 space-y-1 col-span-2 md:col-span-1">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                  <Trophy className="size-3" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Esfuerzo</span>
                </div>
                <p className="text-3xl font-serif text-white">RPE 8 <span className="text-xs font-sans text-muted-foreground italic">target</span></p>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 md:p-10 border-t border-white/5 bg-black/40 flex flex-col gap-6 md:gap-8">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Progreso de Rutina</p>
                <p className="text-xs font-serif text-primary">{Math.round(progress)}% Completado</p>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-6">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="h-12 md:h-14 rounded-2xl border-white/10 bg-white/5 px-4 md:px-8 gap-3 text-[10px] uppercase font-black tracking-widest hover:bg-white/10 disabled:opacity-20 transition-all flex-1 md:flex-none"
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>

              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2">
                  {exercises.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "size-1.5 rounded-full transition-all duration-300",
                        i === currentIndex ? "w-8 bg-primary" : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
              </div>

              {currentIndex === exercises.length - 1 ? (
                <Button 
                  size="lg"
                  onClick={onClose}
                  className="h-12 md:h-14 rounded-2xl bg-primary text-primary-foreground px-6 md:px-10 gap-3 text-[10px] uppercase font-black tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex-1 md:flex-none"
                >
                  Finalizar
                  <Trophy className="size-4" />
                </Button>
              ) : (
                <Button 
                  size="lg"
                  onClick={handleNext}
                  className="h-12 md:h-14 rounded-2xl bg-white text-black px-6 md:px-10 gap-3 text-[10px] uppercase font-black tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10 flex-1 md:flex-none"
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
