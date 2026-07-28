"use client";

import React from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InventoryControlBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const STATUS_OPTIONS = [
  { id: "ALL", label: "Todos" },
  { id: "OPERATIONAL", label: "Operativo" },
  { id: "MAINTENANCE", label: "En Mantenimiento" },
  { id: "OUT_OF_SERVICE", label: "Fuera de Servicio" },
] as const;

export function InventoryControlBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
}: InventoryControlBarProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
      <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por equipo, categoría o N° de serie..."
            className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/40"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 w-full md:w-auto overflow-x-auto custom-scrollbar">
          {STATUS_OPTIONS.map((st) => (
            <button type="button"
              key={st.id}
              onClick={() => onStatusFilterChange(st.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
                statusFilter === st.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center gap-2 justify-end">
        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10">
          <button type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-2 rounded-xl text-xs transition-colors",
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            title="Vista Cuadrícula"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-2 rounded-xl text-xs transition-colors",
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            title="Vista Lista Tabla"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
