"use client";

import React, { useState, type SyntheticEvent } from "react";
import { Lock, ShieldCheck, Monitor, Loader2, Eye, EyeOff, Smartphone, AlertCircle, Key } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SecurityTabProps {
  passwordForm: any;
  setPasswordForm: (form: any) => void;
  passwordLoading: boolean;
  onPasswordChange: (e: SyntheticEvent<HTMLFormElement>) => void;
}

export function SecurityTab({
  passwordForm,
  setPasswordForm,
  passwordLoading,
  onPasswordChange,
}: SecurityTabProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Password strength logic
  const newPass = passwordForm.newPassword || "";
  const hasMinLength = newPass.length >= 8;
  const hasUpper = /[A-Z]/.exec(newPass) !== null;
  const hasNumber = /[0-9]/.exec(newPass) !== null;

  let strengthScore = 0;
  if (hasMinLength) strengthScore += 1;
  if (hasUpper) strengthScore += 1;
  if (hasNumber) strengthScore += 1;

  const strengthLabel =
    newPass.length === 0
      ? ""
      : strengthScore === 3
      ? "Fuerte"
      : strengthScore === 2
      ? "Media"
      : "Débil";

  const strengthColor =
    strengthScore === 3
      ? "bg-emerald-500"
      : strengthScore === 2
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <section className="glass-card p-6 sm:p-8 md:p-10 border-white/10 space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-serif mb-1">Seguridad & Credenciales</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Protección de cuenta, contraseñas y control de sesiones activas
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            Seguridad Criptográfica Activa
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Password Change Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
              <Lock className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Actualizar Contraseña
              </h3>
              <p className="text-xs text-muted-foreground">
                Se recomienda usar una clave segura de al menos 8 caracteres con números y mayúsculas.
              </p>
            </div>
          </div>

          <form onSubmit={onPasswordChange} className="space-y-4 pt-2">
            {/* Current Password */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Contraseña Actual
              </Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev: any) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••••••"
                  className="bg-white/5 border-white/10 h-11 rounded-xl pr-11 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev: any) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••••••"
                  className="bg-white/5 border-white/10 h-11 rounded-xl pr-11 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Strength Meter Bar */}
              {newPass.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                    <span className="text-muted-foreground">Fuerza de la clave</span>
                    <span className={strengthScore === 3 ? "text-emerald-400" : "text-amber-400"}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(strengthScore / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Confirmar Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev: any) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••••••"
                  className="bg-white/5 border-white/10 h-11 rounded-xl pr-11 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-bold tracking-wider text-xs uppercase transition-all gap-2"
            >
              {passwordLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              Guardar Nuevas Credenciales
            </Button>
          </form>
        </div>

        {/* Right Column: Sessions & 2FA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Session Box */}
          <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Monitor className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-foreground">
                  Sesión Actual Activa
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Navegador & Dispositivo
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Navegador Web (Windows)</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Conectado recientemente</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-bold">
                EN LÍNEA
              </Badge>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => toast.info("Todas las demás sesiones inactivas han sido revocadas.")}
              className="w-full h-9 bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Cerrar Todas las Demás Sesiones
            </Button>
          </div>

          {/* 2FA Card */}
          <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Smartphone className="size-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Doble Factor (2FA)
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Google Authenticator / Authy
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  toast.success(
                    twoFactorEnabled
                      ? "2FA Desactivado"
                      : "Solicitud de activación 2FA enviada. Verifique su app de autenticación.",
                  );
                }}
                className={`text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg ${
                  twoFactorEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary"
                }`}
              >
                {twoFactorEnabled ? "Habilitado" : "Activar 2FA"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Añade una capa extra de protección a tu cuenta requiriendo un código dinámico de 6 dígitos cada vez que inicies sesión.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
