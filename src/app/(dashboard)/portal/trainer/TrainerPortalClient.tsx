"use client";

import React from "react";
import { 
  Users, 
  Calendar, 
  Clock, 
  ChevronRight,
  Sparkles,
  Dumbbell,
  Search,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TrainerPortalClient({ data }: { data: any }) {
  const { trainer, upcomingClasses, assignedMembers } = data;
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredMembers = assignedMembers.filter((m: any) => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Panel de Control</span>
          </div>
          <h1 className="text-5xl font-serif leading-tight">Hola, {trainer.fullName.split(' ')[0]}</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Gestiona tus clases y realiza el seguimiento de tus alumnos asignados.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="glass-card px-6 py-3 border-white/5 flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Alumnos</p>
                <p className="text-xl font-sans font-light">{data.stats.activeMembersCount}</p>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Comisiones</p>
                <p className="text-xl font-sans font-light text-emerald-500">
                  ${data.stats.projectedCommissions.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Clases Hoy</p>
                <p className="text-xl font-sans font-light">{upcomingClasses.length}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Próximas Clases */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Tus Clases</h2>
            <Link href="/portal/trainer/classes" className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline">Ver todas</Link>
          </div>

          <div className="space-y-4">
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((cls: any) => (
                <div key={cls.id} className="glass-card p-5 border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <Calendar className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{cls.name}</h3>
                        <p className="text-xs text-muted-foreground">{cls.location || "Sala Principal"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                      {cls.bookings.length} Reservas
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {format(new Date(cls.startTime), "HH:mm")} - {format(new Date(cls.endTime), "HH:mm")}
                      </div>
                    </div>
                    <Link href={`/portal/trainer/classes/${cls.id}/attendance`}>
                      <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-primary/10 hover:text-primary group-hover:translate-x-1 transition-all">
                        Pasar Lista <ChevronRight className="size-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-10 border-dashed border-white/10 text-center space-y-3">
                <Calendar className="size-8 text-muted-foreground mx-auto opacity-20" />
                <p className="text-sm text-muted-foreground">No tienes clases próximas asignadas</p>
              </div>
            )}
          </div>
        </div>

        {/* Mis Alumnos */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-serif">Mis Alumnos</h2>
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Buscar alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMembers.map((member: any) => (
              <div key={member.id} className="glass-card p-5 border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="size-12 border border-white/10">
                    <AvatarImage src={member.photo || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold uppercase">
                      {member.fullName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{member.fullName}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                      {member.memberships[0]?.plan?.name || "Sin Plan Activo"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="text-[8px] h-5 px-1.5 border-white/10 text-muted-foreground">
                    <CheckCircle2 className="size-2.5 mr-1 text-emerald-500" /> Rutina OK
                  </Badge>
                  <Badge variant="outline" className="text-[8px] h-5 px-1.5 border-white/10 text-muted-foreground">
                    Faltan Medidas
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <Button size="sm" variant="outline" className="h-8 rounded-lg bg-white/5 border-white/5 hover:bg-white/10 text-[10px] uppercase font-bold tracking-tighter">
                      <MessageSquare className="size-3 mr-1.5" /> Mensaje
                   </Button>
                   <Link href={`/portal/trainer/members/${member.id}`} className="w-full">
                     <Button size="sm" className="w-full h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] uppercase font-bold tracking-tighter border border-primary/20">
                        <Dumbbell className="size-3 mr-1.5" /> Rutina
                     </Button>
                   </Link>
                </div>
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 glass-card bg-white/5 border-dashed border-white/10">
                <Users className="size-12 text-muted-foreground opacity-20" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">No se encontraron alumnos</p>
                  <p className="text-xs text-muted-foreground">Intenta con otro nombre</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
