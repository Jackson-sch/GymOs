"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy, Users, Target } from "lucide-react";

interface TrainerStatsProps {
  classesThisWeek: any[];
  completedClasses: number;
  uniqueMembers: number;
  commissionPct: number | null;
}

export function TrainerStats({
  classesThisWeek,
  completedClasses,
  uniqueMembers,
  commissionPct,
}: TrainerStatsProps) {
  const stats = [
    {
      label: "Clases Semanales",
      value: classesThisWeek.length,
      icon: Calendar,
      badgeColor: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "Clases Dictadas",
      value: completedClasses,
      icon: Trophy,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Alumnos Únicos",
      value: uniqueMembers,
      icon: Users,
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    {
      label: "Comisión Actual",
      value: commissionPct ? `${commissionPct}%` : "10%",
      icon: Target,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="glass-card border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all group backdrop-blur-md"
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl border ${stat.badgeColor}`}>
                  <Icon className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
