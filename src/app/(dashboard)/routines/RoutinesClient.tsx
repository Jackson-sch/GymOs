"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, 
  Dumbbell, 
  Search, 
  Library, 
  ClipboardList, 
  Trash2,
  Edit,
  Video,
  LayoutGrid,
  List,
  Loader2,
  ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createExerciseAction } from "@/lib/actions/routine-management-actions";
import { RoutineAssignmentDialog } from "./RoutineAssignmentDialog";
import { useQueryState, parseAsInteger } from "nuqs";
import { PlanDetail } from "./components/PlanDetail";
import { PlanCard } from "./components/PlanCard";

interface RoutinesClientProps {
  initialExercises: any[];
  initialRoutines: any[];
  members: any[];
  trainers: any[];
}

export function RoutinesClient({ 
  initialExercises, 
  initialRoutines,
  members,
  trainers
}: RoutinesClientProps) {
  const [exercises, setExercises] = useState(initialExercises);
  const [routines, setRoutines] = useState(initialRoutines);
  
  const [activeTab, setActiveTab] = useQueryState("tab", { defaultValue: "rutinas" });
  const [planName, setPlanName] = useQueryState("plan");
  const [searchTerm, setSearchTerm] = useQueryState("search", { defaultValue: "" });
  const [routineSearchTerm, setRoutineSearchTerm] = useQueryState("q", { defaultValue: "" });
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [routinesVisibleCount, setRoutinesVisibleCount] = useQueryState("limit", parseAsInteger.withDefault(12));
  
  const ITEMS_PER_PAGE = 12;

  const [exercisesVisibleCount, setExercisesVisibleCount] = useState(12);
  const EXERCISES_PER_PAGE = 12;

  // Reset exercise limit on search change
  useEffect(() => {
    setExercisesVisibleCount(12);
  }, [searchTerm]);

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscleGroup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedExercises = useMemo(() => {
    return filteredExercises.slice(0, exercisesVisibleCount);
  }, [filteredExercises, exercisesVisibleCount]);

  const hasMoreExercises = exercisesVisibleCount < filteredExercises.length;

  const exercisesObserverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMoreExercises) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setExercisesVisibleCount((prev) => prev + EXERCISES_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = exercisesObserverRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreExercises]);

  const filteredRoutines = routines.filter(routine => 
    routine.name.toLowerCase().includes(routineSearchTerm.toLowerCase()) ||
    routine.member.fullName.toLowerCase().includes(routineSearchTerm.toLowerCase()) ||
    routine.trainer.fullName.toLowerCase().includes(routineSearchTerm.toLowerCase())
  );

  const groupedRoutines = React.useMemo(() => {
    const groups: Record<string, any> = {};
    filteredRoutines.forEach(routine => {
      if (!groups[routine.name]) {
        groups[routine.name] = {
          name: routine.name,
          routines: [],
          exerciseCount: routine._count?.exercises || 0,
          trainer: routine.trainer?.fullName || "N/A",
          isActive: routine.isActive,
        };
      }
      groups[routine.name].routines.push(routine);
    });
    return Object.values(groups);
  }, [filteredRoutines]);

  const paginatedGroups = groupedRoutines.slice(0, (routinesVisibleCount ?? 12));
  const hasMoreGroups = (routinesVisibleCount ?? 12) < groupedRoutines.length;

  // Volver al inicio: detección de scroll
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const routinesObserverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMoreGroups) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRoutinesVisibleCount((prev) => (prev ?? 12) + ITEMS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = routinesObserverRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreGroups, setRoutinesVisibleCount]);

  const activePlan = useMemo(() => 
    planName ? groupedRoutines.find(g => g.name === planName) : null
  , [planName, groupedRoutines]);

  if (activePlan) {
    return <PlanDetail plan={activePlan} onBack={() => setPlanName(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Tabs value={activeTab ?? "rutinas"} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-14! rounded-2xl">
          <TabsTrigger value="rutinas" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all uppercase text-[10px] font-black tracking-widest">
            Planes de Entrenamiento
          </TabsTrigger>
          <TabsTrigger value="ejercicios" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all uppercase text-[10px] font-black tracking-widest">
            Catálogo de Ejercicios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rutinas" className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-6 border-white/5 bg-white/5">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar plan por nombre..." 
                className="pl-12 h-14 rounded-2xl bg-black/20 border-white/10 focus:ring-primary/20 transition-all text-sm"
                value={routineSearchTerm ?? ""}
                onChange={(e) => setRoutineSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <RoutineAssignmentDialog 
                members={members}
                trainers={trainers}
                exercises={exercises}
                onSuccess={(newRoutine) => setRoutines(prev => [newRoutine, ...prev])}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedGroups.map((group, idx) => (
              <PlanCard key={idx} group={group} onSelect={setPlanName} />
            ))}
          </div>

          {hasMoreGroups && (
            <div className="space-y-4 pt-8 flex flex-col items-center">
              {/* Elemento observado por IntersectionObserver para planes */}
              <div ref={routinesObserverRef} className="h-4 w-full" />
              
              <Button 
                variant="outline" 
                className="rounded-2xl px-12 h-14 border-white/10 hover:bg-white/5 group gap-2"
                onClick={() => setRoutinesVisibleCount((prev) => (prev ?? 12) + ITEMS_PER_PAGE)}
              >
                Cargar más planes
                <Loader2 className="size-4 animate-spin text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          )}
          
          {groupedRoutines.length === 0 && (
            <div className="text-center py-20 glass-card border-dashed border-white/10">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-serif text-muted-foreground">No se encontraron planes</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Prueba con otro término de búsqueda o asigna uno nuevo.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ejercicios" className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 border-white/5 bg-white/5">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar ejercicios por nombre o grupo muscular..." 
                className="pl-12 h-14 rounded-2xl bg-black/20 border-white/10 focus:ring-primary/20 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex bg-black/20 border border-white/10 rounded-2xl p-1 h-14 flex-1 md:flex-none">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "flex-1 md:flex-none px-4 rounded-xl transition-all flex items-center justify-center",
                    viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex-1 md:flex-none px-4 rounded-xl transition-all flex items-center justify-center",
                    viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <List className="size-4" />
                </button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl gap-2 h-14 px-6 flex-1 md:flex-none">
                    <Plus className="size-4" />
                    Nuevo Ejercicio
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10 max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Añadir Ejercicio</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Crea un nuevo ejercicio para que esté disponible en la biblioteca de rutinas.
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-6 py-4" action={async (formData) => {
                    const result = await createExerciseAction({
                      name: formData.get("name") as string,
                      category: formData.get("category") as string,
                      muscleGroup: formData.get("muscleGroup") as string,
                      equipment: formData.get("equipment") as string,
                      demoUrl: formData.get("demoUrl") as string,
                    });
                    if (result.success) {
                      toast.success("Ejercicio añadido correctamente");
                      setExercises(prev => [...prev, result.data]);
                    } else {
                      toast.error(result.error);
                    }
                  }}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre del Ejercicio</label>
                        <Input name="name" required placeholder="Ej: Press de Banca" className="h-12 rounded-2xl bg-white/5 border-white/10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Grupo Muscular</label>
                          <Input name="muscleGroup" placeholder="Ej: Pecho" className="h-12 rounded-2xl bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Equipamiento</label>
                          <Input name="equipment" placeholder="Ej: Barra" className="h-12 rounded-2xl bg-white/5 border-white/10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL de Demo (Video/GIF)</label>
                        <Input name="demoUrl" placeholder="https://..." className="h-12 rounded-2xl bg-white/5 border-white/10" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-serif">Guardar en Biblioteca</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-3"
          )}>
            {paginatedExercises.map((ex) => (
              <div 
                key={ex.id} 
                className={cn(
                  "glass-card border-white/5 hover:border-primary/20 transition-all group overflow-hidden",
                  viewMode === "grid" ? "p-6 flex flex-col items-center text-center" : "p-4 flex items-center justify-between"
                )}
              >
                <div className={cn(
                  "flex items-center gap-4",
                  viewMode === "grid" && "flex-col"
                )}>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg">{ex.name}</h4>
                    <div className={cn(
                      "flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground",
                      viewMode === "grid" && "justify-center mt-1"
                    )}>
                      <span>{ex.muscleGroup || "General"}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span>{ex.equipment || "Libre"}</span>
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "flex gap-2",
                  viewMode === "grid" ? "mt-6 w-full" : ""
                )}>
                  {ex.demoUrl && (
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                      <Video className="size-4" />
                    </button>
                  )}
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/5 transition-all">
                    <Edit className="size-4" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detector y Botón Manual para Cargar Más Ejercicios */}
          {hasMoreExercises && (
            <div className="space-y-4 pt-8 flex flex-col items-center">
              {/* Elemento observado por IntersectionObserver */}
              <div ref={exercisesObserverRef} className="h-4 w-full" />
              
              <Button 
                variant="outline" 
                className="rounded-2xl px-12 h-14 border-white/10 hover:bg-white/5 group gap-2"
                onClick={() => setExercisesVisibleCount((prev) => prev + EXERCISES_PER_PAGE)}
              >
                Cargar más ejercicios
                <Loader2 className="size-4 animate-spin text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Botón flotante para volver arriba */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-white/10 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all duration-300 shadow-2xl shadow-black/60 hover:scale-110 flex items-center justify-center cursor-pointer"
          title="Volver al inicio"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </div>
  );
}
