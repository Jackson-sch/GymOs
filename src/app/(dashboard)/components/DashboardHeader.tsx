"use client";

import React from "react";
import { Building2, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BranchOption {
  id: string;
  name: string;
}

interface DashboardHeaderProps {
  selectedBranchId: string;
  selectedBranchName: string;
  branches: BranchOption[];
  loading: boolean;
  onBranchChange: (branchId: string) => void;
}

export function DashboardHeader({
  selectedBranchId,
  selectedBranchName,
  branches,
  loading,
  onBranchChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Sparkles className="size-4" />
          <span>Centro de Control 360°</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground tracking-tight">
          Vista General
        </h1>
        <p className="text-muted-foreground font-sans text-sm">
          Monitoreo en tiempo real para:{" "}
          <span className="text-primary font-bold">{selectedBranchName}</span>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedBranchId} onValueChange={onBranchChange}>
            <SelectTrigger className="w-full sm:w-auto h-11 px-4 rounded-2xl border-border dark:border-white/15 bg-card/90 dark:bg-zinc-950/90 text-xs font-bold text-foreground shadow-lg focus:ring-primary/30">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary shrink-0" />
                <SelectValue placeholder="Seleccionar sede..." />
              </div>
            </SelectTrigger>
            <SelectContent className="glass-card border-border dark:border-white/15 bg-popover/95 dark:bg-zinc-950/95 backdrop-blur-2xl text-foreground rounded-2xl">
              <SelectItem
                value="ALL"
                className="text-xs font-bold focus:bg-muted dark:focus:bg-white/10 cursor-pointer"
              >
                Consolidado (Todas las Sedes)
              </SelectItem>
              {branches.map((b) => (
                <SelectItem
                  key={b.id}
                  value={b.id}
                  className="text-xs font-bold focus:bg-muted dark:focus:bg-white/10 cursor-pointer"
                >
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card px-5 py-3 rounded-2xl border-white/10 bg-zinc-950/80 backdrop-blur-md flex items-center gap-3 shadow-lg shrink-0">
          <div
            className={cn(
              "size-3 rounded-full",
              loading ? "bg-amber-500 animate-spin" : "bg-emerald-500 animate-ping",
            )}
          />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              Estado Sede
            </p>
            <p className="text-xs font-bold text-foreground">
              {loading ? "Cargando métricas..." : "Sincronizado"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
