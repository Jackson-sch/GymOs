"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Users, ExternalLink, ClipboardList } from "lucide-react";
import Link from "next/link";

export function TrainerRoutinesTab({ trainer }: { trainer: any }) {
  const routines = trainer.routines || [];

  if (routines.length === 0) {
    return (
      <Card className="glass-card border-white/10 p-12 text-center rounded-3xl">
        <Dumbbell className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="text-xl font-serif font-bold text-foreground">Sin Rutinas Asignadas</h3>
        <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
          Este entrenador aún no ha sido asignado como responsable de rutinas para socios del gimnasio.
        </p>
        <Button asChild className="mt-6 rounded-2xl bg-primary font-bold text-xs uppercase tracking-wider px-6">
          <Link href="/routines">Asignar Rutina a un Socio</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-fast">
      <div className="glass-card p-6 rounded-3xl border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground">Planes Prescritos por {trainer.fullName}</h3>
          <p className="text-xs text-muted-foreground">Rutinas activas y alumnos en seguimiento técnico</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-xs font-bold px-3 py-1">
          {routines.length} Planes Asignados
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routines.map((r: any) => (
          <Card key={r.id} className="glass-card border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-colors group">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[9px] uppercase font-bold px-2.5 py-0.5 mb-2">
                    Plan Activo
                  </Badge>
                  <h4 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {r.name}
                  </h4>
                </div>
                <div className="size-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                  <ClipboardList className="size-4" />
                </div>
              </div>

              <div className="p-3 bg-black/30 rounded-2xl border border-white/5 space-y-1 text-xs">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Alumno Asignado</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{r.member?.fullName || "Socio Registrado"}</p>
                  {r.member?.id && (
                    <Link
                      href={`/members/${r.member.id}`}
                      className="text-[9px] font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                    >
                      Perfil <ExternalLink className="size-2.5" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span className="font-mono text-[10px]">
                  {r.createdAt ? format(new Date(r.createdAt), "dd MMM yyyy", { locale: es }) : "N/A"}
                </span>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] uppercase text-muted-foreground">
                  {r.exercises?.length || 0} Ejercicios
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
