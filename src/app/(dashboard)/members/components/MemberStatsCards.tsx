"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserPlus, AlertTriangle, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberStatsProps {
  stats: {
    totalCount: number;
    activeCount: number;
    newThisMonth: number;
    expiringCount: number;
    inactiveCount: number;
    activePct: number;
  };
  activeFilter?: string;
  onSelectFilter?: (filter: string) => void;
}

export function MemberStatsCards({ stats, activeFilter, onSelectFilter }: MemberStatsProps) {
  const cards = [
    {
      id: "ALL",
      label: "Socios Registrados",
      value: stats.totalCount,
      badge: "Total Base",
      icon: Users,
      iconTone: "bg-primary/10 border-primary/20 text-primary",
      badgeTone: "bg-primary/10 text-primary border-primary/30",
      valueTone: "text-foreground",
      clickable: true,
    },
    {
      id: "ACTIVE",
      label: "Membresías Vigentes",
      value: stats.activeCount,
      badge: `${stats.activePct}% Activos`,
      icon: UserCheck,
      iconTone: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      badgeTone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      valueTone: "text-foreground",
      clickable: true,
    },
    {
      id: "NEW",
      label: "Nuevos Registros",
      value: `+${stats.newThisMonth}`,
      badge: "Este Mes",
      icon: UserPlus,
      iconTone: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
      badgeTone: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
      valueTone: "text-sky-600 dark:text-sky-400",
      clickable: false,
    },
    {
      id: "EXPIRING",
      label: "Por Vencer",
      value: stats.expiringCount,
      badge: "7 Días Máx.",
      icon: AlertTriangle,
      iconTone: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
      badgeTone: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      valueTone: "text-amber-600 dark:text-amber-400",
      clickable: true,
    },
    {
      id: "INACTIVE",
      label: "Sin Vigencia",
      value: stats.inactiveCount,
      badge: "Inactivos",
      icon: UserX,
      iconTone: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
      badgeTone: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      valueTone: "text-foreground",
      clickable: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = card.clickable && activeFilter === card.id;

        return (
          <Card
            key={card.id}
            onClick={() => card.clickable && onSelectFilter?.(card.id)}
            className={cn(
              "glass-card border-border rounded-3xl overflow-hidden relative group backdrop-blur-md shadow-sm transition-colors py-0 gap-0",
              card.clickable && "cursor-pointer hover:border-primary/40",
              isSelected && "ring-2 ring-primary/40 border-primary/50",
            )}
          >
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className={cn("p-2 rounded-2xl border shrink-0", card.iconTone)}>
                  <Icon className="size-4" />
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-[9px] uppercase font-bold shrink-0", card.badgeTone)}
                >
                  {card.badge}
                </Badge>
              </div>
              <div>
                <p className={cn("text-2xl font-serif font-bold", card.valueTone)}>
                  {card.value}
                </p>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                  {card.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
