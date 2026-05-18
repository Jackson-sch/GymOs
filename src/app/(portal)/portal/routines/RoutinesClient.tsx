"use client";

import React, { useState } from "react";
import { 
  Dumbbell, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Activity, 
  Info,
  ChevronDown,
  PlayCircle,
  CheckCircle2,
  Circle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toggleExerciseCompletionAction } from "@/lib/actions/routine-actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface RoutinesClientProps {
  initialData: any[];
  todayCompletions: any[];
}

export function RoutinesClient({ initialData, todayCompletions }: RoutinesClientProps) {
  const [selectedRoutine, setSelectedRoutine] = useState(initialData[0] || null);
  const [completedLogs, setCompletedLogs] = useState<any[]>(todayCompletions);
  const [isLogging, setIsLogging] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { weight: string, reps: string }>>({});
  
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    "Lunes": true,
    "Martes": true,
    "Miércoles": true,
    "Jueves": true,
    "Viernes": true,
    "Sábado": true,
    "Domingo": true,
  });

  if (initialData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Dumbbell className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-serif mb-2">Sin Rutinas Asignadas</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Aún no tienes rutinas de entrenamiento asignadas. Consulta con tu entrenador para comenzar tu plan personalizado.
        </p>
      </div>
    );
  }

  const toggleDay = (day: string) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleToggleExercise = async (routineExerciseId: string, weight?: string, reps?: string) => {
    if (isLogging) return;
    
    const existingLog = completedLogs.find(l => l.routineExerciseId === routineExerciseId);
    const isCompleted = !!existingLog;
    setIsLogging(routineExerciseId);
    
    try {
      const result = await toggleExerciseCompletionAction(
        selectedRoutine.id, 
        routineExerciseId, 
        !isCompleted,
        weight,
        reps
      );
      
      if (result.success) {
        if (isCompleted) {
          setCompletedLogs(prev => prev.filter(l => l.routineExerciseId !== routineExerciseId));
          toast.success("Ejercicio desmarcado");
        } else {
          // Note: In a real app we'd get the new log ID back, but for UI we can fake it or revalidate
          setCompletedLogs(prev => [...prev, { 
            routineExerciseId, 
            completed: true,
            weightUsed: weight,
            repsDone: reps
          }]);
          toast.success("¡Ejercicio completado!");
        }
      } else {
        toast.error("Error al guardar progreso");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsLogging(null);
    }
  };

  const handleUpdateLogs = async (routineExerciseId: string) => {
    const vals = editValues[routineExerciseId];
    if (!vals) return;
    await handleToggleExercise(routineExerciseId, vals.weight, vals.reps);
    // Clear edit state
    setEditValues(prev => {
      const next = { ...prev };
      delete next[routineExerciseId];
      return next;
    });
  };

  // Group exercises by day
  const groupedExercises = selectedRoutine?.exercises.reduce((acc: any, curr: any) => {
    const day = curr.day || "General";
    if (!acc[day]) acc[day] = [];
    acc[day].push(curr);
    return acc;
  }, {}) || {};

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "General"];
  const activeDays = days.filter(d => groupedExercises[d] && groupedExercises[d].length > 0);

  // Calculate completion percentage for the active routine today
  const totalExercises = selectedRoutine?.exercises.length || 0;
  const completedInRoutine = selectedRoutine?.exercises.filter((ex: any) => 
    completedLogs.some(l => l.routineExerciseId === ex.id)
  ).length || 0;
  const completionPercentage = totalExercises > 0 ? Math.round((completedInRoutine / totalExercises) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif tracking-tight mb-2">Mis Rutinas</h1>
          <p className="text-muted-foreground font-sans">Sigue tu plan de entrenamiento personalizado</p>
        </div>

        {initialData.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {initialData.map((routine) => (
              <button
                key={routine.id}
                onClick={() => setSelectedRoutine(routine)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
                  selectedRoutine.id === routine.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
                )}
              >
                {routine.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Routine Info & Trainer */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Dumbbell className="w-32 h-32 rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div>
                <Badge className="bg-primary/20 text-primary border-none mb-4 uppercase tracking-tighter text-[10px]">Plan Activo</Badge>
                <h2 className="text-3xl font-serif mb-2">{selectedRoutine.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedRoutine.description || "Tu plan personalizado para alcanzar tus objetivos."}
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progreso de hoy</p>
                  <p className="text-sm font-serif text-primary">{completionPercentage}%</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <Avatar className="w-12 h-12 border border-white/10">
                  <AvatarImage src={selectedRoutine.trainer?.photo || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {selectedRoutine.trainer?.fullName?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Entrenador</p>
                  <p className="text-sm font-semibold">{selectedRoutine.trainer?.fullName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Inicio</p>
                  <p className="text-sm font-medium">{format(new Date(selectedRoutine.startDate), "d MMM, yyyy", { locale: es })}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Ejercicios</p>
                  <p className="text-sm font-medium">{selectedRoutine.exercises.length} totales</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 bg-primary/5">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-bold mb-1">Recomendación</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Marca los ejercicios completados para llevar un registro de tu progreso. ¡La constancia es la clave!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Exercises list */}
        <div className="lg:col-span-8 space-y-6">
          {activeDays.map((day) => (
            <div key={day} className="space-y-4">
              <button 
                onClick={() => toggleDay(day)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                    expandedDays[day] ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
                  )}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-serif">{day}</h3>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                    {groupedExercises[day].length} ejercicios
                  </Badge>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", expandedDays[day] && "rotate-180")} />
              </button>

              {expandedDays[day] && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    {groupedExercises[day].map((item: any, idx: number) => {
                      const log = completedLogs.find(l => l.routineExerciseId === item.id);
                      const isCompleted = !!log;
                      const isLoading = isLogging === item.id;
                      const isEditing = !!editValues[item.id];
                      
                      return (
                        <div 
                          key={item.id} 
                          className={cn(
                            "glass-card p-6 border-white/5 transition-all group relative overflow-hidden",
                            isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "hover:border-primary/20"
                          )}
                        >
                          {/* Background indicator for completion */}
                          {isCompleted && (
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                              <CheckCircle2 className="w-24 h-24 text-emerald-500 -mr-4 -mt-4 rotate-12" />
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-5">
                              <button 
                                onClick={() => handleToggleExercise(item.id)}
                                disabled={isLoading}
                                className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                                  isCompleted 
                                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" 
                                    : "bg-white/5 border-white/5 text-muted-foreground hover:border-primary/30 hover:text-primary"
                                )}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-6 h-6 animate-spin" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                  <Circle className="w-6 h-6" />
                                )}
                              </button>
                              <div>
                                <h4 className={cn(
                                  "text-lg font-serif mb-1 transition-colors",
                                  isCompleted ? "text-emerald-500" : "group-hover:text-primary"
                                )}>
                                  {item.exercise.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                                    <Activity className="w-3 h-3 text-primary" />
                                    {item.exercise.muscleGroup || "General"}
                                  </div>
                                  {item.exercise.equipment && (
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                                      <Dumbbell className="w-3 h-3 text-accent" />
                                      {item.exercise.equipment}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 md:gap-8 md:text-right">
                              <div className="space-y-1">
                                <p className="text-xl font-sans font-light">{item.sets} <span className="text-[10px] uppercase text-muted-foreground tracking-widest">Series</span></p>
                                <p className="text-sm font-medium">{item.reps} <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-normal">Reps</span></p>
                              </div>
                              
                              <div className="w-px h-10 bg-white/5 hidden md:block" />
                              
                              <div className="space-y-2 min-w-[120px]">
                                {isEditing ? (
                                  <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="space-y-1">
                                      <Input 
                                        className="h-8 w-16 text-xs bg-white/10 border-white/10 p-1 text-center"
                                        placeholder="Kg"
                                        value={editValues[item.id]?.weight || ""}
                                        onChange={(e) => setEditValues(prev => ({ 
                                          ...prev, 
                                          [item.id]: { ...prev[item.id], weight: e.target.value } 
                                        }))}
                                      />
                                      <Input 
                                        className="h-8 w-16 text-xs bg-white/10 border-white/10 p-1 text-center"
                                        placeholder="Reps"
                                        value={editValues[item.id]?.reps || ""}
                                        onChange={(e) => setEditValues(prev => ({ 
                                          ...prev, 
                                          [item.id]: { ...prev[item.id], reps: e.target.value } 
                                        }))}
                                      />
                                    </div>
                                    <Button 
                                      size="icon" 
                                      className="size-8 rounded-lg bg-primary text-primary-foreground"
                                      onClick={() => handleUpdateLogs(item.id)}
                                      disabled={isLoading}
                                    >
                                      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                    </Button>
                                  </div>
                                ) : (
                                  <div 
                                    className="space-y-1 cursor-pointer hover:opacity-70 transition-opacity"
                                    onClick={() => setEditValues(prev => ({ 
                                      ...prev, 
                                      [item.id]: { 
                                        weight: log?.weightUsed || item.weight || "", 
                                        reps: log?.repsDone || item.reps || "" 
                                      } 
                                    }))}
                                  >
                                    <p className="text-sm font-bold text-primary">
                                      {log?.weightUsed || item.weight || "0 kg"}
                                    </p>
                                    <p className="text-[10px] uppercase text-muted-foreground font-medium">
                                      Log: {log?.repsDone || item.reps || "0"} reps
                                    </p>
                                  </div>
                                )}
                                
                                {item.rest && !isEditing && (
                                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground md:justify-end">
                                    <Clock className="w-3 h-3" />
                                    {item.rest} desc.
                                  </div>
                                )}
                              </div>

                              {item.exercise.demoUrl && (
                                <button className="p-2 rounded-full hover:bg-primary/20 text-primary transition-all">
                                  <PlayCircle className="w-6 h-6" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {(item.notes || isCompleted) && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <p className="text-xs text-muted-foreground italic">
                                {item.notes ? `Nota: ${item.notes}` : ""}
                              </p>
                              {isCompleted && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] uppercase font-bold">
                                    Log: {log.weightUsed || "0kg"} / {log.repsDone || "0"} reps
                                  </Badge>
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] uppercase font-bold">
                                    Completado hoy
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
