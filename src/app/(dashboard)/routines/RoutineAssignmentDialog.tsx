"use client";

import { useState } from "react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, UserPlus, Dumbbell, UserCheck, Loader2, ClipboardList } from "lucide-react";
import { assignRoutineAction } from "@/lib/actions/routine-management-actions";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MemberCombobox } from "@/components/shared/MemberCombobox";
import { Combobox } from "@/components/ui/combobox";
import { RoutineExerciseRow } from "./components/RoutineExerciseRow";

interface Props {
  members: any[];
  trainers: any[];
  exercises: any[];
  onSuccess: (newRoutine: any) => void;
}

const routineSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  memberId: z.string().min(1, "Debes seleccionar un socio"),
  trainerId: z.string().min(1, "Debes seleccionar un entrenador"),
  exercises: z.array(z.object({
    exerciseId: z.string().min(1, "Selecciona un ejercicio"),
    day: z.string().min(1, "Selecciona un día"),
    sets: z.number().min(1, "Mínimo 1 set"),
    reps: z.string().min(1, "Ingresa las repeticiones"),
    notes: z.string().optional(),
  })).min(1, "Añade al menos un ejercicio"),
});

export type RoutineFormValues = z.infer<typeof routineSchema>;

export function RoutineAssignmentDialog({ members, trainers, exercises, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<RoutineFormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      name: "",
      description: "",
      memberId: "",
      trainerId: "",
      exercises: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "exercises",
    control: form.control,
  });

  const onSubmit = async (values: RoutineFormValues) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        exercises: values.exercises.map((ex, i) => ({ ...ex, order: i }))
      };

      const result = await assignRoutineAction(data);
      if (result.success) {
        toast.success("Rutina asignada correctamente");
        onSuccess(result.data);
        setOpen(false);
        form.reset();
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
        <Button className="rounded-2xl gap-2 h-12 px-6 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
          <UserPlus className="w-4 h-4" />
          Asignar Nueva Rutina
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-border/80 dark:border-white/10 rounded-3xl shadow-2xl">
        <DialogHeader className="px-6 sm:px-8 pt-6 pb-5 border-b border-border/60 shrink-0">
          <div className="flex items-start gap-4 pr-8">
            <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ClipboardList className="size-5" />
            </div>
            <div className="space-y-1 text-left">
              <DialogTitle className="text-2xl sm:text-3xl font-serif tracking-tight">
                Asignar Plan de Entrenamiento
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Configura los detalles generales y prescribe los ejercicios semanales para el socio.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6 space-y-7">
              {/* General Info */}
              <div className="rounded-2xl border border-border/70 bg-muted/20 dark:bg-white/[0.02] p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Detalles del Plan & Asignación
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">
                          Nombre del Plan
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Ganancia de Masa"
                            className="h-11 rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">
                          Socio
                        </FormLabel>
                        <FormControl>
                          <MemberCombobox
                            members={members}
                            value={field.value}
                            onChange={field.onChange}
                            triggerClassName="h-11 rounded-xl bg-background border-border/80 hover:bg-muted/40"
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">
                          Descripción
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Objetivos y recomendaciones..."
                            className="h-11 rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trainerId"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">
                          Entrenador
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            items={trainers.map(t => ({ label: t.fullName, value: t.id }))}
                            value={field.value}
                            onSelect={field.onChange}
                            placeholder="Seleccionar entrenador"
                            searchPlaceholder="Buscar entrenador..."
                            triggerClassName="h-11 rounded-xl bg-background border-border/80 hover:bg-muted/40"
                            icon={UserCheck}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-serif tracking-tight">Ejercicios</h3>
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 tabular-nums">
                      {fields.length}
                    </span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => append({ exerciseId: "", day: "Lunes", sets: 3, reps: "12", notes: "" })}
                    variant="outline"
                    className="rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 h-9 px-3.5 text-xs font-semibold gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir Ejercicio
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

                  {fields.length === 0 && (
                    <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-border/80 bg-muted/15 space-y-3">
                      <div className="size-11 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground">
                        <Dumbbell className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          No hay ejercicios añadidos a esta rutina
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Agrega al menos un ejercicio con sus series, repeticiones y día asignado.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ exerciseId: "", day: "Lunes", sets: 3, reps: "12", notes: "" })}
                        className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir primer ejercicio
                      </Button>
                    </div>
                  )}

                  {form.formState.errors.exercises && (
                    <p className="text-xs font-medium text-destructive text-center pt-1">
                      {form.formState.errors.exercises.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-border/60 bg-muted/20 dark:bg-white/[0.02] shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {fields.length === 0
                  ? "Añade al menos 1 ejercicio para continuar"
                  : `${fields.length} ${fields.length === 1 ? "ejercicio configurado" : "ejercicios configurados"}`}
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="h-11 px-5 rounded-xl text-xs font-semibold flex-1 sm:flex-initial"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-[0.15em] shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-transform flex-1 sm:flex-initial gap-2"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {loading ? "Guardando..." : "Asignar Rutina al Socio"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
