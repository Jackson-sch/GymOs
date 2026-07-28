"use client";

import React from "react";
import { Calendar as CalendarIcon, Clock, Users, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClassStats {
  todayCount: number;
  totalBookings: number;
  occupancyRate: number;
  totalMins: number;
  trainersCount: number;
}

export function ClassStatsGrid({ stats }: { stats: ClassStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glass-card border-white/10 overflow-hidden relative group backdrop-blur-md">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <CalendarIcon className="size-5" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30 uppercase font-bold">
              Para esta fecha
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {stats.todayCount} Clases
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Programadas Hoy
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10 overflow-hidden relative group backdrop-blur-md">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="size-5" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold">
              {stats.occupancyRate}% Ocupación
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {stats.totalBookings} Alumnos
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Reservas Confirmadas
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10 overflow-hidden relative group backdrop-blur-md">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <UserCheck className="size-5" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/30 uppercase font-bold">
              Staff Activo
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {stats.trainersCount} Entrenadores
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Instructores Disponibles
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10 overflow-hidden relative group backdrop-blur-md">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="size-5" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30 uppercase font-bold">
              Tiempo Total
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {stats.totalMins} Min
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Horas de Entrenamiento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
