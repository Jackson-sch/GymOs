"use client";

import React from "react";
import { TrendingDown, Briefcase, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

interface ExpenseStatsCardsProps {
  currentMonthExpenses: number;
  totalExpenses: number;
  diff: number;
  topCategory: [string, number] | undefined;
}

export function ExpenseStatsCards({ currentMonthExpenses, totalExpenses, diff, topCategory }: ExpenseStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="glass-card border-white/5 relative overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <TrendingDown className="size-5" />
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold border-none",
                diff > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500",
              )}
            >
              {diff > 0 ? <ArrowUpRight className="size-3 mr-1" /> : <ArrowDownRight className="size-3 mr-1" />}
              {Math.abs(diff).toFixed(1)}% vs mes anterior
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-serif font-bold text-foreground">
              {formatCurrency(currentMonthExpenses)}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Gastos este Mes
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/5 relative overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase className="size-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-serif font-bold text-foreground">
              {topCategory ? formatCurrency(topCategory[1]) : "$0.00"}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Categoría Mayor Gasto: <span className="text-primary font-bold">{topCategory ? topCategory[0] : "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/5 relative overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
              <CalendarIcon className="size-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-serif font-bold text-foreground">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Total Histórico Registrado
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
