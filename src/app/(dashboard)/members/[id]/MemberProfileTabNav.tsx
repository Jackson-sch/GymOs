"use client";

import React from "react";
import { User, TrendingUp, Dumbbell, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberProfileTabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "GENERAL", label: "Expediente & Membresía", icon: User },
  { id: "PROGRESS", label: "Progreso Físico", icon: TrendingUp },
  { id: "ROUTINE", label: "Rutina Prescrita", icon: Dumbbell },
  { id: "PAYMENTS", label: "Historial de Pagos", icon: Receipt },
] as const;

export function MemberProfileTabNav({ activeTab, onTabChange }: MemberProfileTabNavProps) {
  return (
    <nav
      aria-label="Secciones del perfil del socio"
      className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-border bg-muted/30 px-4 sm:px-6 py-2"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-2",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <tab.icon className="size-3.5 shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
