"use client";

import React from "react";
import { 
  Dumbbell, 
  Activity, 
  History, 
  Info,
  Calendar,
  Weight,
  Ruler,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function TrainerMemberDetailClient({ member }: { member: any }) {
  const activeRoutine = member.routines?.[0];
  const lastMetrics = member.bodyMetrics?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Perfil Lateral */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 border-white/5 text-center space-y-4">
          <Avatar className="size-32 mx-auto border-4 border-white/10 shadow-2xl">
            <AvatarImage src={member.photo || ""} />
            <AvatarFallback className="text-4xl bg-primary/20 text-primary uppercase font-serif">
              {member.fullName.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-serif">{member.fullName}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">DNI: {member.dni}</p>
          </div>

          <div className="flex justify-center gap-2">
            <Badge variant="outline" className={cn(
              "text-[10px] uppercase tracking-tighter",
              member.memberships?.[0]?.status === "ACTIVE" 
                ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" 
                : "border-red-500/30 text-red-500 bg-red-500/5"
            )}>
              {member.memberships?.[0]?.status || "Sin Membresía"}
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-white/10">
              {member.memberships?.[0]?.plan?.name || "General"}
            </Badge>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="glass-card p-6 border-white/5 space-y-4">
          <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground flex items-center gap-2">
            <Activity className="size-3" /> Últimas Medidas
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <Weight className="size-4 text-primary mb-2" />
              <p className="text-2xl font-sans font-light">{lastMetrics?.weight || "--"} <span className="text-[10px] text-muted-foreground">kg</span></p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Peso</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <TrendingUp className="size-4 text-emerald-500 mb-2" />
              <p className="text-2xl font-sans font-light">{lastMetrics?.bodyFat || "--"} <span className="text-[10px] text-muted-foreground">%</span></p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Grasa</p>
            </div>
          </div>

          {lastMetrics?.measuredAt && (
            <p className="text-[10px] text-center text-muted-foreground/60 italic">
              Actualizado el {format(new Date(lastMetrics.measuredAt), "PP", { locale: es })}
            </p>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="lg:col-span-8">
        <Tabs defaultValue="routine" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-full sm:w-auto h-auto grid grid-cols-2">
            <TabsTrigger value="routine" className="rounded-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Dumbbell className="size-4 mr-2" /> Rutina Activa
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="size-4 mr-2" /> Progreso Físico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routine" className="space-y-6">
            {activeRoutine ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif">{activeRoutine.name}</h3>
                    <p className="text-xs text-muted-foreground">{activeRoutine.description || "Sin descripción"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeRoutine.exercises.map((item: any, idx: number) => (
                    <div key={item.id} className="glass-card p-4 border-white/5 flex items-center gap-4 hover:border-white/10 transition-all group">
                      <div className="size-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                        {item.exercise.demoUrl ? (
                          <img src={item.exercise.demoUrl} alt={item.exercise.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Dumbbell className="size-6" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary tabular-nums">#{idx + 1}</span>
                          <h4 className="font-medium text-sm truncate">{item.exercise.name}</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{item.exercise.muscleGroup}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-sans font-light tabular-nums leading-none">
                          {item.sets} <span className="text-[10px] text-muted-foreground font-sans">x</span> {item.reps}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-1">{item.rest || "60s"} descanso</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 border-dashed border-white/10 text-center space-y-4">
                <Dumbbell className="size-10 text-muted-foreground mx-auto opacity-20" />
                <div className="space-y-1">
                  <p className="text-lg font-serif">Sin Rutina Activa</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Este alumno no tiene una rutina asignada actualmente o la que tiene está inactiva.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl bg-primary/5 border-primary/20 text-primary">
                  Crear Primera Rutina
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.bodyMetrics.map((metric: any) => (
                  <div key={metric.id} className="glass-card p-5 border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{format(new Date(metric.measuredAt), "PP", { locale: es })}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Peso: {metric.weight}kg | Grasa: {metric.bodyFat}%</p>
                    </div>
                    <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <TrendingUp className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
             </div>
             
             {member.bodyMetrics.length === 0 && (
               <div className="glass-card p-12 border-dashed border-white/10 text-center space-y-4">
                  <Ruler className="size-10 text-muted-foreground mx-auto opacity-20" />
                  <p className="text-sm text-muted-foreground">No hay registros antropométricos todavía</p>
               </div>
             )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
