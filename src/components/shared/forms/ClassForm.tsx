"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createClassAction, updateClassAction } from "@/lib/actions/classes-actions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const classSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Fecha y hora requerida"),
  durationMins: z.string().refine((val) => !isNaN(parseInt(val)), "Inválido"),
  maxCapacity: z.string().refine((val) => !isNaN(parseInt(val)), "Inválido"),
  trainerId: z.string().min(1, "Entrenador requerido"),
  location: z.string().optional(),
  status: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassFormProps {
  initialData?: any;
  trainers: any[];
  onSuccess: () => void;
}

export function ClassForm({ initialData, trainers, onSuccess }: ClassFormProps) {
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: initialData ? {
      ...initialData,
      startTime: new Date(initialData.startTime).toISOString().slice(0, 16),
      durationMins: initialData.durationMins.toString(),
      maxCapacity: initialData.maxCapacity.toString(),
    } : {
      location: "Sala Principal",
      durationMins: "60",
      maxCapacity: "20"
    }
  });

  const onSubmit = async (values: ClassFormValues) => {
    setLoading(true);
    const result = initialData 
      ? await updateClassAction(initialData.id, values)
      : await createClassAction(values);

    if (result.success) {
      toast.success(initialData ? "Clase actualizada" : "Clase programada");
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
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nombre de Clase</Label>
          <Input {...register("name")} className="bg-white/5 border-white/10" placeholder="Yoga Flow" />
          {errors.name && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Entrenador</Label>
          <Select onValueChange={(v) => setValue("trainerId", v)} defaultValue={initialData?.trainerId}>
            <SelectTrigger className="bg-white/5 border-white/10 h-10 w-full">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent className="glass-card bg-black/90 text-white">
              {trainers.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.trainerId && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.trainerId.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Descripción</Label>
        <Textarea {...register("description")} className="bg-white/5 border-white/10" placeholder="Detalles de la sesión..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Fecha y Hora</Label>
          <Input {...register("startTime")} type="datetime-local" className="bg-white/5 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Ubicación / Sala</Label>
          <Input {...register("location")} className="bg-white/5 border-white/10" placeholder="Sala Principal" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Duración (min)</Label>
          <Input {...register("durationMins")} type="number" className="bg-white/5 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Capacidad Máx.</Label>
          <Input {...register("maxCapacity")} type="number" className="bg-white/5 border-white/10" />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-bold uppercase tracking-widest gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {initialData ? "Actualizar Horario" : "Programar Sesión"}
      </Button>
    </form>
  );
}
