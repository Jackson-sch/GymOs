"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";

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
      tone: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "Clases Dictadas",
      value: completedClasses,
      icon: Trophy,
      tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Alumnos Únicos",
      value: uniqueMembers,
      icon: Users,
      tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    },
    {
      label: "Comisión Actual",
      value: commissionPct ? `${commissionPct}%` : "10%",
      icon: Target,
      tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="glass-card border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group backdrop-blur-md shadow-sm py-0 gap-0"
          >
            <CardContent className="p-4 flex items-center gap-3.5">
              <div
                className={cn(
                  "size-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
                  stat.tone,
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-tight text-foreground truncate">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
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
