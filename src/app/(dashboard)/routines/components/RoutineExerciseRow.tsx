"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Dumbbell, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface RoutineExerciseRowProps {
  form: UseFormReturn<any>;
  index: number;
  exercises: any[];
  onRemove: (index: number) => void;
}

const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
  "General",
];

export function RoutineExerciseRow({
  form,
  index,
  exercises,
  onRemove,
}: RoutineExerciseRowProps) {
  return (
    <div className="p-4 rounded-2xl bg-card dark:bg-white/[0.03] border border-border/80 dark:border-white/10 hover:border-primary/30 shadow-xs transition-colors animate-slide-right-fast group">
      <div className="flex items-center justify-between mb-3 md:hidden">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
          Ejercicio #{index + 1}
        </span>
        <Button
          type="button"
          onClick={() => onRemove(index)}
          variant="ghost"
          size="icon"
          aria-label={`Eliminar ejercicio ${index + 1}`}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors h-8 w-8"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2.3fr)_minmax(126px,1fr)_72px_84px_minmax(0,1.5fr)_36px] gap-3 items-start">
        <FormField
          control={form.control}
          name={`exercises.${index}.exerciseId`}
          render={({ field: exerciseField }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Ejercicio
              </FormLabel>
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
                  triggerClassName="h-10 rounded-xl bg-background border-border/80 hover:bg-muted/40 text-sm"
                  icon={Dumbbell}
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`exercises.${index}.day`}
          render={({ field: dayField }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Día
              </FormLabel>
              <Select value={dayField.value} onValueChange={dayField.onChange}>
                <FormControl>
                  <SelectTrigger className="h-10 w-full rounded-xl bg-background border-border/80 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover/95 backdrop-blur-md border-border rounded-xl">
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3 md:contents">
          <FormField
            control={form.control}
            name={`exercises.${index}.sets`}
            render={({ field: setsField }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:text-center">
                  Sets
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...setsField}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setsField.onChange(Number.isNaN(val) ? 0 : val);
                    }}
                    className="h-10 px-2 rounded-xl bg-background border-border/80 text-center font-medium tabular-nums"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`exercises.${index}.reps`}
            render={({ field: repsField }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:text-center">
                  Reps
                </FormLabel>
                <FormControl>
                  <Input
                    {...repsField}
                    placeholder="12"
                    className="h-10 px-2 rounded-xl bg-background border-border/80 text-center font-medium"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`exercises.${index}.notes`}
          render={({ field: notesField }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Notas / Peso
              </FormLabel>
              <FormControl>
                <Input
                  {...notesField}
                  placeholder="Ej: 20kg, lento"
                  className="h-10 rounded-xl bg-background border-border/80 text-sm"
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <div className="hidden md:flex justify-end pt-[22px]">
          <Button
            type="button"
            onClick={() => onRemove(index)}
            variant="ghost"
            size="icon"
            aria-label={`Eliminar ejercicio ${index + 1}`}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors h-10 w-9"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
