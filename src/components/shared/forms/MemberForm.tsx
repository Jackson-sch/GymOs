"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMemberAction, updateMemberAction } from "@/lib/actions/members-actions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const memberSchema = z.object({
  fullName: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  dni: z.string().min(8, "DNI debe tener 8 dígitos"),
  address: z.string().optional(),
  photo: z.string().optional(),
  birthDate: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export function MemberForm({ initialData, onSuccess }: MemberFormProps) {
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: initialData ? {
      ...initialData,
      birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : ""
    } : {}
  });

  const onSubmit = async (values: MemberFormValues) => {
    setLoading(true);
    const result = initialData 
      ? await updateMemberAction(initialData.id, values)
      : await createMemberAction(values);

    if (result.success) {
      toast.success(initialData ? "Socio actualizado" : "Socio registrado");
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
          <Input {...register("fullName")} className="bg-white/5 border-white/10" placeholder="Ej. Juan Pérez" />
          {errors.fullName && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">DNI / Documento</Label>
          <Input {...register("dni")} className="bg-white/5 border-white/10" placeholder="88888888" />
          {errors.dni && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.dni.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Personal</Label>
          <Input {...register("email")} type="email" className="bg-white/5 border-white/10" placeholder="juan@ejemplo.com" />
          {errors.email && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Teléfono</Label>
          <Input {...register("phone")} className="bg-white/5 border-white/10" placeholder="+51 999..." />
          {errors.phone && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Dirección (Opcional)</Label>
        <Input {...register("address")} className="bg-white/5 border-white/10" placeholder="Calle Ejemplo 123..." />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Fecha de Nacimiento</Label>
        <Input {...register("birthDate")} type="date" className="bg-white/5 border-white/10" />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-bold uppercase tracking-widest gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {initialData ? "Actualizar Socio" : "Registrar Socio"}
      </Button>
    </form>
  );
}
