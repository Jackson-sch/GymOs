"use client";

import { TrendingUp, Users, Calendar, AlertCircle } from "lucide-react";

interface KpiProps {
  title: string;
  value: string | number;
  sub: string;
  accent: "emerald" | "violet" | "amber" | "rose";
  isGrowth?: boolean;
  revenueGrowth?: string;
  icon: React.ReactNode;
}

export function KpiCards({ kpis }: { kpis: any }) {
  const cards: KpiProps[] = [
    { 
      title: "Miembros activos", 
      value: kpis.activeMembers, 
      sub: `+${kpis.newMembersThisMonth} este mes`,
      accent: "emerald",
      icon: <Users className="size-4" />
    },
    { 
      title: "Ingresos del mes", 
      value: `S/ ${kpis.revenueThisMonth?.toLocaleString()}`, 
      sub: `${Number(kpis.revenueGrowth) >= 0 ? "+" : ""}${kpis.revenueGrowth}% vs mes anterior`,
      accent: "violet",
      isGrowth: true,
      icon: <TrendingUp className="size-4" />
    },
    { 
      title: "Asistencia hoy", 
      value: kpis.attendanceToday, 
      sub: `${kpis.attendanceThisWeek} esta semana`,
      accent: "amber",
      icon: <Calendar className="size-4" />
    },
    { 
      title: "Por vencer", 
      value: kpis.expiringThisWeek, 
      sub: "Próximos 7 días",
      accent: "rose",
      icon: <AlertCircle className="size-4" />
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((kpi) => (
        <div key={kpi.title} className="glass-card p-8 premium-gradient relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-500">
          <div className={`absolute top-0 right-0 size-32 -mr-12 -mt-12 bg-${kpi.accent}-500/10 blur-3xl rounded-full transition-all duration-700 group-hover:scale-150 group-hover:bg-${kpi.accent}-500/20`} />
          
          <div className="flex items-center justify-between mb-6">
            <div className={`p-2.5 rounded-xl bg-${kpi.accent}-500/10 border border-${kpi.accent}-500/20 text-${kpi.accent}-500`}>
              {kpi.icon}
            </div>
            {kpi.isGrowth && (
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${Number(kpis.revenueGrowth) >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                {Number(kpis.revenueGrowth) >= 0 ? "↑" : "↓"} {Math.abs(Number(kpis.revenueGrowth))}%
              </div>
            )}
          </div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-2">
            {kpi.title}
          </p>
          
          <div className="space-y-1 relative z-10">
            <h3 className="text-4xl font-serif tracking-tight">{kpi.value}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${kpi.accent === "emerald" ? "text-emerald-500" : kpi.accent === "rose" ? "text-rose-500" : "text-muted-foreground/60"}`}>
              {kpi.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

