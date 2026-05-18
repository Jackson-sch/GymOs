"use client";

import React, { type SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { renewMembershipAction } from "@/lib/actions/membership-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  Loader2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formats";

interface RenewalFormProps {
  member: any;
  plans: any[];
  onSuccess: () => void;
}

export function RenewalForm({ member, plans, onSuccess }: RenewalFormProps) {
  const currentMembership = member.memberships?.[0];
  const initialPlanId = React.useMemo(() => {
    const currentPlanId = currentMembership?.planId || currentMembership?.plan?.id;
    if (currentPlanId && plans.some(p => p.id === currentPlanId && p.isActive)) {
      return currentPlanId;
    }
    return "";
  }, [currentMembership, plans]);

  const [selectedPlanId, setSelectedPlanId] = React.useState<string>(initialPlanId);
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const currentPlanId = member.memberships?.[0]?.planId || member.memberships?.[0]?.plan?.id;
    if (currentPlanId && plans.some(p => p.id === currentPlanId && p.isActive)) {
      setSelectedPlanId(currentPlanId);
    }
  }, [member, plans]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const endDate = selectedPlan
    ? new Date(Date.now() + selectedPlan.durationDays * 86400000)
    : null;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPlanId) {
      toast.error("Selecciona un plan");
      return;
    }

    setLoading(true);
    try {
      const result = await renewMembershipAction({
        memberId: member.id,
        planId: selectedPlanId,
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success("Membresía renovada exitosamente");
        onSuccess();
      } else {
        toast.error(result.error || "Error al renovar");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: "CASH", label: "Efectivo" },
    { value: "CARD", label: "Tarjeta" },
    { value: "TRANSFER", label: "Transferencia" },
    { value: "YAPE", label: "Yape" },
    { value: "PLIN", label: "Plin" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Status */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          Estado Actual
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{member.fullName}</span>
          {currentMembership ? (
            <Badge
              variant="outline"
              className={`rounded-full text-[9px] uppercase tracking-widest px-2.5 ${
                currentMembership.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}
            >
              {currentMembership.status === "ACTIVE" ? "Activo" : "Vencido"}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full text-[9px] uppercase tracking-widest px-2.5 bg-rose-500/10 text-rose-500 border-rose-500/20"
            >
              Sin Plan
            </Badge>
          )}
        </div>
        {currentMembership && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              Plan: {currentMembership.plan?.name || "—"} · Vence:{" "}
              {formatDate(currentMembership.endDate)}
            </span>
          </div>
        )}
      </div>

      {/* Plan Selection */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          Nuevo Plan
        </Label>
        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
          <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 w-full">
            <SelectValue placeholder="Seleccionar plan..." />
          </SelectTrigger>
          <SelectContent className="bg-black/95 border-white/10 backdrop-blur-xl">
            {plans
              .filter((p) => p.isActive)
              .map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{plan.name}</span>
                    <span className="text-muted-foreground">
                      — {formatCurrency(plan.price)} / {plan.durationDays}d
                    </span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plan Preview */}
      {selectedPlan && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-500">
              Resumen de Renovación
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Inicio
              </p>
              <p className="font-medium">
                {formatDate(new Date())}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Vencimiento
              </p>
              <p className="font-medium">
                {formatDate(endDate || "" )}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Duración
              </p>
              <p className="font-medium">{selectedPlan.durationDays} días</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Monto
              </p>
              <p className="font-medium text-emerald-500">
                {formatCurrency(selectedPlan.price)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          Método de Pago
        </Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 w-full">
            <SelectValue placeholder="Registrar pago (opcional)..." />
          </SelectTrigger>
          <SelectContent className="bg-black/95 border-white/10 backdrop-blur-xl">
            {paymentMethods.map((pm) => (
              <SelectItem key={pm.value} value={pm.value}>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span>{pm.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          Notas (opcional)
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Renovación con descuento del 10%..."
          className="bg-white/5 border-white/10 rounded-xl min-h-[80px] resize-none placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !selectedPlanId}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-emerald-500/20 gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Confirmar Renovación
          </>
        )}
      </Button>
    </form>
  );
}
