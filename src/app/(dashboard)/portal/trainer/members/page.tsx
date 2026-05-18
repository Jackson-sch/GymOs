import React from "react";
import { getTrainerPortalDataAction } from "@/lib/actions/routine-actions";
import { verifySession } from "@/lib/security";
import { Users, Search, ChevronRight, Dumbbell, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function TrainerMembersPage() {
  await verifySession(["TRAINER", "ADMIN", "SUPER_ADMIN"]);
  const res = await getTrainerPortalDataAction();

  if (!res.success || !res.data || !('assignedMembers' in res.data)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-serif text-muted-foreground">{res.error || "Datos no encontrados"}</h2>
      </div>
    );
  }

  const assignedMembers = (res.data as any).assignedMembers || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-serif">Mis Alumnos</h1>
        <p className="text-muted-foreground">Gestiona las rutinas y el progreso de tus alumnos asignados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedMembers.map((member: any) => (
          <div key={member.id} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group relative">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="size-16 border-2 border-white/10">
                <AvatarImage src={member.photo || ""} />
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {member.fullName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{member.fullName}</h3>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                  {member.memberships[0]?.plan?.name || "Sin Membresía"}
                </p>
                <Badge variant="outline" className="mt-2 text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                  Activo
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href={`/portal/trainer/members/${member.id}`} className="w-full">
                <Button variant="outline" className="w-full h-10 rounded-xl bg-white/5 border-white/5 hover:bg-white/10 text-xs uppercase font-bold tracking-widest">
                  <Dumbbell className="size-3.5 mr-2" /> Rutinas
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-10 rounded-xl bg-white/5 border-white/5 hover:bg-white/10 text-xs uppercase font-bold tracking-widest">
                <MessageSquare className="size-3.5 mr-2" /> Contactar
              </Button>
            </div>
          </div>
        ))}

        {assignedMembers.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 glass-card border-dashed border-white/10">
            <Users className="size-12 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">No tienes alumnos asignados actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
