"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMemberAction, updateMemberAction } from "@/lib/actions/members-actions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const memberSchema = z.object({
  fullName: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  dni: z.string().min(8, "DNI debe tener 8 dígitos"),
  address: z.string().optional(),
  pin: z.string().optional(),
  photo: z.string().optional(),
  birthDate: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED"]),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export function MemberForm({ initialData, onSuccess }: MemberFormProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: initialData ? {
      fullName: initialData.fullName || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      dni: initialData.dni || "",
      address: initialData.address || "",
      pin: initialData.pin || "",
      photo: initialData.photo || "",
      birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : "",
      status: initialData.status || "ACTIVE"
    } : {
      fullName: "",
      email: "",
      phone: "",
      dni: "",
      address: "",
      pin: "",
      photo: "",
      birthDate: "",
      status: "ACTIVE"
    }
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4 pt-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Nombre Completo</FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10" placeholder="Ej. Juan Pérez" {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">DNI / Documento</FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10" placeholder="88888888" {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Personal</FormLabel>
                <FormControl>
                  <Input type="email" className="bg-white/5 border-white/10" placeholder="juan@ejemplo.com" {...field} />
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
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Teléfono</FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10" placeholder="+51 999..." {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Dirección (Opcional)</FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10" placeholder="Calle Ejemplo 123..." {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">PIN de Acceso (4-6 dígitos)</FormLabel>
                <FormControl>
                  <Input type="password" maxLength={6} className="bg-white/5 border-white/10 tracking-widest font-mono" placeholder="••••" {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Fecha de Nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" className="bg-white/5 border-white/10" {...field} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Estado</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 w-full">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-black/95 border-white/10 backdrop-blur-xl">
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-bold uppercase tracking-widest gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initialData ? "Actualizar Socio" : "Registrar Socio"}
        </Button>
      </form>
    </Form>
  );
}
