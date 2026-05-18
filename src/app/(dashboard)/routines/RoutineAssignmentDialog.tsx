"use client";

import React, { useState } from "react";
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
import { Plus, Trash2, UserPlus, Search, Dumbbell, UserCheck, ChevronsUpDown } from "lucide-react";
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

type RoutineFormValues = z.infer<typeof routineSchema>;

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
      <DialogContent className="glass-card border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif">Asignar Plan de Entrenamiento</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configura y asigna una nueva rutina personalizada a un socio del gimnasio.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-6">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre del Plan</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ganancia de Masa" className="h-12 rounded-2xl bg-white/5 border-white/10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Objetivos y recomendaciones..." className="h-12 rounded-2xl bg-white/5 border-white/10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Socio</FormLabel>
                      <FormControl>
                        <MemberCombobox 
                          members={members} 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Entrenador</FormLabel>
                      <FormControl>
                        <Combobox 
                          items={trainers.map(t => ({ label: t.fullName, value: t.id }))}
                          value={field.value}
                          onSelect={field.onChange}
                          placeholder="Seleccionar entrenador"
                          searchPlaceholder="Buscar entrenador..."
                          triggerClassName="h-12 rounded-2xl"
                          icon={UserCheck}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif">Ejercicios</h3>
                <Button 
                  type="button" 
                  onClick={() => append({ exerciseId: "", day: "Lunes", sets: 3, reps: "12", notes: "" })} 
                  variant="outline" 
                  className="rounded-xl border-white/10 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Ejercicio
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={field.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors grid grid-cols-1 md:grid-cols-12 gap-5 items-end animate-in fade-in slide-in-from-right-4 duration-300 group">
                    <div className="md:col-span-4 space-y-2">
                      <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Ejercicio</FormLabel>
                      <FormField
                        control={form.control}
                        name={`exercises.${idx}.exerciseId`}
                        render={({ field: exerciseField }) => (
                          <FormItem>
                            <FormControl>
                              <Combobox 
                                items={exercises.map(e => ({ label: e.name, value: e.id, description: e.category?.name }))}
                                value={exerciseField.value}
                                onSelect={exerciseField.onChange}
                                placeholder="Seleccionar"
                                searchPlaceholder="Buscar ejercicio..."
                                triggerClassName="h-10 rounded-xl"
                                icon={Dumbbell}
                              />
                            </FormControl>
                            <FormMessage className="text-[8px]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Día</FormLabel>
                      <FormField
                        control={form.control}
                        name={`exercises.${idx}.day`}
                        render={({ field: dayField }) => (
                          <FormItem>
                            <Select value={dayField.value} onValueChange={dayField.onChange}>
                              <FormControl>
                                <SelectTrigger className="h-10 rounded-xl bg-white/5 border-white/10">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-secondary/95 backdrop-blur-md border-white/10">
                                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "General"].map(d => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-[8px]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-1 space-y-2">
                      <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-center">Sets</FormLabel>
                      <FormField
                        control={form.control}
                        name={`exercises.${idx}.sets`}
                        render={({ field: setsField }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...setsField}
                                onChange={(e) => setsField.onChange(parseInt(e.target.value))}
                                className="h-10 px-2 rounded-xl bg-white/5 border-white/10 text-center" 
                              />
                            </FormControl>
                            <FormMessage className="text-[8px]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-1 space-y-2">
                      <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-center">Reps</FormLabel>
                      <FormField
                        control={form.control}
                        name={`exercises.${idx}.reps`}
                        render={({ field: repsField }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                {...repsField}
                                placeholder="12" 
                                className="h-10 px-2 rounded-xl bg-white/5 border-white/10 text-center" 
                              />
                            </FormControl>
                            <FormMessage className="text-[8px]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Notas / Peso</FormLabel>
                      <FormField
                        control={form.control}
                        name={`exercises.${idx}.notes`}
                        render={({ field: notesField }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                {...notesField}
                                placeholder="Ej: 20kg, lento" 
                                className="h-10 rounded-xl bg-white/5 border-white/10" 
                              />
                            </FormControl>
                            <FormMessage className="text-[8px]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-1 pb-1">
                      <Button 
                        type="button" 
                        onClick={() => remove(idx)} 
                        variant="outline" 
                        className="w-full h-10 p-0 rounded-xl border-white/10 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-12 rounded-2xl border-2 border-dashed border-white/5 text-muted-foreground italic">
                    No hay ejercicios añadidos a esta rutina
                  </div>
                )}
                {form.formState.errors.exercises && (
                  <p className="text-sm font-medium text-destructive text-center">
                    {form.formState.errors.exercises.message}
                  </p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-14 rounded-2xl text-base font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {loading ? "Guardando..." : "Asignar Rutina al Socio"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
