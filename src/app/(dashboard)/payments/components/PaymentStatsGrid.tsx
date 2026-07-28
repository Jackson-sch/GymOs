"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Smartphone, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/formats";

interface PaymentStatsGridProps {
  metrics: {
    todayTotal: number;
    todayCount: number;
    monthTotal: number;
    topMethod: string;
    avgTicket: number;
  };
}

export function PaymentStatsGrid({ metrics }: PaymentStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glass-card border-white/5 overflow-hidden relative group">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="size-5" />
            </div>
            <Badge
              variant="outline"
              className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold"
            >
              {metrics.todayCount} Cobros Hoy
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {formatCurrency(metrics.todayTotal)}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Ingresos de Hoy
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/5 overflow-hidden relative group">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <TrendingUp className="size-5" />
            </div>
            <Badge
              variant="outline"
              className="text-[9px] bg-primary/10 text-primary border-primary/30 uppercase font-bold"
            >
              Mes en Curso
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {formatCurrency(metrics.monthTotal)}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Ingresos este Mes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/5 overflow-hidden relative group">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Smartphone className="size-5" />
            </div>
            <Badge
              variant="outline"
              className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/30 uppercase font-bold"
            >
              Mayor Preferencia
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {metrics.topMethod}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Método de Pago Top
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/5 overflow-hidden relative group">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Receipt className="size-5" />
            </div>
            <Badge
              variant="outline"
              className="text-[9px] bg-white/5 border-white/10 text-muted-foreground uppercase font-bold"
            >
              Promedio / Socio
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {formatCurrency(metrics.avgTicket)}
            </p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
              Ticket Promedio
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
