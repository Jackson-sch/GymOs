"use client";

import React from "react";
import { Users, ClipboardList, ChevronRight, Play, Dumbbell, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PlanCardProps {
  group: any;
  onSelect: (name: string) => void;
  onSimulate?: (group: any) => void;
}

export function PlanCard({ group, onSelect, onSimulate }: PlanCardProps) {
  const members = group.routines.map((r: any) => r.member).filter(Boolean);
  const trainerName = group.trainer || "Staff Entrenador";

  // Determine workout category badge based on plan name keywords
  const getPlanCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("fuerza") || n.includes("power") || n.includes("5x5")) {
      return { label: "Fuerza & Potencia", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
    }
    if (n.includes("hipertrofia") || n.includes("volumen") || n.includes("muscle")) {
      return { label: "Hipertrofia", color: "bg-primary/10 text-primary border-primary/30" };
    }
    if (n.includes("cardio") || n.includes("hiit") || n.includes("definicion")) {
      return { label: "Definición & HIIT", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    }
    return { label: "Acondicionamiento", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
  };

  const category = getPlanCategory(group.name);

  return (
    <div className="glass-card p-6 border-white/10 hover:border-primary/40 transition-all duration-300 group hover:-translate-y-1 bg-white/2 rounded-3xl shadow-xl flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 size-32 -mr-10 -mt-10 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/15 transition-all" />

      <div className="space-y-4 relative z-10">
        {/* Card Header: Icon + Category Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-lg">
            <ClipboardList className="size-6" />
          </div>
          <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${category.color}`}>
            {category.label}
          </Badge>
        </div>

        {/* Plan Title & Trainer */}
        <div className="space-y-1">
          <h3 className="text-xl font-serif font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {group.name}
          </h3>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
            <UserCheck className="size-3 text-primary" /> Entrenador: <span className="text-foreground font-semibold">{trainerName}</span>
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <div>
              <p className="text-xs font-bold text-foreground">{group.routines.length}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Socios</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <Dumbbell className="size-4 text-primary" />
            <div>
              <p className="text-xs font-bold text-foreground">{group.exerciseCount}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Ejercicios</p>
            </div>
          </div>
        </div>

        {/* Assigned Members Avatar Stack */}
        {members.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Asignado a:</span>
            <div className="flex items-center -space-x-2">
              {members.slice(0, 4).map((m: any, idx: number) => (
                <Avatar key={m.id || idx} className="size-6 border-2 border-background shadow-md">
                  <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
                    {m.fullName?.substring(0, 2).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members.length > 4 && (
                <span className="size-6 rounded-full bg-white/10 border-2 border-background text-[9px] font-bold flex items-center justify-center text-muted-foreground">
                  +{members.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 mt-4 relative z-10">
        <Button
          onClick={() => onSelect(group.name)}
          variant="outline"
          className="h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] uppercase font-bold tracking-wider gap-1 text-foreground"
        >
          Gestionar <ChevronRight className="size-3.5" />
        </Button>
        <Button
          onClick={() => onSimulate ? onSimulate(group) : onSelect(group.name)}
          className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] uppercase font-bold tracking-wider gap-1.5 shadow-md shadow-primary/20"
        >
          <Play className="size-3.5 fill-current" /> Simular
        </Button>
      </div>
    </div>
  );
}
