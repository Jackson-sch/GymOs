"use client";

import React from "react";
import { Dumbbell, Wrench, ShieldAlert, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabId = "EQUIPMENT" | "SCHEDULE" | "ALERTS";

interface InventoryTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  totalItems: number;
  overdueCount: number;
  onCreateClick: () => void;
}

export function InventoryTabBar({ activeTab, onTabChange, totalItems, overdueCount, onCreateClick }: InventoryTabBarProps) {
  const tabs: { id: TabId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "EQUIPMENT", label: `Catálogo de Equipos (${totalItems})`, icon: Dumbbell },
    { id: "SCHEDULE", label: "Cronograma Mant.", icon: Wrench },
    { id: "ALERTS", label: "Alertas & Incidentes", icon: ShieldAlert, badge: overdueCount },
  ];

  return (
    <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3">
      <div className="flex flex-wrap bg-muted/60 dark:bg-background/50 backdrop-blur-xl p-1.5 rounded-2xl border border-border/70 dark:border-white/10 gap-1.5 w-full xl:w-auto">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-3.5 sm:px-4 py-2 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center relative whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80 dark:hover:bg-white/5",
            )}
          >
            <tab.icon className="size-3.5 shrink-0" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && activeTab !== tab.id && (
              <span className="size-2 rounded-full bg-rose-500 animate-ping absolute top-1.5 right-1.5" />
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={onCreateClick}
        className="rounded-2xl h-11 px-5 shadow-lg shadow-primary/20 bg-primary font-bold text-xs uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-95 w-full xl:w-auto shrink-0"
      >
        <Plus className="w-4 h-4 mr-2 shrink-0" /> Registrar Nuevo Equipo
      </Button>
    </div>
  );
}
