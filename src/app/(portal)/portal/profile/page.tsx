import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPortalMemberAction } from "@/lib/actions/portal-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function PortalProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const memberRes = await getPortalMemberAction();
  const member = memberRes.success ? memberRes.data : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-5xl font-serif leading-tight">Mi Perfil</h1>
        <p className="text-muted-foreground font-sans">Gestiona tu información personal y cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 glass-card p-8 border-white/5 flex flex-col items-center text-center space-y-4">
          <Avatar className="w-32 h-32 border-2 border-primary/20 p-1">
            <AvatarImage src={session?.user?.image || ""} className="rounded-full" />
            <AvatarFallback className="bg-primary/20 text-primary text-4xl font-serif">
              {session?.user?.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-serif">{session?.user?.name}</h2>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
          <div className="pt-4 border-t border-white/5 w-full">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Estado de Cuenta</p>
            <p className="text-sm font-medium mt-1">Usuario Activo</p>
          </div>
        </div>

        <div className="md:col-span-2 glass-card p-8 border-white/5 space-y-6">
          <h3 className="text-xl font-serif">Información de Socio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Nombre Completo</p>
              <p className="text-sm font-medium">{member?.fullName || "No vinculado"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Teléfono</p>
              <p className="text-sm font-medium">{member?.phone || "No especificado"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Fecha de Nacimiento</p>
              <p className="text-sm font-medium">
                {member?.birthDate ? new Date(member.birthDate).toLocaleDateString() : "No especificada"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Género</p>
              <p className="text-sm font-medium">{member?.gender || "No especificado"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
