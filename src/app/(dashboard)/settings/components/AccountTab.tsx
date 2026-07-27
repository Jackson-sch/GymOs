"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ShieldCheck, UserCheck, KeyRound, Loader2, Save, Mail, ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface AccountTabProps {
  user: any;
}

export function AccountTab({ user }: AccountTabProps) {
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authClient.updateUser({ name });
      toast.success("Perfil de administrador actualizado correctamente.");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar perfil.");
    }
    setSaving(false);
  };

  const userRole = user?.role || "SUPER_ADMIN";

  const rolePermissions = [
    "Acceso Total a Configuración & Canales API",
    "Gestión Completa de Socios y Membresías",
    "Cierre e Historial de Caja & Pagos",
    "Apertura Remota de Molinetes y Accesos",
    "Auditoría y Registros de Sesión",
  ];

  return (
    <section className="glass-card p-6 sm:p-8 md:p-10 border-white/10 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-serif mb-1">Mi Cuenta & Perfil Admin</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Gestión de perfil personal, foto y privilegios administrativos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-3 py-1 gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Cuenta Verificada
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Avatar Column */}
        <div className="lg:col-span-4 space-y-4 flex flex-col items-center lg:items-start">
          <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Fotografía de Perfil
          </Label>
          <div className="w-full max-w-[220px]">
            <ImageUpload
              value={user?.image || ""}
              onChange={async (url) => {
                await authClient.updateUser({ image: url });
                toast.success("Foto de perfil actualizada");
              }}
              onRemove={async () => {
                await authClient.updateUser({ image: "" });
                toast.success("Foto de perfil eliminada");
              }}
              className="w-full aspect-square rounded-3xl"
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center lg:text-left">
            Formatos JPG o PNG. Tamaño máximo recomendado 2MB.
          </p>
        </div>

        {/* Right: Personal Details Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <UserCheck className="size-3.5 text-muted-foreground" /> Nombre Completo
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del administrador"
                className="bg-white/5 border-white/10 h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Mail className="size-3.5 text-muted-foreground" /> Correo Electrónico (Principal)
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-mono opacity-60 cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground">
                El correo electrónico de cuenta solo puede ser modificado por el Super Admin.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <KeyRound className="size-3.5 text-muted-foreground" /> Rol y Privilegios en GymOS
              </Label>
              <div>
                <Badge
                  variant="outline"
                  className="px-4 py-1.5 border-primary/40 text-primary bg-primary/10 rounded-xl font-bold tracking-widest text-xs uppercase"
                >
                  {userRole}
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-6 gap-2"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Guardar Cambios de Perfil
              </Button>
            </div>
          </form>

          {/* Role Permissions Summary Box */}
          <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground border-b border-white/5 pb-2">
              <ShieldAlert className="size-3.5 text-primary" /> Permisos Habilitados para {userRole}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              {rolePermissions.map((perm, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-muted-foreground">
        <ShieldCheck className="size-4 text-primary shrink-0" />
        <p className="text-[11px] uppercase tracking-widest font-medium">
          Cuenta respaldada por la arquitectura de seguridad y encriptación de GymOS Platform.
        </p>
      </div>
    </section>
  );
}
