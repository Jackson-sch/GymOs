"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Trash2, UserPlus, Search } from "lucide-react";
import { assignRoutineAction } from "@/lib/actions/routine-management-actions";
import { toast } from "sonner";

interface Props {
  members: any[];
  trainers: any[];
  exercises: any[];
  onSuccess: (newRoutine: any) => void;
}

export function RoutineAssignmentDialog({ members, trainers, exercises, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);

  const addExercise = () => {
    setSelectedExercises([...selectedExercises, { 
      exerciseId: "", 
      day: "Lunes", 
      sets: 3, 
      reps: "12", 
      weight: "", 
      rest: "60s", 
      notes: "" 
    }]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...selectedExercises];
    updated[index][field] = value;
    setSelectedExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (selectedExercises.length === 0) {
      toast.error("Añade al menos un ejercicio a la rutina");
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        memberId: formData.get("memberId") as string,
        trainerId: formData.get("trainerId") as string,
        exercises: selectedExercises.map((ex, i) => ({ ...ex, order: i }))
      };

      const result = await assignRoutineAction(data);
      if (result.success) {
        toast.success("Rutina asignada correctamente");
        onSuccess(result.data);
        setOpen(false);
        setSelectedExercises([]);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al guardar la rutina");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl gap-2 h-12 px-6">
          <UserPlus className="w-4 h-4" />
          Asignar Nueva Rutina
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif">Asignar Plan de Entrenamiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre del Plan</label>
                <Input name="name" required placeholder="Ej: Ganancia de Masa" className="h-12 rounded-2xl bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción</label>
                <Input name="description" placeholder="Objetivos y recomendaciones..." className="h-12 rounded-2xl bg-white/5 border-white/10" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Socio</label>
                <Select name="memberId" required>
                  <SelectTrigger className="h-12 rounded-2xl bg-white/5 border-white/10">
                    <SelectValue placeholder="Seleccionar socio" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary/95 backdrop-blur-md border-white/10">
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.fullName} ({m.dni})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Entrenador</label>
                <Select name="trainerId" required>
                  <SelectTrigger className="h-12 rounded-2xl bg-white/5 border-white/10">
                    <SelectValue placeholder="Seleccionar entrenador" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary/95 backdrop-blur-md border-white/10">
                    {trainers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif">Ejercicios</h3>
              <Button type="button" onClick={addExercise} variant="outline" className="rounded-xl border-white/10 gap-2">
                <Plus className="w-4 h-4" />
                Añadir Ejercicio
              </Button>
            </div>

            <div className="space-y-3">
              {selectedExercises.map((ex, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Ejercicio</label>
                    <Select value={ex.exerciseId} onValueChange={(val) => updateExercise(idx, "exerciseId", val)}>
                      <SelectTrigger className="h-10 rounded-xl bg-white/5 border-white/10">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary/95 backdrop-blur-md border-white/10 max-h-[300px]">
                        {exercises.map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Día</label>
                    <Select value={ex.day} onValueChange={(val) => updateExercise(idx, "day", val)}>
                      <SelectTrigger className="h-10 rounded-xl bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary/95 backdrop-blur-md border-white/10">
                        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "General"].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Sets</label>
                    <Input type="number" value={ex.sets} onChange={(e) => updateExercise(idx, "sets", parseInt(e.target.value))} className="h-10 rounded-xl bg-white/5 border-white/10" />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Reps</label>
                    <Input value={ex.reps} onChange={(e) => updateExercise(idx, "reps", e.target.value)} placeholder="12" className="h-10 rounded-xl bg-white/5 border-white/10" />
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Notas / Peso</label>
                    <Input value={ex.notes} onChange={(e) => updateExercise(idx, "notes", e.target.value)} placeholder="Opcional" className="h-10 rounded-xl bg-white/5 border-white/10" />
                  </div>

                  <div className="md:col-span-1 pb-1">
                    <Button type="button" onClick={() => removeExercise(idx)} variant="outline" className="w-full h-10 p-0 rounded-xl border-white/10 hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {selectedExercises.length === 0 && (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-white/5 text-muted-foreground italic">
                  No hay ejercicios añadidos a esta rutina
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-lg font-serif">
            {loading ? "Guardando..." : "Asignar Rutina al Socio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
