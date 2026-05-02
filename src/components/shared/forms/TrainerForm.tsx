"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTrainerAction } from "@/lib/actions/classes-actions";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { ImageUpload } from "@/components/shared/ImageUpload";

const trainerSchema = z.object({
  fullName: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  bio: z.string().optional(),
  photo: z.string().optional(),
});

type TrainerFormValues = z.infer<typeof trainerSchema>;

export function TrainerForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerSchema),
  });

  const onSubmit = async (values: TrainerFormValues) => {
    setLoading(true);
    const result = await createTrainerAction(values);
    if (result.success) {
      toast.success("Entrenador registrado");
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-2 mb-6">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Foto del Instructor</Label>
        <ImageUpload 
          value={watch("photo")}
          onChange={(url) => setValue("photo", url)}
          onRemove={() => setValue("photo", "")}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nombre del Instructor</Label>
        <Input {...register("fullName")} className="bg-white/5 border-white/10" placeholder="Ej. Coach Alex" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</Label>
          <Input {...register("email")} type="email" className="bg-white/5 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Teléfono</Label>
          <Input {...register("phone")} className="bg-white/5 border-white/10" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Biografía / Especialidad</Label>
        <Textarea {...register("bio")} className="bg-white/5 border-white/10" placeholder="Certificado en Crossfit, 10 años experiencia..." />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl font-bold uppercase tracking-widest gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        Vincular Staff
      </Button>
    </form>
  );
}
