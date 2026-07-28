"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

interface NewExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formState: {
    name: string;
    muscleGroup: string;
    description: string;
    demoUrl: string;
  };
  setFormState: React.Dispatch<
    React.SetStateAction<{
      name: string;
      muscleGroup: string;
      description: string;
      demoUrl: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function NewExerciseDialog({
  open,
  onOpenChange,
  formState,
  setFormState,
  onSubmit,
  isLoading,
}: NewExerciseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl gap-2 h-11 px-5 font-bold text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="size-4" />
          Nuevo Ejercicio
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background/95 backdrop-blur-2xl border-white/10 text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Registrar Nuevo Ejercicio</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Añada movimientos a la biblioteca del gimnasio con guía de ejecuciones.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              Nombre del Ejercicio
            </Label>
            <Input
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ej: Sentadilla Búlgara con Mancuernas"
              className="bg-white/5 border-white/10 h-11 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              Grupo Muscular Principal
            </Label>
            <Select
              value={formState.muscleGroup}
              onValueChange={(val) =>
                setFormState((prev) => ({ ...prev, muscleGroup: val }))
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 h-11 text-xs">
                <SelectValue placeholder="Seleccionar grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pecho">Pecho (Pectoral)</SelectItem>
                <SelectItem value="Espalda">Espalda (Dorsal/Trapecio)</SelectItem>
                <SelectItem value="Piernas">Piernas (Cuádriceps/Isquios)</SelectItem>
                <SelectItem value="Brazos">Brazos (Bíceps/Tríceps)</SelectItem>
                <SelectItem value="Hombros">Hombros (Deltoides)</SelectItem>
                <SelectItem value="Core">Core (Abdomen/Lumbar)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              URL de Demostración (Video YouTube / GIF)
            </Label>
            <Input
              value={formState.demoUrl}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, demoUrl: e.target.value }))
              }
              placeholder="https://youtube.com/watch?v=..."
              className="bg-white/5 border-white/10 h-11 text-xs font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-ex-desc" className="text-xs font-semibold uppercase tracking-wider">
              Instrucciones Técnicas de Ejecución
            </Label>
            <textarea
              id="new-ex-desc"
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Consejos de postura, respiración y recorrido del movimiento..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs h-24 focus:outline-none focus:border-primary/50 text-foreground"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs uppercase font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl gap-2"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              Guardar Ejercicio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
