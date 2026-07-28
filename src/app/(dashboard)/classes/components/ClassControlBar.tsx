"use client";

import React, { type Dispatch } from "react";
import { Search, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClassForm } from "@/components/shared/forms/ClassForm";
import { TrainerForm } from "@/components/shared/forms/TrainerForm";
import { cn } from "@/lib/utils";

interface ClassesState {
  isCreateClassOpen: boolean;
  isCreateTrainerOpen: boolean;
  editingClass: any;
  selectedClassId: string | null;
  selectedDate: Date;
  mounted: boolean;
}

type ClassesAction =
  | { type: "SET_CREATE_CLASS_OPEN"; payload: boolean }
  | { type: "SET_CREATE_TRAINER_OPEN"; payload: boolean }
  | { type: "SET_EDITING_CLASS"; payload: any }
  | { type: "SET_SELECTED_CLASS"; payload: string | null }
  | { type: "SET_SELECTED_DATE"; payload: Date }
  | { type: "SET_MOUNTED" };

const STATUS_FILTERS = [
  { id: "ALL", label: "Todas" },
  { id: "SCHEDULED", label: "Programadas" },
  { id: "IN_PROGRESS", label: "En Curso" },
  { id: "COMPLETED", label: "Dictadas" },
] as const;

interface ClassControlBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dispatch: Dispatch<ClassesAction>;
  state: ClassesState;
  trainers: any[];
}

export function ClassControlBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dispatch,
  state,
  trainers,
}: ClassControlBarProps) {
  const { isCreateClassOpen, isCreateTrainerOpen } = state;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
      <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
        {/* Search Input */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar clase por nombre, instructor o sala..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-colors"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar w-full md:w-auto">
          {STATUS_FILTERS.map((s) => (
            <button type="button"
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
      </div>

      {/* Dialog Actions */}
      <div className="flex items-center gap-3 justify-end shrink-0">
        <Dialog
          open={isCreateTrainerOpen}
          onOpenChange={(val) => dispatch({ type: "SET_CREATE_TRAINER_OPEN", payload: val })}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <Plus className="size-3.5 mr-2 text-primary" /> Nuevo Entrenador
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">Staff Técnico</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Añade un nuevo instructor al equipo.
              </DialogDescription>
            </DialogHeader>
            {isCreateTrainerOpen && (
              <TrainerForm onSuccess={() => dispatch({ type: "SET_CREATE_TRAINER_OPEN", payload: false })} />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCreateClassOpen}
          onOpenChange={(val) => dispatch({ type: "SET_CREATE_CLASS_OPEN", payload: val })}
        >
          <DialogTrigger asChild>
            <Button className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
              <Plus className="size-4 mr-2" /> Programar Clase
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">Nueva Sesión Grupal</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Define el horario, aforo y entrenador para la clase dirigidos.
              </DialogDescription>
            </DialogHeader>
            {isCreateClassOpen && (
              <ClassForm
                trainers={trainers}
                onSuccess={() => dispatch({ type: "SET_CREATE_CLASS_OPEN", payload: false })}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
