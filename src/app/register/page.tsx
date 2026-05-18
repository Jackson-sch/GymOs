"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { getPublicPlansAction, registerPublicMemberAction } from "@/lib/actions/public-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Loader2, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Trophy, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Form states
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadPlans() {
      const res = await getPublicPlansAction();
      if (res.success && res.data) {
        setPlans(res.data);
      }
      setLoadingPlans(false);
    }
    loadPlans();
  }, []);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || fullName.length < 3) {
      setError("Ingresa tu nombre completo");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Ingresa un correo electrónico válido");
      return;
    }
    if (!phone || phone.length < 6) {
      setError("Ingresa un número de celular válido");
      return;
    }
    if (!dni || dni.length < 6) {
      setError("Ingresa un número de documento o DNI válido");
      return;
    }
    if (!password || password.length < 6) {
      setError("La clave de acceso debe tener al menos 6 caracteres");
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. SignUp User in Better Auth
      const { data: user, error: authErr } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      });

      if (authErr) {
        setError(authErr.message || "No se pudo crear la identidad digital. El correo podría estar en uso.");
        setLoading(false);
        return;
      }

      // 2. Call our Server Action to link Member and Membership
      const res = await registerPublicMemberAction({
        fullName,
        email,
        phone,
        dni,
        planId: selectedPlanId,
      });

      if (res.success) {
        setSuccessMsg(res.message || "¡Registro completado con éxito!");
        setStep(3);
      } else {
        setError(res.error || "Ocurrió un error al completar el registro del socio.");
      }
    } catch (err: any) {
      setError("Ocurrió un error inesperado al procesar tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background premium-gradient">
      {/* Liquid glass ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className={cn(
        "w-full glass-card p-8 sm:p-10 relative z-10 transition-all duration-500",
        step === 2 ? "max-w-4xl" : "max-w-md"
      )}>
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="bg-primary/20 p-4 rounded-3xl backdrop-blur-md border border-white/10 interactive-hover">
                <Dumbbell className="size-10 text-primary" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 size-5 text-accent animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight">
                {step === 1 && "Únete a GymOS"}
                {step === 2 && "Elige tu Plan de Éxito"}
                {step === 3 && "¡Bienvenido a la Élite!"}
              </h1>
              <p className="text-muted-foreground font-sans uppercase tracking-[0.2em] text-[10px] font-semibold">
                {step === 1 && "Paso 1 de 2: Identidad y Datos"}
                {step === 2 && "Paso 2 de 2: Membresía y Objetivos"}
                {step === 3 && "Identidad Digital Creada Exitosamente"}
              </p>
            </div>

            {step < 3 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className={cn("h-1.5 rounded-full transition-all duration-300", step >= 1 ? "w-12 bg-primary" : "w-6 bg-white/10")} />
                <div className={cn("h-1.5 rounded-full transition-all duration-300", step >= 2 ? "w-12 bg-primary" : "w-6 bg-white/10")} />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl animate-in shake duration-300">
              <p className="text-xs text-rose-500 text-center font-bold tracking-wide">{error}</p>
            </div>
          )}

          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1 font-bold">
                    Nombre Completo
                  </Label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    placeholder="Ej: Carlos Mendoza" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1 font-bold">
                      Documento de Identidad (DNI)
                    </Label>
                    <Input 
                      id="dni" 
                      type="text" 
                      placeholder="Número de DNI" 
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                      required 
                      className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1 font-bold">
                      Teléfono Móvil
                    </Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="999 888 777" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      required 
                      className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1 font-bold">
                    Correo Electrónico (Tu ID de Ingreso)
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="carlos@ejemplo.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1 font-bold">
                    Clave de Acceso Segura
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20 transition-all group duration-300" 
              >
                Continuar a Planes
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="pt-4 text-center border-t border-white/5">
                <p className="text-xs text-muted-foreground">
                  ¿Ya tienes una cuenta en GymOS?{" "}
                  <Link href="/login" className="text-primary hover:underline font-bold">
                    Inicia Sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: Plan Selection */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {loadingPlans ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cargando planes disponibles...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const isVip = /vip|premium/i.test(plan.name);
                    return (
                      <div 
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={cn(
                          "glass-card p-6 rounded-2xl relative cursor-pointer transition-all duration-300 flex flex-col justify-between group overflow-hidden border",
                          isSelected ? "border-primary bg-primary/10 shadow-2xl shadow-primary/20 scale-105" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                          isVip && !isSelected && "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                        )}
                      >
                        {isVip && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-black font-bold text-[9px] uppercase tracking-[0.2em] px-4 py-1 rounded-bl-xl flex items-center gap-1 shadow-lg">
                            <Trophy className="size-3" /> VIP
                          </div>
                        )}

                        <div className="space-y-4 mt-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">
                              {plan.category || "General"}
                            </span>
                            <h3 className="text-2xl font-serif text-white group-hover:text-primary transition-colors">{plan.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem] leading-relaxed">
                              {plan.description || "Acceso total a las instalaciones y equipamiento."}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex items-baseline gap-1">
                            <span className="text-3xl font-mono font-bold text-white">S/ {Number(plan.price).toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground font-medium">/ {plan.durationDays} días</span>
                          </div>
                        </div>

                        <div className="pt-6 mt-6">
                          <Button 
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                              isSelected ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "border-white/10 hover:bg-white/10"
                            )}
                          >
                            {isSelected ? "Plan Seleccionado" : "Elegir Plan"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/5">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="h-12 hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  <ArrowLeft className="mr-2 size-4" /> Volver a Datos
                </Button>

                <Button 
                  onClick={handleRegister}
                  disabled={loading}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider shadow-xl shadow-primary/20"
                >
                  {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <CheckCircle2 className="size-4 mr-2" />}
                  {loading ? "Creando Identidad..." : (selectedPlanId ? "Completar Registro" : "Continuar Sin Plan")}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="size-20 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20 animate-bounce">
                <ShieldCheck className="size-10" />
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-serif text-white">¡Identidad Digital Confirmada!</h3>
                <p className="text-sm text-white/70 max-w-sm mx-auto leading-relaxed">
                  {successMsg}
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 inline-block my-4">
                  <p className="text-xs text-white/60 font-mono">
                    Socio: <strong className="text-white font-sans">{fullName}</strong>
                  </p>
                  <p className="text-xs text-white/60 font-mono mt-1">
                    ID Acceso: <strong className="text-primary font-sans">{email}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={() => router.push("/login")}
                  className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-emerald-500/20 transition-all duration-300"
                >
                  Ingresar a Mi Portal
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
