"use client";

import React from "react";
import {
  AlertTriangle,
  Calendar,
  CreditCard,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

interface DashboardKpisProps {
  stats: any;
  loading: boolean;
}

export function DashboardKpis({ stats, loading }: DashboardKpisProps) {
  const kpis = [
    {
      label: "Socios Activos",
      value: stats?.totalMembers ?? "...",
      icon: Users,
      trend: stats?.activeTrend ?? "...",
      badgeColor:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Ingresos del Mes",
      value: stats?.revenue !== undefined ? formatCurrency(stats.revenue) : "...",
      icon: CreditCard,
      trend: stats?.revenueTrend ?? "...",
      badgeColor: "bg-primary/10 text-primary border-primary/30",
    },
    {
      label: "Asistencia Hoy",
      value: stats?.attendanceToday ?? "...",
      icon: UserCheck,
      trend: "En Vivo",
      badgeColor:
        "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
    },
    {
      label: "Nuevos Socios (Mes)",
      value: stats?.newMembers !== undefined ? `+${stats.newMembers}` : "...",
      icon: TrendingUp,
      trend: stats?.newMemberTrend ?? "...",
      badgeColor:
        "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    },
    {
      label: "Por Vencer (7 Días)",
      value: stats?.expiringMemberships ?? "...",
      icon: AlertTriangle,
      trend: "Atención",
      badgeColor:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    },
    {
      label: "Clases Hoy",
      value: stats?.classesToday ?? "...",
      icon: Calendar,
      trend: "Programadas",
      badgeColor:
        "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.label}
            className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 hover:border-primary/40 transition-colors shadow-xl py-0 gap-0"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-primary shrink-0">
                  <Icon className="size-4" />
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-bold uppercase px-2 py-0.5 shrink-0",
                    kpi.badgeColor,
                  )}
                >
                  {kpi.trend}
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                  {loading ? "..." : kpi.value}
                </p>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                  {kpi.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
