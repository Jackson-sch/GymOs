"use client";

import React from "react";
import { MapPin, Users, UserCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";

interface BranchNetworkStatsProps {
  totalBranches: number;
  activeCount: number;
  totalMembers: number;
  totalAttendances: number;
  totalRevenue: number;
}

export function BranchNetworkStats({
  totalBranches,
  activeCount,
  totalMembers,
  totalAttendances,
  totalRevenue,
}: BranchNetworkStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <MapPin className="size-5" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold">
              {activeCount} Activas
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">{totalBranches} Sedes</p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">Red de Sucursales</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="size-5" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/30 uppercase font-bold">Red Global</Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">{totalMembers.toLocaleString("es-PE")}</p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">Socios Distribuidos</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <UserCheck className="size-5" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/30 uppercase font-bold">Marcaciones</Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">{totalAttendances.toLocaleString("es-PE")}</p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">Asistencias Totales</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="size-5" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold">Facturación Red</Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">Recaudación Consolidada</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
