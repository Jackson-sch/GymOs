"use client";

import React, { useState } from "react";
import { Dumbbell, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addExercisesToPlanAction } from "@/lib/actions/routine-management-actions";
import { RoutineExerciseRow } from "./RoutineExerciseRow";
import { toast } from "sonner";

const addExercisesSchema = z.object({
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().min(1, "Selecciona un ejercicio"),
        day: z.string().min(1, "Selecciona un día"),
        sets: z.number().min(1, "Mínimo 1 set"),
        reps: z.string().min(1, "Ingresa las repeticiones"),
        notes: z.string().optional(),
      })
    )
    .min(1, "Añade al menos un ejercicio"),
});

type AddExercisesFormValues = z.infer<typeof addExercisesSchema>;

interface PlanAddExercisesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: any;
  exercises: any[];
  onRoutinesUpdated?: (updatedRoutines: any[]) => void;
}

export function PlanAddExercisesDialog({
  open,
  onOpenChange,
  plan,
  exercises,
  onRoutinesUpdated,
}: PlanAddExercisesDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AddExercisesFormValues>({
    resolver: zodResolver(addExercisesSchema),
    defaultValues: {
      exercises: [{ exerciseId: "", day: "Lunes", sets: 3, reps: "12", notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "exercises",
    control: form.control,
  });

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      form.reset({
        exercises: [{ exerciseId: "", day: "Lunes", sets: 3, reps: "12", notes: "" }],
      });
    }
  }

  const handleSubmit = async (values: AddExercisesFormValues) => {
    const routineIds = (plan.routines || []).map((r: any) => r.id).filter(Boolean);
    if (routineIds.length === 0) return;

    setIsSaving(true);
    try {
      const baseOrder = plan.routines?.[0]?.exercises?.length || 0;
      const result = await addExercisesToPlanAction({
        routineIds,
        exercises: values.exercises.map((ex, i) => ({
          ...ex,
          order: baseOrder + i,
        })),
      });

      if (result.success && Array.isArray(result.data)) {
        toast.success("Ejercicios agregados al plan");
        onRoutinesUpdated?.(result.data as any[]);
        onOpenChange(false);
      } else {
        toast.error(result.error || "No se pudieron agregar los ejercicios");
      }
    } catch {
      toast.error("Error al guardar los ejercicios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-border/80 dark:border-white/10 rounded-3xl shadow-2xl">
        <DialogHeader className="px-6 sm:px-8 pt-6 pb-5 border-b border-border/60 shrink-0">
          <div className="flex items-start gap-4 pr-8">
            <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Dumbbell className="size-5" />
            </div>
            <div className="space-y-1 text-left">
              <DialogTitle className="text-2xl sm:text-3xl font-serif tracking-tight">
                Agregar Ejercicios al Plan
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Los ejercicios se añadirán a <span className="font-semibold text-foreground">{plan.name}</span> para los {plan.routines?.length || 0} socios vinculados.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-serif tracking-tight">Nuevos Ejercicios</h3>
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 tabular-nums">
                    {fields.length}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    append({ exerciseId: "", day: "Lunes", sets: 3, reps: "12", notes: "" })
                  }
                  variant="outline"
                  className="rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 h-9 px-3.5 text-xs font-semibold gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Fila
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <RoutineExerciseRow
                    key={field.id}
                    form={form}
                    index={idx}
                    exercises={exercises}
                    onRemove={remove}
                  />
                ))}
              </div>

              {form.formState.errors.exercises && (
                <p className="text-xs font-medium text-destructive text-center pt-1">
                  {form.formState.errors.exercises.message}
                </p>
              )}
            </div>

            <div className="px-6 sm:px-8 py-4 border-t border-border/60 bg-muted/20 dark:bg-white/[0.02] shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {fields.length}{" "}
                {fields.length === 1 ? "ejercicio por agregar" : "ejercicios por agregar"}
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                  className="h-11 px-5 rounded-xl text-xs font-semibold flex-1 sm:flex-initial"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || fields.length === 0}
                  className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-[0.15em] shadow-lg shadow-primary/20 gap-2 flex-1 sm:flex-initial"
                >
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  {isSaving ? "Guardando..." : "Guardar Ejercicios"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
