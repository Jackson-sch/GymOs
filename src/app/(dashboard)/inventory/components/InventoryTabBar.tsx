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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex bg-background/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 gap-1 w-full sm:w-auto">
        {tabs.map((tab) => (
          <button type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2 flex-1 sm:flex-none justify-center relative",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
            {tab.badge && tab.badge > 0 && activeTab !== tab.id && (
              <span className="size-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={onCreateClick}
        className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto"
      >
        <Plus className="w-4 h-4 mr-2" /> Registrar Nuevo Equipo
      </Button>
    </div>
  );
}
