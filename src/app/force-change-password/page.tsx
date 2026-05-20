"use client";

import React, { useState, type SyntheticEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearMustChangePasswordFlag } from "@/lib/actions/auth-actions";

export default function ForceChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (changeError) {
      setError(changeError.message || "Error al cambiar la contraseña");
      setLoading(false);
      return;
    }

    await clearMustChangePasswordFlag();

    const { data: session } = await authClient.getSession();
    const user = session?.user as any;

    if (user?.role === "MEMBER") {
      router.push("/portal");
    } else if (user?.role === "TRAINER") {
      router.push("/portal/trainer");
    } else {
      router.push("/");
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background premium-gradient">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md glass-card p-8 relative z-10">
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex flex-col items-center text-center space-y-6 mb-8">
            <div className="relative">
              <div className="bg-amber-500/20 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                <ShieldCheck className="w-10 h-10 text-amber-400" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-serif text-foreground leading-tight tracking-tight">
                Cambio de Contraseña
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm">
                Por seguridad, debes cambiar tu contraseña antes de continuar.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="h-12 bg-white/5 border-white/10 rounded-xl transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 bg-white/5 border-white/10 rounded-xl transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                  Confirmar Nueva Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 bg-white/5 border-white/10 rounded-xl transition-all placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                <p className="text-xs text-rose-500 text-center font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-sans font-semibold tracking-wide shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Cambiar Contraseña y Continuar
            </Button>

            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground/60 italic">
                La contraseña debe ser diferente a tu DNI.
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
        <span className="text-[10px] text-muted-foreground/20 font-sans tracking-[0.3em] uppercase">
          Powered by Antigravity Design System
        </span>
      </div>
    </div>
  );
}
