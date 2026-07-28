"use client";

import React, { useState } from "react";
import {
  Dumbbell,
  CheckCircle2,
  Sparkles,
  CreditCard,
  User,
  Mail,
  Phone,
  Lock,
  IdCard,
  MapPin,
  Loader2,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { processPublicSelfRegistrationAction } from "@/lib/actions/public-checkout-actions";
import { JoinPlanSelector } from "./components/JoinPlanSelector";
import Link from "next/link";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Plan {
  id: string;
  name: string;
  price: any;
  durationDays: number;
  description?: string | null;
  features?: any;
}

interface Branch {
  id: string;
  name: string;
  address?: string | null;
}

interface PublicOrganization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  plans: any[];
  branches: any[];
}

export function JoinClient({ organization }: { organization: PublicOrganization }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    organization.plans?.[0] || null
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    organization.branches?.[0]?.id || ""
  );

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dni: "",
    password: "",
    paymentMethod: "CARD" as "CARD" | "YAPE" | "PLIN" | "TRANSFER" | "CULQI" | "MERCADOPAGO",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    member: any;
    membership: any;
    tempPassword?: string;
  } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      toast.error("Por favor selecciona un plan de membresía");
      return;
    }
    if (!form.fullName || !form.email || !form.phone) {
      toast.error("Por favor completa tus datos personales");
      return;
    }

    setSubmitting(true);
    const res = await processPublicSelfRegistrationAction({
      slug: organization.slug,
      planId: selectedPlan.id,
      branchId: selectedBranchId || undefined,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      dni: form.dni,
      password: form.password,
      paymentMethod: form.paymentMethod,
    });
    setSubmitting(false);

    if (res.success && res.data) {
      toast.success(res.message);
      setSuccessData(res.data);
      setStep(3);
    } else {
      toast.error(res.error || "Error al procesar la inscripción");
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-background premium-gradient flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 border-white/10 text-center space-y-6 animate-zoom-in-95">
          <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-900/30">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-foreground">
              ¡Inscripción Exitosa!
            </h2>
            <p className="text-xs text-muted-foreground">
              Tu membresía en <span className="text-primary font-bold">{organization.name}</span> ha sido activada en tiempo real.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="text-muted-foreground font-semibold">Socio:</span>
              <span className="font-bold text-foreground">{successData.member.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="text-muted-foreground font-semibold">Plan Activado:</span>
              <span className="font-bold text-primary">{selectedPlan?.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Acceso PWA Portal:</span>
              <span className="font-mono text-xs text-emerald-400">{form.email}</span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Button asChild className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              <Link href="/login">
                Iniciar Sesión en Portal de Alumno
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background premium-gradient flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden relative">
            {organization.logo ? (
              <Image src={organization.logo} alt={organization.name} fill className="object-cover" sizes="40px" />
            ) : (
              <Dumbbell className="size-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">{organization.name}</h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3 text-primary" /> Inscripción & Pago Seguro Online
            </p>
          </div>
        </div>

        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors">
          ¿Ya tienes cuenta? Inicia Sesión
        </Link>
      </header>

      {/* Form Container */}
      <main className="max-w-4xl w-full mx-auto my-8 space-y-8 animate-fade-in">
        {/* Step Stepper */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
            <span className={`size-6 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-white/10"}`}>1</span>
            Elige tu Plan
          </div>
          <span className="w-8 h-px bg-white/10" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
            <span className={`size-6 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-white/10"}`}>2</span>
            Tus Datos & Pago
          </div>
        </div>

        {step === 1 ? (
          <JoinPlanSelector
            plans={organization.plans}
            branches={organization.branches}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={setSelectedBranchId}
            onContinue={() => setStep(2)}
          />
        ) : (
          <form onSubmit={handleRegister} className="glass-card p-8 border-white/10 space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold transition-colors mb-1"
                >
                  <ChevronLeft className="size-4" /> Cambiar Plan
                </button>
                <h2 className="text-xl font-serif font-bold">Datos Personales & Pago</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold">Plan Elegido</p>
                <p className="text-sm font-bold text-primary">{selectedPlan?.name} (S/ {Number(selectedPlan?.price).toFixed(2)})</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">
                  Nombre Completo *
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Ej. María Elena Torres"
                    className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">
                    Correo Electrónico *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="maria@gmail.com"
                      className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">
                    Teléfono celular *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+51 987 654 321"
                      className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">
                    DNI / Documento (Opcional)
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={form.dni}
                      onChange={(e) => setForm((p) => ({ ...p, dni: e.target.value }))}
                      placeholder="76543210"
                      className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">
                    Contraseña para Portal PWA
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Crea tu contraseña segura"
                      className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">
                  Método de Pago Seguro
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "CARD", label: "Tarjeta", icon: CreditCard },
                    { id: "YAPE", label: "Yape", icon: Sparkles },
                    { id: "PLIN", label: "Plin", icon: Sparkles },
                    { id: "TRANSFER", label: "Transferencia", icon: IdCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSel = form.paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, paymentMethod: m.id as any }))}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors ${
                          isSel
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        <Icon className="size-4" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-wide shadow-xl shadow-primary/25 hover:bg-primary/90 transition-colors"
            >
              {submitting ? (
                <Loader2 className="size-5 animate-spin gap-2" />
              ) : (
                `Pagar y Activar Membresía (S/ ${Number(selectedPlan?.price).toFixed(2)})`
              )}
            </Button>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-6 border-t border-white/10 text-center text-xs text-muted-foreground">
        Powered by <span className="font-bold text-primary">GymOS Enterprise Multi-Tenant</span> &copy; 2026
      </footer>
    </div>
  );
}
