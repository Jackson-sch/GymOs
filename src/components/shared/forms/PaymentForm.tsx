"use client";

import React from "react";
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
import { MemberCombobox } from "@/components/shared/MemberCombobox";
import {
  createPaymentAction,
  checkMemberPaymentStatusAction,
} from "@/lib/actions/payments-actions";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  RefreshCw,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";

const paymentSchema = z.object({
  memberId: z.string().min(1, "Socio requerido"),
  planId: z.string().min(1, "Plan requerido"),
  amount: z.string().min(1, "Monto requerido"),
  method: z.enum(["CASH", "CARD", "TRANSFER", "YAPE", "PLIN", "OTHER"]),
  reference: z.string().optional(),
  referralTrainerId: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  members: any[];
  plans: any[];
  trainers: any[];
  onSuccess: () => void;
}

export function PaymentForm({ members, plans, trainers, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<any>(null);
  const [changingPlan, setChangingPlan] = React.useState(false);
  const [comboOpen, setComboOpen] = React.useState(false);
  const [paymentWarning, setPaymentWarning] = React.useState<{
    recentPaymentToday: any | null;
    activeMembership: any | null;
  } | null>(null);
  const [forceConfirm, setForceConfirm] = React.useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: "CASH",
      amount: "",
      memberId: "",
      planId: "",
    },
  });

  const { setValue, watch, control } = form;

  // Derive the active membership from the selected member
  const activeMembership = React.useMemo(() => {
    if (!selectedMember?.memberships?.length) return null;
    return selectedMember.memberships.find(
      (m: any) => m.status === "ACTIVE"
    ) || selectedMember.memberships[0];
  }, [selectedMember]);

  const activePlan = activeMembership?.plan;

  // When a member is selected, auto-fill their current plan and check recent/active payments
  const handleMemberSelect = React.useCallback(
    async (memberId: string) => {
      const member = members.find((m) => m.id === memberId);
      setSelectedMember(member);
      setValue("memberId", memberId);
      setChangingPlan(false);
      setForceConfirm(false);
      setPaymentWarning(null);

      if (member?.memberships?.length) {
        const membership =
          member.memberships.find((m: any) => m.status === "ACTIVE") ||
          member.memberships[0];
        if (membership?.plan) {
          setValue("planId", membership.plan.id);
          setValue("amount", membership.plan.price.toString());
        }
      }

      setComboOpen(false);

      const statusRes = await checkMemberPaymentStatusAction(memberId);
      if (statusRes.success && statusRes.data) {
        if (statusRes.data.recentPaymentToday || statusRes.data.activeMembership) {
          setPaymentWarning(statusRes.data);
        }
      }
    },
    [members, setValue]
  );

  // When user manually changes plan
  const handlePlanChange = React.useCallback(
    (planId: string) => {
      setValue("planId", planId);
      const plan = plans.find((p) => p.id === planId);
      if (plan) setValue("amount", plan.price.toString());
    },
    [plans, setValue]
  );

  const hasBlockingWarning = Boolean(
    paymentWarning?.recentPaymentToday || paymentWarning?.activeMembership,
  );

  const onSubmit = async (values: PaymentFormValues) => {
    if (hasBlockingWarning && !forceConfirm) {
      toast.warning("Este socio ya tiene un pago reciente o membresía vigente. Confirma la casilla para continuar.");
      return;
    }
    setLoading(true);
    try {
      const result = await createPaymentAction({ ...values, force: forceConfirm });
      if (result.success) {
        toast.success("Pago y Membresía registrados");
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanId = watch("planId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Member Selection */}
        <FormField
          control={control}
          name="memberId"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                Seleccionar Socio
              </FormLabel>
              <FormControl>
                <MemberCombobox 
                  members={members} 
                  value={field.value}
                  open={comboOpen}
                  onOpenChange={setComboOpen}
                  onChange={(val) => {
                    field.onChange(val);
                    handleMemberSelect(val);
                  }} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      {/* Current Plan Indicator + Change Option */}
      {selectedMember && (
        <div className="space-y-3">
          {activePlan && !changingPlan ? (
            <div className="glass-card p-4 border-white/5 bg-linear-to-r from-primary/5 to-transparent space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    Plan Actual
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground h-7 gap-1.5"
                  onClick={() => setChangingPlan(true)}
                >
                  <RefreshCw className="w-3 h-3" />
                  Cambiar Plan
                </Button>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-serif font-medium">
                  {activePlan.name}
                </span>
                <span className="text-sm font-sans font-bold text-primary">
                  S/. {activePlan.price}
                </span>
                {activeMembership?.status === "ACTIVE" && (
                  <Badge
                    variant="outline"
                    className="text-[8px] border-emerald-500/30 text-emerald-400 ml-auto"
                  >
                    Vigente
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                  {changingPlan ? "Nuevo Plan" : "Plan a Adquirir"}
                </FormLabel>
                {changingPlan && activePlan && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground h-6"
                    onClick={() => {
                      setChangingPlan(false);
                      setValue("planId", activePlan.id);
                      setValue("amount", activePlan.price.toString());
                    }}
                  >
                    ← Mantener actual
                  </Button>
                )}
              </div>
              <FormField
                control={control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        handlePlanChange(val);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted/40 border-border text-foreground h-11 w-full">
                          <SelectValue placeholder="Seleccionar plan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground backdrop-blur-xl">
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className="flex items-center gap-2">
                              {p.name}
                              <span className="text-muted-foreground">
                                — S/. {p.price}
                              </span>
                              {activePlan?.id === p.id && (
                                <Badge
                                  variant="outline"
                                  className="text-[7px] border-primary/30 text-primary ml-1"
                                >
                                  Actual
                                </Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      )}

        {/* Amount + Method Row */}
        {selectedMember && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                    Monto
                  </FormLabel>
                  <FormControl>
                    <InputGroup className="bg-white/5 border-white/10 h-11">
                      <InputGroupAddon>S/.</InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        type="number"
                        step="0.01"
                        className="font-bold text-lg font-mono"
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                  {(() => {
                    const selectedPlan = plans.find(p => p.id === selectedPlanId);
                    if (!selectedPlan || !field.value) return null;
                    const diff = selectedPlan.price - Number(field.value);
                    if (diff <= 0) return null;
                    return (
                      <div className="flex items-center gap-1.5 text-[9px] text-rose-400 font-bold uppercase animate-pulse ml-1">
                        Saldo Pendiente: S/. {diff.toFixed(2)}
                      </div>
                    );
                  })()}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="method"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                    Método de Pago
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-muted/40 border-border text-foreground h-11 w-full">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border text-popover-foreground backdrop-blur-xl">
                      <SelectItem value="CASH">Efectivo</SelectItem>
                      <SelectItem value="YAPE">Yape</SelectItem>
                      <SelectItem value="PLIN">Plin</SelectItem>
                      <SelectItem value="CARD">Tarjeta (POS)</SelectItem>
                      <SelectItem value="TRANSFER">Transferencia</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Reference & Referral */}
        {selectedMember && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="reference"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                    Referencia / N° Op. (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-white/5 border-white/10 h-11"
                      placeholder="Ej. 123456"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="referralTrainerId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                    Vendido por (Comisión)
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted/40 border-border text-foreground h-11 w-full">
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border text-popover-foreground backdrop-blur-xl">
                      <SelectItem value="none">Ninguno</SelectItem>
                      {(trainers || []).map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {hasBlockingWarning && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                  Verificación de Cobro Existente
                </p>
                {paymentWarning?.recentPaymentToday && (
                  <p className="text-foreground">
                    Ya existe un pago registrado <strong>hoy</strong> ({paymentWarning.recentPaymentToday.invoiceNumber || "Comprobante"} ·{" "}
                    <strong>S/ {Number(paymentWarning.recentPaymentToday.amount).toFixed(2)}</strong> · {paymentWarning.recentPaymentToday.planName}).
                  </p>
                )}
                {paymentWarning?.activeMembership && (
                  <p className="text-muted-foreground">
                    Membresía actual <strong className="text-foreground">{paymentWarning.activeMembership.planName}</strong> vigente hasta el{" "}
                    <strong className="text-foreground">
                      {new Date(paymentWarning.activeMembership.endDate).toLocaleDateString("es-PE")}
                    </strong>.
                  </p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none text-[11px] font-medium text-foreground">
              <input
                type="checkbox"
                checked={forceConfirm}
                onChange={(e) => setForceConfirm(e.target.checked)}
                className="size-4 rounded border-amber-500/50 accent-amber-600"
              />
              <span>Confirmo que deseo registrar este cobro de todas formas (pago adicional o reemplazo).</span>
            </label>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !selectedMember || (hasBlockingWarning && !forceConfirm)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-bold uppercase tracking-widest gap-2 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          {changingPlan
            ? "Confirmar Cambio de Plan y Pago"
            : "Confirmar Pago y Renovar Membresía"}
        </Button>
      </form>
    </Form>
  );
}
