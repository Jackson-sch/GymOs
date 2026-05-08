"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const bodyMetricSchema = z.object({
  weight: z.number().positive("Peso debe ser positivo").optional(),
  height: z.number().positive("Altura debe ser positiva").optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscle: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type BodyMetricFormData = z.infer<typeof bodyMetricSchema>;

interface BodyMetricFormProps {
  memberId: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BodyMetricForm({ memberId, initialData, onSuccess, onCancel }: BodyMetricFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const form = useForm<BodyMetricFormData>({
    resolver: zodResolver(bodyMetricSchema),
    defaultValues: {
      weight: initialData?.weight,
      height: initialData?.height,
      bodyFat: initialData?.bodyFat,
      muscle: initialData?.muscle,
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (data: BodyMetricFormData) => {
    setIsLoading(true);
    try {
      const res = initialData 
        ? await fetch("/api/body-metrics", {
            method: "PUT",
            body: JSON.stringify({ id: initialData.id, ...data }),
          })
        : await fetch("/api/body-metrics", {
            method: "POST",
            body: JSON.stringify({ memberId, ...data }),
          });
      
      const result = await res.json();
      if (result.success) {
        onSuccess?.();
      } else {
        form.setError("root", { message: result.error });
      }
    } catch (err) {
      form.setError("root", { message: "Error al guardar" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            {...form.register("weight", { valueAsNumber: true })}
            placeholder="70.5"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            step="1"
            {...form.register("height", { valueAsNumber: true })}
            placeholder="175"
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bodyFat">% Grasa corporal</Label>
          <Input
            id="bodyFat"
            type="number"
            step="0.1"
            min="0"
            max="100"
            {...form.register("bodyFat", { valueAsNumber: true })}
            placeholder="15"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="muscle">% Masa muscular</Label>
          <Input
            id="muscle"
            type="number"
            step="0.1"
            min="0"
            max="100"
            {...form.register("muscle", { valueAsNumber: true })}
            placeholder="40"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <textarea
          id="notes"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...form.register("notes")}
          placeholder="Observaciones..."
        />
      </div>
      
      {form.formState.errors.root && (
        <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
      )}
      
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}