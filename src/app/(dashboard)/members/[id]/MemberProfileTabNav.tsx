"use client";

import React from "react";
import { User, TrendingUp, Dumbbell, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberProfileTabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MemberProfileTabNav({ activeTab, onTabChange }: MemberProfileTabNavProps) {
  return (
    <div className="flex flex-wrap bg-background/50 backdrop-blur-xl p-1.5 rounded-2xl w-fit mb-8 border border-white/10 gap-1">
      <button
        type="button"
        onClick={() => onTabChange("GENERAL")}
        className={cn(
          "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2",
          activeTab === "GENERAL"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5",
        )}
      >
        <User className="size-3.5" />
        Expediente & Membresía
      </button>
      <button
        type="button"
        onClick={() => onTabChange("PROGRESS")}
        className={cn(
          "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2",
          activeTab === "PROGRESS"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5",
        )}
      >
        <TrendingUp className="size-3.5" />
        Progreso Físico
      </button>
      <button
        type="button"
        onClick={() => onTabChange("ROUTINE")}
        className={cn(
          "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2",
          activeTab === "ROUTINE"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5",
        )}
      >
        <Dumbbell className="size-3.5" />
        Rutina Prescrita
      </button>
      <button
        type="button"
        onClick={() => onTabChange("PAYMENTS")}
        className={cn(
          "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2",
          activeTab === "PAYMENTS"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5",
        )}
      >
        <Receipt className="size-3.5" />
        Historial de Pagos
      </button>
    </div>
  );
}
