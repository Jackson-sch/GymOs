"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserPlus, AlertTriangle, UserX } from "lucide-react";

interface MemberStatsProps {
  stats: {
    totalCount: number;
    activeCount: number;
    newThisMonth: number;
    expiringCount: number;
    inactiveCount: number;
    activePct: number;
  };
}

export function MemberStatsCards({ stats }: MemberStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <Users className="size-4" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30 uppercase font-bold">
              Total Base
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-foreground">
              {stats.totalCount}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Socios Registrados
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UserCheck className="size-4" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold">
              {stats.activePct}% Activos
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-foreground">
              {stats.activeCount}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Membresías Vigentes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <UserPlus className="size-4" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-sky-500/10 text-sky-400 border-sky-500/30 uppercase font-bold">
              Este Mes
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-sky-400">
              +{stats.newThisMonth}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Nuevos Registros
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30 uppercase font-bold">
              7 Días Máx.
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-amber-400">
              {stats.expiringCount}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Por Vencer
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <UserX className="size-4" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-400 border-rose-500/30 uppercase font-bold">
              Inactivos
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-foreground">
              {stats.inactiveCount}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Pendientes Renovación
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
