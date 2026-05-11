"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { createPaymentAction } from "@/lib/actions/payments-actions";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  ChevronsUpDown,
  Check,
  RefreshCw,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [comboOpen, setComboOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<any>(null);
  const [changingPlan, setChangingPlan] = React.useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: "CASH",
    },
  });

  // Derive the active membership from the selected member
  const activeMembership = React.useMemo(() => {
    if (!selectedMember?.memberships?.length) return null;
    return selectedMember.memberships.find(
      (m: any) => m.status === "ACTIVE"
    ) || selectedMember.memberships[0];
  }, [selectedMember]);

  const activePlan = activeMembership?.plan;

  // When a member is selected, auto-fill their current plan
  const handleMemberSelect = React.useCallback(
    (memberId: string) => {
      const member = members.find((m) => m.id === memberId);
      setSelectedMember(member);
      setValue("memberId", memberId);
      setChangingPlan(false);

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

  const selectedPlanId = watch("planId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Member Combobox */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Seleccionar Socio
        </Label>
        <Popover open={comboOpen} onOpenChange={setComboOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={comboOpen}
              className="w-full justify-between bg-white/5 border-white/10 h-11 hover:bg-white/8 text-left font-normal"
            >
              {selectedMember ? (
                <span className="flex items-center gap-2 truncate">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium truncate">
                    {selectedMember.fullName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({selectedMember.dni})
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground/50">
                  Buscar por nombre o DNI...
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0 bg-black/95 backdrop-blur-2xl border-white/10"
            align="start"
          >
            <Command className="bg-transparent">
              <CommandInput placeholder="Nombre, DNI o teléfono..." />
              <CommandList className="max-h-56">
                <CommandEmpty className="text-muted-foreground">
                  Sin resultados.
                </CommandEmpty>
                <CommandGroup>
                  {members.map((member) => {
                    const membership = member.memberships?.[0];
                    const planName = membership?.plan?.name;
                    return (
                      <CommandItem
                        key={member.id}
                        value={`${member.fullName} ${member.dni || ""}`}
                        onSelect={() => handleMemberSelect(member.id)}
                        data-checked={
                          selectedMember?.id === member.id ? "true" : undefined
                        }
                        className="flex items-center gap-3 py-2.5"
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-sm truncate">
                            {member.fullName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            DNI: {member.dni || "—"}
                            {planName && (
                              <>
                                {" · "}
                                <span className="text-primary/80">
                                  {planName}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                        {membership?.status === "ACTIVE" && (
                          <Badge
                            variant="outline"
                            className="text-[8px] border-emerald-500/30 text-emerald-400 shrink-0"
                          >
                            Activo
                          </Badge>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.memberId && (
          <p className="text-[10px] text-rose-500 font-bold uppercase">
            {errors.memberId.message}
          </p>
        )}
      </div>

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
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {changingPlan ? "Nuevo Plan" : "Plan a Adquirir"}
                </Label>
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
              <Select
                value={selectedPlanId}
                onValueChange={handlePlanChange}
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-11">
                  <SelectValue placeholder="Seleccionar plan..." />
                </SelectTrigger>
                <SelectContent className="glass-card bg-black/90 text-white">
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
            </div>
          )}
        </div>
      )}

      {/* Amount + Method Row */}
      {selectedMember && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Monto
            </Label>
            <InputGroup className="bg-white/5 border-white/10 h-11">
              <InputGroupAddon>S/.</InputGroupAddon>
              <InputGroupInput
                {...register("amount")}
                type="number"
                step="0.01"
                className="font-bold text-lg font-mono"
              />
            </InputGroup>
            {errors.amount && (
              <p className="text-[10px] text-rose-500 font-bold uppercase">
                {errors.amount.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Método de Pago
            </Label>
            <Select
              onValueChange={(v: any) => setValue("method", v)}
              defaultValue="CASH"
            >
              <SelectTrigger className="bg-white/5 border-white/10 h-10 w-full">
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
        </div>
      )}

      {/* Reference */}
      {selectedMember && (
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Referencia / N° Op. (Opcional)
          </Label>
          <Input
            {...register("reference")}
            className="bg-white/5 border-white/10 h-10"
            placeholder="Ej. 123456"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !selectedMember}
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
  );
}
