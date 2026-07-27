"use client";

import React from "react";
import { TrendingUp, Users, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiProps {
  title: string;
  value: string | number;
  sub: string;
  accent: "emerald" | "violet" | "amber" | "rose";
  isGrowth?: boolean;
  revenueGrowth?: string;
  icon: React.ReactNode;
  sparkline: number[];
}

export function KpiCards({ kpis }: { kpis: any }) {
  const cards: KpiProps[] = [
    {
      title: "Miembros activos",
      value: kpis.activeMembers,
      sub: `+${kpis.newMembersThisMonth || 0} este mes`,
      accent: "emerald",
      icon: <Users className="size-4" />,
      sparkline: [65, 70, 68, 75, 82, 88, 95],
    },
    {
      title: "Ingresos del mes",
      value: `S/ ${kpis.revenueThisMonth?.toLocaleString() || 0}`,
      sub: `${Number(kpis.revenueGrowth) >= 0 ? "+" : ""}${kpis.revenueGrowth || 0}% vs mes anterior`,
      accent: "violet",
      isGrowth: true,
      icon: <TrendingUp className="size-4" />,
      sparkline: [40, 55, 45, 60, 75, 85, 92],
    },
    {
      title: "Asistencia hoy",
      value: kpis.attendanceToday || 0,
      sub: `${kpis.attendanceThisWeek || 0} esta semana`,
      accent: "amber",
      icon: <Calendar className="size-4" />,
      sparkline: [20, 35, 30, 45, 40, 50, 60],
    },
    {
      title: "Por vencer (7 días)",
      value: kpis.expiringThisWeek || 0,
      sub: "Renovación recomendada",
      accent: "rose",
      icon: <AlertCircle className="size-4" />,
      sparkline: [12, 15, 10, 18, 14, 16, 20],
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((kpi) => {
        const isPositive = Number(kpis.revenueGrowth || 0) >= 0;

        return (
          <div
            key={kpi.title}
            className="glass-card p-6 rounded-3xl border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 backdrop-blur-md flex flex-col justify-between"
          >
            {/* Background Glow */}
            <div
              className={`absolute top-0 right-0 size-32 -mr-12 -mt-12 bg-${kpi.accent}-500/10 blur-3xl rounded-full transition-all duration-700 group-hover:scale-150 group-hover:bg-${kpi.accent}-500/20`}
            />

            <div>
              {/* Header Icon + Growth Badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2.5 rounded-2xl bg-${kpi.accent}-500/10 border border-${kpi.accent}-500/30 text-${kpi.accent}-400 shadow-lg`}
                >
                  {kpi.icon}
                </div>
                {kpi.isGrowth && (
                  <div
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownRight className="size-3" />
                    )}
                    {Math.abs(Number(kpis.revenueGrowth || 0))}%
                  </div>
                )}
              </div>

              {/* Title & Value */}
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">
                {kpi.title}
              </p>
              <h3 className="text-3xl font-serif font-bold tracking-tight text-foreground">
                {kpi.value}
              </h3>
            </div>

            {/* Sparkline & Subtext */}
            <div className="pt-4 mt-2 border-t border-white/5 flex items-end justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {kpi.sub}
              </p>

              {/* Sparkline Visualization */}
              <div className="flex items-end gap-1 h-6 shrink-0">
                {kpi.sparkline.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-primary/40 rounded-full group-hover:bg-primary transition-colors"
                    style={{ height: `${(val / 100) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
