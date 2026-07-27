"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Play, Target, Calendar, User, Clock, ChevronRight } from "lucide-react";
import { RoutineSimulator } from "../../routines/components/RoutineSimulator";
import Link from "next/link";

export function MemberRoutineTab({ member }: { member: any }) {
  const [selectedRoutine, setSelectedRoutine] = useState<any>(
    member.routines?.[0] || null
  );
  const [isSimulating, setIsSimulating] = useState(false);

  const routines = member.routines || [];

  if (routines.length === 0) {
    return (
      <Card className="glass-card border-white/10 p-12 text-center">
        <Dumbbell className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="text-xl font-serif font-bold text-foreground">Sin Rutina Asignada</h3>
        <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
          Este socio aún no tiene un plan de entrenamiento prescrito. Puedes asignarle uno directamente desde el módulo de Rutinas.
        </p>
        <Button asChild className="mt-6 rounded-2xl bg-primary font-bold text-xs uppercase tracking-wider px-6">
          <Link href="/routines">Ir a Módulo de Rutinas</Link>
        </Button>
      </Card>
    );
  }

  const activeRoutine = selectedRoutine || routines[0];
  const exercises = activeRoutine.exercises || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Simulator Modal */}
      {isSimulating && (
        <RoutineSimulator
          isOpen={isSimulating}
          onClose={() => setIsSimulating(false)}
          exercises={exercises}
          planName={activeRoutine.name}
        />
      )}

      {/* Routine Selector Selector Pills */}
      {routines.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {routines.map((r: any) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoutine(r)}
              className={`px-5 py-3 rounded-2xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                activeRoutine.id === r.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <Dumbbell className="size-3.5" />
              {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Header Info */}
      <div className="glass-card p-6 rounded-3xl border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] uppercase font-bold px-3 py-1">
              Rutina Activa Prescrita
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Asignado: {new Date(activeRoutine.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{activeRoutine.name}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <User className="size-3.5 text-primary" /> Entrenador: <strong className="text-foreground font-medium">{activeRoutine.trainer?.fullName || "Staff GymOS"}</strong>
          </p>
        </div>

        <Button
          onClick={() => setIsSimulating(true)}
          disabled={exercises.length === 0}
          className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Play className="size-4 fill-current" />
          Simular Entrenamiento
        </Button>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((item: any, idx: number) => {
          const ex = item.exercise || item;
          return (
            <Card key={item.id || idx} className="glass-card border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all group">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-serif text-xs font-bold text-primary">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {ex.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        {ex.muscleGroup || "General"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-muted-foreground uppercase">
                    {item.day || "Lunes"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                    <p className="text-[8px] uppercase text-muted-foreground font-bold">Series</p>
                    <p className="text-base font-serif font-bold text-foreground">{item.sets}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                    <p className="text-[8px] uppercase text-muted-foreground font-bold">Reps</p>
                    <p className="text-base font-serif font-bold text-foreground">{item.reps}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                    <p className="text-[8px] uppercase text-muted-foreground font-bold">Descanso</p>
                    <p className="text-base font-serif font-bold text-emerald-400">60s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
