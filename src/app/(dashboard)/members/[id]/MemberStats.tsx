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
  lastWeight 
}: { 
  attendancesThisMonth: number, 
  currentMembership: any, 
  lastWeight: string | number 
}) {
  const stats = [
    { label: "Asistencias Mes", value: attendancesThisMonth, icon: Calendar, color: "text-primary" },
    { label: "Plan Actual", value: currentMembership?.plan?.name || "Sin Plan", icon: CreditCard, color: "text-primary" },
    { label: "Vencimiento", value: currentMembership?.endDate ? format(new Date(currentMembership.endDate), "dd MMM", { locale: es }) : "N/A", icon: Clock, color: "text-primary" },
    { label: "Último Peso", value: lastWeight ? `${lastWeight}kg` : "---", icon: Weight, color: "text-primary" },
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
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-light tracking-tighter text-foreground/90 truncate">{stat.value}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
