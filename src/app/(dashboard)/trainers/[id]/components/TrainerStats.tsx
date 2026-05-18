"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy, Users, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainerStatsProps {
  classesThisWeek: any[];
  completedClasses: number;
  uniqueMembers: number;
  commissionPct: number | null;
}

export function TrainerStats({ classesThisWeek, completedClasses, uniqueMembers, commissionPct }: TrainerStatsProps) {
  const stats = [
    { label: "Clases Semanales", value: classesThisWeek.length, icon: Calendar, color: "text-primary" },
    { label: "Clases Dictadas", value: completedClasses, icon: Trophy, color: "text-primary" },
    { label: "Alumnos Únicos", value: uniqueMembers, icon: Users, color: "text-primary" },
    { label: "Comisión Actual", value: commissionPct ? `${commissionPct}%` : "0%", icon: Target, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat) => (
        <Card key={stat.label} className="group hover:border-primary/20 transition-all duration-500 border-border/10 bg-secondary/20 backdrop-blur-sm overflow-hidden border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl bg-background/50 border border-border/20 group-hover:border-primary/40 transition-colors", stat.color)}>
                <stat.icon className="size-5" />
              </div>
              <Zap className="size-4 text-primary opacity-0 group-hover:opacity-20 transition-all duration-700 -translate-y-2 group-hover:translate-y-0" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-light tracking-tighter text-foreground/90">{stat.value}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
