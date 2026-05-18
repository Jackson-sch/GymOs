"use client";

import React from "react";
import { Users, ClipboardList, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlanCardProps {
  group: any;
  onSelect: (name: string) => void;
}

export function PlanCard({ group, onSelect }: PlanCardProps) {
  return (
    <div className="glass-card p-6 border-white/5 hover:border-primary/30 transition-all group hover:translate-y-[-4px] bg-black/20">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <ClipboardList className="size-6" />
        </div>
        <Badge variant="secondary" className="bg-white/5 border-white/10 text-[10px] uppercase font-black tracking-widest px-3">
          Configurado
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-serif tracking-tight line-clamp-1">{group.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Plan de Entrenamiento</p>
        </div>

        <div className="flex items-center gap-6 py-4 border-y border-white/5">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span className="text-sm font-medium">{group.routines.length} <span className="text-muted-foreground font-normal">socios</span></span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
            <span className="text-sm font-medium">{group.exerciseCount} <span className="text-muted-foreground font-normal">ejercicios</span></span>
          </div>
        </div>

        <button 
          onClick={() => onSelect(group.name)}
          className="w-full h-12 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-xs uppercase font-black tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all mt-2 shadow-sm"
        >
          Gestionar Plan
          <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
