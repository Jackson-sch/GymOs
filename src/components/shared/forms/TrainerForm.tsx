"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { Loader2, Save, X } from "lucide-react";

const trainerSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  dni: z.string().min(6, "DNI/Documento requerido"),
  phone: z.string().min(6, "Teléfono requerido"),
  photo: z.string().optional(),
  specialties: z.string().optional(),
  bio: z.string().optional(),
  commissionPct: z.number().optional(),
  baseSalary: z.number().optional(),
  perClassRate: z.number().optional(),
  isActive: z.boolean(),
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
      dni: trainer?.dni || "",
      phone: trainer?.phone || "",
      photo: trainer?.photo || "",
      specialties: trainer?.specialties?.join(", ") || "",
      bio: trainer?.bio || "",
      commissionPct: trainer?.commissionPct ? Number(trainer.commissionPct) : 10,
      baseSalary: trainer?.baseSalary ? Number(trainer.baseSalary) : 0,
      perClassRate: trainer?.perClassRate ? Number(trainer.perClassRate) : 0,
      isActive: trainer?.isActive ?? true,
    },
  });

  const onSubmit = async (data: TrainerFormData) => {
    setIsLoading(true);
    console.log("Submitting trainer data:", data);
    try {
      const payload = {
        ...data,
        specialties: data.specialties ? data.specialties.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      
      const res = trainer
        ? await fetch("/api/trainers", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: trainer.id, ...payload }),
          })
        : await fetch("/api/trainers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      
      const result = await res.json();
      console.log("API Response:", result);

      if (res.ok && result.success !== false) {
        onSuccess?.();
      } else {
        const errorMsg = result.error || "Error desconocido en el servidor";
        form.setError("root", { message: errorMsg });
      }
    } catch (err) {
      console.error("Submission error:", err);
      form.setError("root", { message: "Error de red al guardar" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" className="h-12 rounded-xl bg-white/5 border-white/10" {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="juan@email.com" className="h-12 rounded-xl bg-white/5 border-white/10" {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">DNI / Documento</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" className="h-12 rounded-xl bg-white/5 border-white/10" {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+51 999 999 999" className="h-12 rounded-xl bg-white/5 border-white/10" {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="commissionPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Comisión (%)</FormLabel>
                <FormControl>
                  <InputGroup className="bg-white/5 border-white/10 h-11 rounded-xl">
                    <InputGroupInput
                      type="number"
                      step="0.1"
                      className="font-mono font-bold"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    <InputGroupAddon align="inline-end" className="font-bold text-primary">%</InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baseSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Sueldo Base</FormLabel>
                <FormControl>
                  <InputGroup className="bg-white/5 border-white/10 h-11 rounded-xl">
                    <InputGroupAddon align="inline-start" className="font-bold text-primary">S/.</InputGroupAddon>
                    <InputGroupInput
                      type="number"
                      step="0.01"
                      className="font-mono font-bold"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="perClassRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Por Clase</FormLabel>
                <FormControl>
                  <InputGroup className="bg-white/5 border-white/10 h-11 rounded-xl">
                    <InputGroupAddon align="inline-start" className="font-bold text-primary">S/.</InputGroupAddon>
                    <InputGroupInput
                      type="number"
                      step="0.01"
                      className="font-mono font-bold"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="specialties"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Especialidades</FormLabel>
              <FormControl>
                <Input placeholder="Musculación, Spinning, Yoga" className="h-12 rounded-xl bg-white/5 border-white/10" {...field} />
              </FormControl>
              <FormDescription className="text-[9px] uppercase tracking-widest opacity-50 ml-1">Separadas por coma</FormDescription>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografía</FormLabel>
              <FormControl>
                <Textarea placeholder="Breve descripción..." rows={2} className="bg-white/5 border-white/10 resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 pt-2 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                Personal Activo
              </FormLabel>
            </FormItem>
          )}
        />
        
        {form.formState.errors.root && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400 text-center font-medium">{form.formState.errors.root.message}</p>
          </div>
        )}
        
        <div className="flex gap-3 justify-end pt-6 border-t border-white/5">
          {onCancel && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel} 
              className="h-12 rounded-xl font-bold uppercase tracking-widest text-xs gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[160px] h-12 rounded-xl font-bold uppercase tracking-widest text-xs gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {trainer ? "Actualizar Datos" : "Registrar Entrenador"}
          </Button>
        </div>
      </form>
    </Form>
  );
}