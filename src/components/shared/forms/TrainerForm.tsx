"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputGroup } from "@/components/ui/input-group";

const trainerSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Teléfono requerido"),
  photo: z.string().optional(),
  specialties: z.string().optional(),
  bio: z.string().optional(),
  commissionPct: z.number().optional(),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

interface TrainerFormProps {
  trainer?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TrainerForm({ trainer, onSuccess, onCancel }: TrainerFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      fullName: trainer?.fullName || "",
      email: trainer?.email || "",
      phone: trainer?.phone || "",
      photo: trainer?.photo || "",
      specialties: trainer?.specialties?.join(", ") || "",
      bio: trainer?.bio || "",
      commissionPct: trainer?.commissionPct ? Number(trainer.commissionPct) : undefined,
    },
  });

  const onSubmit = async (data: TrainerFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        specialties: data.specialties ? data.specialties.split(",").map(s => s.trim()) : [],
      };
      
      const res = trainer
        ? await fetch("/api/trainers", {
            method: "PUT",
            body: JSON.stringify({ id: trainer.id, ...payload }),
          })
        : await fetch("/api/trainers", {
            method: "POST",
            body: JSON.stringify(payload),
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
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input id="fullName" {...form.register("fullName")} placeholder="Juan Pérez" />
          {form.formState.errors.fullName && (
            <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="juan@email.com" />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...form.register("phone")} placeholder="+51 999 999 999" />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="commissionPct">Comisión %</Label>
          <Input
            id="commissionPct"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...form.register("commissionPct", { valueAsNumber: true })}
            placeholder="10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="specialties">Especialidades</Label>
        <Input id="specialties" {...form.register("specialties")} placeholder="Musculación, Spinning, Yoga" />
        <p className="text-xs text-muted-foreground">Separadas por coma</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea id="bio" {...form.register("bio")} placeholder="Breve descripción..." rows={3} />
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
          {isLoading ? "Guardando..." : trainer ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}