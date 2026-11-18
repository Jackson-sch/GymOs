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
    monthCount: number;
    topMethod: string;
    avgTicket: number;
  };
}

export function PaymentStatsGrid({ metrics }: PaymentStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="glass-card border-border overflow-hidden relative group hover:border-emerald-500/30 transition-colors py-0 gap-0">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <DollarSign className="size-4" />
            </div>
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 uppercase font-bold"
            >
              {metrics.todayCount} Cobros Hoy
            </Badge>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              {formatCurrency(metrics.todayTotal)}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.18em] text-muted-foreground mt-1">
              Ingresos de Hoy
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border overflow-hidden relative group hover:border-primary/30 transition-colors py-0 gap-0">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <TrendingUp className="size-4" />
            </div>
            <Badge
              variant="outline"
              className="text-[10px] bg-primary/10 text-primary border-primary/25 uppercase font-bold"
            >
              {metrics.monthCount} en el Mes
            </Badge>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              {formatCurrency(metrics.monthTotal)}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.18em] text-muted-foreground mt-1">
              Ingresos este Mes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border overflow-hidden relative group hover:border-purple-500/30 transition-colors py-0 gap-0">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Smartphone className="size-4" />
            </div>
            <Badge
              variant="outline"
              className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25 uppercase font-bold"
            >
              Mayor Preferencia
            </Badge>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-serif font-bold text-foreground truncate">
              {metrics.topMethod}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.18em] text-muted-foreground mt-1">
              Método de Pago Top
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border overflow-hidden relative group hover:border-amber-500/30 transition-colors py-0 gap-0">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Receipt className="size-4" />
            </div>
            <Badge
              variant="outline"
              className="text-[10px] bg-muted/60 border-border text-muted-foreground uppercase font-bold"
            >
              Promedio Mensual
            </Badge>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              {formatCurrency(metrics.avgTicket)}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.18em] text-muted-foreground mt-1">
              Ticket Promedio
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
