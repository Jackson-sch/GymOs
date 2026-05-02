"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createPlanAction, updatePlanAction } from "@/lib/actions/plans-actions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const planSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)), "Precio inválido"),
  durationDays: z.string().refine((val) => !isNaN(parseInt(val)), "Duración inválida"),
  maxFreezeDays: z.string().optional(),
  category: z.string().min(1, "Categoría requerida"),
  allowedClasses: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export function PlanForm({ initialData, onSuccess }: PlanFormProps) {
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: initialData.price.toString(),
      durationDays: initialData.durationDays.toString(),
      maxFreezeDays: initialData.maxFreezeDays?.toString() || "0",
      allowedClasses: initialData.allowedClasses ?? false,
    } : {
      allowedClasses: false,
      category: "GENERAL",
      name: "",
      description: "",
      price: "",
      durationDays: "",
      maxFreezeDays: "0"
    }
  });

  const allowedClasses = watch("allowedClasses");

  const onSubmit = async (values: PlanFormValues) => {
    setLoading(true);
    const result = initialData 
      ? await updatePlanAction(initialData.id, values)
      : await createPlanAction(values);

    if (result.success) {
      toast.success(initialData ? "Plan actualizado" : "Plan creado");
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nombre del Plan</Label>
          <Input {...register("name")} className="bg-white/5 border-white/10" placeholder="Anual VIP" />
          {errors.name && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Categoría</Label>
          <Input {...register("category")} className="bg-white/5 border-white/10" placeholder="FITNESS" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Descripción</Label>
        <Textarea {...register("description")} className="bg-white/5 border-white/10" placeholder="Describe los beneficios..." />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Precio (S/.)</Label>
          <Input {...register("price")} className="bg-white/5 border-white/10" placeholder="120.00" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Días (Duración)</Label>
          <Input {...register("durationDays")} className="bg-white/5 border-white/10" placeholder="30" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Días Congelación</Label>
          <Input {...register("maxFreezeDays")} className="bg-white/5 border-white/10" placeholder="15" />
        </div>
      </div>

      <div className="flex items-center space-x-2 p-4 rounded-xl bg-white/5 border border-white/10">
        <Checkbox 
          id="allowedClasses" 
          checked={allowedClasses}
          onCheckedChange={(checked) => setValue("allowedClasses", !!checked)}
        />
        <Label htmlFor="allowedClasses" className="text-xs cursor-pointer">Permitir acceso a Clases Grupales</Label>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-bold uppercase tracking-widest gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {initialData ? "Guardar Cambios" : "Crear Plan Maestro"}
      </Button>
    </form>
  );
}
