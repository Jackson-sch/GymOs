"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainerProfileHeaderProps {
  activeTab: "GENERAL" | "ROUTINES" | "PAYROLL" | string;
  onTabChange: (tab: "GENERAL" | "ROUTINES" | "PAYROLL") => void;
}

export function TrainerProfileHeader({ activeTab, onTabChange }: TrainerProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-4">
        <Link
          href="/trainers"
          className="size-10 flex items-center justify-center rounded-full border border-border/10 bg-secondary/20 hover:bg-secondary/40 transition-colors hover:scale-110 group"
        >
          <ArrowLeft className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
              Dashboard
            </span>
            <div className="size-1 rounded-full bg-border/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              Entrenador
            </span>
          </div>
          <h2 className="text-xl font-light tracking-tight">Gestión de Personal</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-background/50 backdrop-blur-xl p-1 rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => onTabChange("GENERAL")}
          className={cn(
            "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors",
            activeTab === "GENERAL"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5",
          )}
        >
          Información General
        </button>
        <button
          type="button"
          onClick={() => onTabChange("ROUTINES")}
          className={cn(
            "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors",
            activeTab === "ROUTINES"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5",
          )}
        >
          Rutinas & Alumnos
        </button>
        <button
          type="button"
          onClick={() => onTabChange("PAYROLL")}
          className={cn(
            "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors",
            activeTab === "PAYROLL"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5",
          )}
        >
          Nómina & Comisiones
        </button>
      </div>
    </div>
  );
}
