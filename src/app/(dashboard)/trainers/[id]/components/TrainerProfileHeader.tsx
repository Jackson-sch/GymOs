"use client";

import React from "react";
import { User, Dumbbell, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainerProfileHeaderProps {
  activeTab: "GENERAL" | "ROUTINES" | "PAYROLL" | string;
  onTabChange: (tab: "GENERAL" | "ROUTINES" | "PAYROLL") => void;
}

const TABS: Array<{
  id: "GENERAL" | "ROUTINES" | "PAYROLL";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "GENERAL", label: "Información General", icon: User },
  { id: "ROUTINES", label: "Rutinas & Alumnos", icon: Dumbbell },
  { id: "PAYROLL", label: "Nómina & Comisiones", icon: Wallet },
];

export function TrainerProfileHeader({ activeTab, onTabChange }: TrainerProfileHeaderProps) {
  return (
    <nav
      aria-label="Secciones del perfil del entrenador"
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
              "shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2",
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
