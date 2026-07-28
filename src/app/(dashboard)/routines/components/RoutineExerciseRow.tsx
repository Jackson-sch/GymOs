"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Dumbbell, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import type { RoutineFormValues } from "../RoutineAssignmentDialog";

interface RoutineExerciseRowProps {
  form: UseFormReturn<RoutineFormValues>;
  index: number;
  exercises: any[];
  onRemove: (index: number) => void;
}

export function RoutineExerciseRow({
  form,
  index,
  exercises,
  onRemove,
}: RoutineExerciseRowProps) {
  return (
    <div className="p-5 rounded-2xl bg-white/3 border border-white/10 hover:bg-white/6 transition-colors grid grid-cols-1 md:grid-cols-12 gap-5 items-end animate-slide-right-fast group">
      <div className="md:col-span-4 space-y-2">
        <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Ejercicio
        </FormLabel>
        <FormField
          control={form.control}
          name={`exercises.${index}.exerciseId`}
          render={({ field: exerciseField }) => (
            <FormItem>
              <FormControl>
                <Combobox
                  items={exercises.map((e) => ({
                    label: e.name,
                    value: e.id,
                    description: e.category?.name,
                  }))}
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
        <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Día
        </FormLabel>
        <FormField
          control={form.control}
          name={`exercises.${index}.day`}
          render={({ field: dayField }) => (
            <FormItem>
              <Select value={dayField.value} onValueChange={dayField.onChange}>
                <FormControl>
                  <SelectTrigger className="h-10 rounded-xl bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-secondary/95 backdrop-blur-md border-white/10">
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "General"].map(
                    (d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <FormMessage className="text-[8px]" />
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-1 space-y-2">
        <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-center">
          Sets
        </FormLabel>
        <FormField
          control={form.control}
          name={`exercises.${index}.sets`}
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
        <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-center">
          Reps
        </FormLabel>
        <FormField
          control={form.control}
          name={`exercises.${index}.reps`}
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
        <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Notas / Peso
        </FormLabel>
        <FormField
          control={form.control}
          name={`exercises.${index}.notes`}
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

      <div className="md:col-span-1 flex justify-end">
        <Button
          type="button"
          onClick={() => onRemove(index)}
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors h-10 w-10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
