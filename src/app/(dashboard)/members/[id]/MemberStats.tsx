"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, CreditCard, Clock, Weight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function MemberStats({
  attendancesThisMonth,
  currentMembership,
  lastWeight,
}: {
  attendancesThisMonth: number;
  currentMembership: any;
  lastWeight: string | number;
}) {
  const stats = [
    {
      label: "Asistencias Mes",
      value: attendancesThisMonth,
      icon: Calendar,
      tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Plan Actual",
      value: currentMembership?.plan?.name || "Sin Plan",
      icon: CreditCard,
      tone: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "Vencimiento",
      value: currentMembership?.endDate
        ? format(new Date(currentMembership.endDate), "dd MMM", { locale: es })
        : "N/A",
      icon: Clock,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      label: "Último Peso",
      value: lastWeight ? `${lastWeight} kg` : "---",
      icon: Weight,
      tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="group border-border bg-card/85 backdrop-blur-sm hover:border-primary/30 transition-colors duration-200 rounded-2xl shadow-sm py-0 gap-0"
        >
          <CardContent className="p-4 flex items-center gap-3.5">
            <div
              className={cn(
                "size-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
                stat.tone,
              )}
            >
              <stat.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-semibold tracking-tight text-foreground truncate">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                {stat.label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
