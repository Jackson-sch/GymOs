"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createPaymentAction } from "@/lib/actions/payments-actions";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

const paymentSchema = z.object({
  memberId: z.string().min(1, "Socio requerido"),
  planId: z.string().min(1, "Plan requerido"),
  amount: z.string().min(1, "Monto requerido"),
  method: z.enum(["CASH", "CARD", "TRANSFER", "OTHER"]),
  reference: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  members: any[];
  plans: any[];
  onSuccess: () => void;
}

export function PaymentForm({ members, plans, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = React.useState(false);

  const { handleSubmit, setValue, watch, register, formState: { errors } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: "CASH",
    }
  });

  const selectedPlanId = watch("planId");

  // Actualizar monto automáticamente al seleccionar plan
  React.useEffect(() => {
    if (selectedPlanId) {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (plan) setValue("amount", plan.price.toString());
    }
  }, [selectedPlanId, plans, setValue]);

  const onSubmit = async (values: PaymentFormValues) => {
    setLoading(true);
    const result = await createPaymentAction(values);
    if (result.success) {
      toast.success("Pago y Membresía registrados");
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Seleccionar Socio</Label>
        <Select onValueChange={(v) => setValue("memberId", v)}>
          <SelectTrigger className="bg-white/5 border-white/10 h-12">
            <SelectValue placeholder="Buscar socio..." />
          </SelectTrigger>
          <SelectContent className="glass-card bg-black/90 text-white max-h-60">
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.fullName} ({m.dni})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.memberId && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.memberId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Plan a Adquirir</Label>
          <Select onValueChange={(v) => setValue("planId", v)}>
            <SelectTrigger className="bg-white/5 border-white/10 h-10">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent className="glass-card bg-black/90 text-white">
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} - S/. {p.price}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Monto S/.</Label>
          <Input {...register("amount")} className="bg-white/5 border-white/10 h-10 font-bold" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Método de Pago</Label>
          <Select onValueChange={(v: any) => setValue("method", v)} defaultValue="CASH">
            <SelectTrigger className="bg-white/5 border-white/10 h-10">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent className="glass-card bg-black/90 text-white">
              <SelectItem value="CASH">Efectivo</SelectItem>
              <SelectItem value="CARD">Tarjeta (POS)</SelectItem>
              <SelectItem value="TRANSFER">Transferencia</SelectItem>
              <SelectItem value="OTHER">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Referencia / N° Op.</Label>
          <Input {...register("reference")} className="bg-white/5 border-white/10 h-10" placeholder="Ej. 123456" />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-bold uppercase tracking-widest gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        Confirmar e Iniciar Membresía
      </Button>
    </form>
  );
}
