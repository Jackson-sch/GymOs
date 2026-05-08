"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Dumbbell, 
  Search, 
  Library, 
  ClipboardList, 
  UserPlus,
  Trash2,
  Edit,
  Video,
  LayoutGrid,
  List
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
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createExerciseAction } from "@/lib/actions/routine-management-actions";
import { RoutineAssignmentDialog } from "./RoutineAssignmentDialog";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscleGroup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif tracking-tight mb-2">Gestión de Rutinas</h1>
          <p className="text-muted-foreground">Administra la biblioteca de ejercicios y asigna planes a los socios.</p>
        </div>
      </div>

      <Tabs defaultValue="routines" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger 
            value="routines" 
            className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Planes Asignados
          </TabsTrigger>
          <TabsTrigger 
            value="library" 
            className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
          >
            <Library className="w-4 h-4 mr-2" />
            Biblioteca de Ejercicios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif">Rutinas Activas</h2>
            <RoutineAssignmentDialog 
              members={members}
              trainers={trainers}
              exercises={exercises}
              onSuccess={(newRoutine) => setRoutines(prev => [newRoutine, ...prev])}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routines.map((routine) => (
              <div key={routine.id} className="glass-card p-6 border-white/5 hover:border-primary/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant={routine.isActive ? "default" : "secondary"} className="text-[10px] uppercase font-bold">
                    {routine.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <h3 className="text-lg font-serif mb-1">{routine.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">Socio: <span className="text-foreground font-medium">{routine.member.fullName}</span></p>
                
                <div className="space-y-3 py-4 border-y border-white/5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Ejercicios</span>
                    <span className="font-bold">{routine._count.exercises}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Entrenador</span>
                    <span className="font-bold">{routine.trainer.fullName}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl h-10 text-xs border-white/10 hover:bg-white/5">
                    Ver Detalles
                  </Button>
                  <Button variant="outline" className="w-10 h-10 p-0 rounded-xl border-white/10 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar ejercicios por nombre o grupo muscular..." 
                className="pl-12 h-12 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 h-12">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl gap-2 h-12 px-6">
                    <Plus className="w-4 h-4" />
                    Nuevo Ejercicio
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10 max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Añadir Ejercicio</DialogTitle>
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
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre del Ejercicio</label>
                        <Input name="name" required placeholder="Ej: Press de Banca" className="h-12 rounded-2xl bg-white/5 border-white/10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Grupo Muscular</label>
                          <Input name="muscleGroup" placeholder="Ej: Pecho" className="h-12 rounded-2xl bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Equipamiento</label>
                          <Input name="equipment" placeholder="Ej: Barra" className="h-12 rounded-2xl bg-white/5 border-white/10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">URL de Demo (Video/GIF)</label>
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
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
              : "space-y-3"
          )}>
            {filteredExercises.map((ex) => (
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
                      <Video className="w-4 h-4" />
                    </button>
                  )}
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-muted-foreground hover:text-primary hover:bg-white/5 transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
