"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface AccountTabProps {
  user: any;
}

export function AccountTab({ user }: AccountTabProps) {
  return (
    <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-serif mb-1">Mi Cuenta</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Información personal y perfil de administrador
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4 space-y-4">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Foto de Perfil
          </Label>
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
            className="w-full aspect-square"
          />
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Nombre Completo
              </Label>
              <Input
                value={user?.name || ""}
                disabled
                className="bg-white/5 border-white/10 h-12 rounded-xl opacity-70"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Correo Electrónico
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-white/5 border-white/10 h-12 rounded-xl opacity-70"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Rol en el Sistema
              </Label>
              <div className="flex">
                <Badge
                  variant="outline"
                  className="px-4 py-2 border-primary/20 text-primary bg-primary/5 rounded-lg font-bold tracking-widest text-[10px]"
                >
                  {(user as any)?.role || "ADMIN"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex items-center gap-3 text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" />
        <p className="text-[10px] uppercase tracking-widest">
          Tu cuenta está protegida por políticas de acceso administrativo de
          GymOS.
        </p>
      </div>
    </section>
  );
}
