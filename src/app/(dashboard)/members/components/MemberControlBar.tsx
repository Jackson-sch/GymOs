"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberForm } from "@/components/shared/forms/MemberForm";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberControlBarProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
}

export function MemberControlBar({
  statusFilter,
  onStatusFilterChange,
  isCreateOpen,
  setIsCreateOpen,
}: MemberControlBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
      {/* Status Filter Pills */}
      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar w-full sm:w-auto">
        {[
          { id: "ALL", label: "Todos los Socios" },
          { id: "ACTIVE", label: "Socios Activos" },
          { id: "INACTIVE", label: "Inactivos" },
          { id: "VIP", label: "Socios VIP" },
        ].map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => onStatusFilterChange(s.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
              statusFilter === s.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Create Member Button */}
      <div className="flex items-center justify-end shrink-0">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="size-4 mr-2" /> Registrar Nuevo Socio
          </Button>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-4xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">Registrar Nuevo Socio</DialogTitle>
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
