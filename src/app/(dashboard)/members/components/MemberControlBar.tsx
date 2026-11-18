"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberForm } from "@/components/shared/forms/MemberForm";
import { Download, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberControlBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onExportCsv: () => void;
  exportDisabled?: boolean;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
}

const FILTER_OPTIONS = [
  { id: "ALL", label: "Todos" },
  { id: "ACTIVE", label: "Activos" },
  { id: "EXPIRING", label: "Por Vencer (7d)" },
  { id: "INACTIVE", label: "Inactivos" },
  { id: "VIP", label: "VIP" },
];

export function MemberControlBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onExportCsv,
  exportDisabled,
  isCreateOpen,
  setIsCreateOpen,
}: MemberControlBarProps) {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 glass-card p-4 rounded-2xl border-border">
      {/* Unified Search + Status Filter Pills */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-1 min-w-[220px] group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar socio por nombre, DNI, correo o teléfono..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-muted/40 border-border rounded-xl text-xs focus-visible:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border shrink-0">
          {FILTER_OPTIONS.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => onStatusFilterChange(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
                statusFilter === s.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions: Export + Create Member */}
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onExportCsv}
          disabled={exportDisabled}
          title="Exportar CSV"
          aria-label="Exportar CSV"
          className="h-10 px-3 2xl:px-4 rounded-xl border-border bg-muted/40 hover:bg-muted text-xs font-bold uppercase tracking-wider gap-1.5"
        >
          <Download className="size-4 text-primary shrink-0" />
          <span className="hidden 2xl:inline">Exportar CSV</span>
        </Button>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button
            onClick={() => setIsCreateOpen(true)}
            title="Registrar Socio"
            aria-label="Registrar Socio"
            className="h-10 px-3 2xl:px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors gap-1.5"
          >
            <Plus className="size-4 shrink-0" />
            <span className="hidden 2xl:inline">Registrar Socio</span>
          </Button>
          <DialogContent className="glass-card border-border bg-popover/95 dark:bg-zinc-950/95 backdrop-blur-2xl w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">
                Registrar Nuevo Socio
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Completa los datos personales y de contacto para incorporar un miembro a GymOS.
              </DialogDescription>
            </DialogHeader>
            {isCreateOpen && <MemberForm onSuccess={() => setIsCreateOpen(false)} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
