"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Lock, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { createMercadoPagoPreferenceAction, getCulqiConfigAction, processCulqiChargeAction } from "@/lib/actions/online-payments-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OnlinePaymentModalProps {
  member: any;
  currentMembership: any;
  plans: any[];
}

declare global {
  interface Window {
    CulqiCheckout?: any;
    Culqi?: any;
  }
}

export function OnlinePaymentModal({ member, currentMembership, plans }: OnlinePaymentModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    currentMembership?.plan?.id || (plans?.[0]?.id ?? "")
  );
  const [gateway, setGateway] = useState<"MERCADOPAGO" | "CULQI">("MERCADOPAGO");
  const [loading, setLoading] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  useEffect(() => {
    // Cargar script de Culqi dinámicamente si no existe
    if (typeof window !== "undefined" && !document.querySelector("script[src='https://checkout.culqi.com/js/v4']")) {
      const script = document.createElement("script");
      script.src = "https://checkout.culqi.com/js/v4";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast.error("Seleccione un plan válido.");
      return;
    }

    setLoading(true);

    try {
      if (gateway === "MERCADOPAGO") {
        const result = await createMercadoPagoPreferenceAction({
          planId: selectedPlan.id,
          memberId: member.id,
        });

        if (result.success && result.initPoint) {
          toast.loading("Redirigiendo a Mercado Pago Seguro...");
          window.location.href = result.initPoint;
        } else {
          toast.error(result.error || "No se pudo iniciar el pago con Mercado Pago.");
          setLoading(false);
        }
      } else if (gateway === "CULQI") {
        const culqiConfig = await getCulqiConfigAction(selectedPlan.id);

        if (!culqiConfig.success || !culqiConfig.publicKey) {
          toast.error(culqiConfig.error || "Error inicializando Culqi.");
          setLoading(false);
          return;
        }

        if (!window.CulqiCheckout) {
          toast.error("El SDK de pago de Culqi aún no ha cargado. Por favor intente en unos segundos.");
          setLoading(false);
          return;
        }

        const culqiCheckout = new window.CulqiCheckout({
          publicKey: culqiConfig.publicKey,
          settings: {
            title: "GymOS - Club VIP",
            currency: "PEN",
            amount: culqiConfig.amount,
            description: `Membresía: ${selectedPlan.name}`,
          },
          client: {
            email: member.email || "socio@gymos.club",
          },
          options: {
            modal: true,
            style: {
              logo: "https://gymos.club/logo.png",
              maincolor: "#ec4899",
            },
          },
          token: async (token: any) => {
            toast.loading("Procesando cargo con Culqi...");
            try {
              const res = await processCulqiChargeAction({
                token: token.id,
                memberId: member.id,
                planId: selectedPlan.id,
              });

              toast.dismiss();

              if (res.success) {
                toast.success("¡Pago completado y membresía activada con éxito!");
                setOpen(false);
              } else {
                toast.error(res.error || "El pago fue declinado o no pudo ser registrado.");
              }
            } catch (err: any) {
              toast.dismiss();
              toast.error("Ocurrió un error inesperado al procesar el pago.");
            } finally {
              setLoading(false);
            }
          },
          close: () => {
            setLoading(false);
          },
        });

        culqiCheckout.open();
      }
    } catch (error: any) {
      console.error("[Payment Handler Error]", error);
      toast.error("Ocurrió un error al procesar la solicitud.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-11 rounded-xl bg-linear-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-400 border-pink-500/30 uppercase tracking-widest text-xs font-bold gap-2 shadow-lg shadow-pink-500/10 transition-all"
        >
          <Sparkles className="size-4 text-pink-400 animate-pulse" />
          Renovar / Pagar Online
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-card max-w-lg bg-black/95 text-white border-white/10 p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-pink-400 mb-1">
            <CreditCard className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Pasarela Protegida</span>
          </div>
          <DialogTitle className="text-3xl font-serif">Renovación de Membresía</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Selecciona tu plan y método de pago preferido. Todas las transacciones están encriptadas.
          </DialogDescription>
        </DialogHeader>

        {/* Selector de Planes */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
            Selecciona tu Plan
          </label>
          <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {plans.map((p) => {
              const isSelected = p.id === selectedPlanId;
              const isCurrent = currentMembership?.plan?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanId(p.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer relative overflow-hidden",
                    isSelected
                      ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/10"
                      : "bg-white/5 border-white/5 hover:border-white/20 text-muted-foreground hover:text-white"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg font-medium text-white">{p.name}</span>
                      {isCurrent && (
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 px-1.5 py-0">
                          Tu Plan Actual
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/80 line-clamp-1">{p.description || `Acceso válido por ${p.durationDays} días`}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-mono font-bold text-primary">S/ {p.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pasarela Selector */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
            Método de Pago Seguro
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGateway("MERCADOPAGO")}
              className={cn(
                "p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer",
                gateway === "MERCADOPAGO"
                  ? "bg-sky-500/20 border-sky-500 text-white shadow-lg shadow-sky-500/10"
                  : "bg-white/5 border-white/5 hover:border-white/20 text-muted-foreground"
              )}
            >
              <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <CreditCard className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">Mercado Pago</p>
                <p className="text-[10px] text-muted-foreground/80">QR, Tarjetas y Saldo</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setGateway("CULQI")}
              className={cn(
                "p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer",
                gateway === "CULQI"
                  ? "bg-pink-500/20 border-pink-500 text-white shadow-lg shadow-pink-500/10"
                  : "bg-white/5 border-white/5 hover:border-white/20 text-muted-foreground"
              )}
            >
              <div className="size-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">Culqi Perú</p>
                <p className="text-[10px] text-muted-foreground/80">Yape, Plin y Tarjetas</p>
              </div>
            </button>
          </div>
        </div>

        {/* Resumen Final */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total a pagar:</span>
            <p className="text-2xl font-mono font-bold text-white">S/ {selectedPlan?.price || "0.00"}</p>
          </div>
          <Button
            onClick={handlePayment}
            disabled={loading || !selectedPlan}
            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
            Proceder al Pago
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-mono">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>SSL Secure Encryption 256-bit</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
