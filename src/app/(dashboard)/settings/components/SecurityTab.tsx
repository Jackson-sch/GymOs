"use client";

import React, { type SyntheticEvent } from "react";
import { Lock, ShieldCheck, Monitor, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  return (
    <section className="glass-card p-10 border-white/5 space-y-12 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-serif mb-1">Seguridad</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Protección de acceso y credenciales
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">
            Nivel de Seguridad: Alto
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Password Change Form */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="size-5 text-primary" />
            </div>
            <h3 className="font-serif text-xl text-foreground">
              Cambiar Contraseña
            </h3>
          </div>

          <form onSubmit={onPasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Contraseña Actual
              </Label>
              <Input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev: any) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="bg-white/5 border-white/10 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Nueva Contraseña
              </Label>
              <Input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev: any) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="bg-white/5 border-white/10 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Confirmar Nueva Contraseña
              </Label>
              <Input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev: any) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="bg-white/5 border-white/10 h-12 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 rounded-xl font-semibold tracking-widest text-xs uppercase transition-all"
            >
              {passwordLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="size-4 mr-2" />
              )}
              Actualizar Credenciales
            </Button>
          </form>
        </div>

        {/* Session & Info */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Monitor className="size-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl text-foreground">
                Sesión Actual
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Monitor className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chrome / Windows</p>
                    <p className="text-[10px] text-emerald-500 uppercase font-semibold tracking-widest">
                      En línea ahora
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                >
                  ACTIVA
                </Badge>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                <span>IP: 190.235.xxx.xxx</span>
                <span>Último acceso: Hoy</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest">
                Protección Activa
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tu cuenta está protegida con cifrado{" "}
              <span className="text-foreground font-medium">Argon2id</span>.
              Para mayor seguridad, te recomendamos cambiar tu contraseña cada
              90 días y evitar compartir tus credenciales.
            </p>
            <div className="flex gap-2 pt-2">
              <Badge
                variant="secondary"
                className="text-[9px] uppercase tracking-tighter"
              >
                Cifrado AES-256
              </Badge>
              <Badge
                variant="secondary"
                className="text-[9px] uppercase tracking-tighter"
              >
                SSL/TLS 1.3
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
