"use client";

import React from "react";
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

interface BranchAnalytic {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  totalMembers: number;
  totalAttendances: number;
  totalTrainers: number;
  totalRevenue: number;
}

interface BranchCardProps {
  branch: BranchAnalytic;
  revenueSharePct: number;
  onEdit: (branch: BranchAnalytic) => void;
  onDelete: (branch: BranchAnalytic) => void;
}

export function BranchCard({ branch, revenueSharePct, onEdit, onDelete }: BranchCardProps) {
  return (
    <div
      className="glass-card group relative flex flex-col justify-between p-6 md:p-8 rounded-3xl border border-white/15 bg-zinc-950/85 hover:border-primary/40 backdrop-blur-md transition-colors duration-300 shadow-xl"
    >
      {/* Branch Card Top Header */}
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0 shadow-sm">
              <Building2 className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                {branch.name}
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground font-semibold">
                slug: {branch.slug}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 border",
              branch.isActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30",
            )}
          >
            {branch.isActive ? "Activa" : "Inactiva"}
          </Badge>
        </div>

        {/* Contact Info Details */}
        <div className="space-y-2 text-xs font-semibold text-foreground/90 p-4 rounded-2xl bg-white/5 border border-white/10">
          {branch.address ? (
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-primary shrink-0" />
              <span>{branch.address}</span>
            </p>
          ) : (
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 text-muted-foreground shrink-0" />
              <span className="italic text-[11px]">Sin dirección registrada</span>
            </p>
          )}

          {branch.phone && (
            <p className="flex items-center gap-2 text-xs font-mono">
              <Phone className="size-4 text-primary shrink-0" />
              <span>{branch.phone}</span>
            </p>
          )}

          {branch.email && (
            <p className="flex items-center gap-2 text-xs">
              <Mail className="size-4 text-primary shrink-0" />
              <span className="truncate">{branch.email}</span>
            </p>
          )}
        </div>

        {/* Branch Performance Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Socios</p>
            <p className="text-xl font-serif font-bold text-foreground">{branch.totalMembers}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Asistencias</p>
            <p className="text-xl font-serif font-bold text-foreground">{branch.totalAttendances}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Facturación</p>
            <p className="text-xs font-mono font-bold text-emerald-400">
              {formatCurrency(branch.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Share of Network Revenue Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase">
            <span>Participación Red</span>
            <span className="text-primary">{revenueSharePct}% del total</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-primary rounded-full transition-colors duration-700"
              style={{ width: `${revenueSharePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Action Controls Footer */}
      <div className="flex items-center justify-end gap-2 pt-6 border-t border-white/10 mt-6">
        <Button
          onClick={() => onEdit(branch)}
          variant="outline"
          size="sm"
          className="h-9 px-4 rounded-xl text-xs font-bold gap-2 border-white/15 bg-white/5 hover:bg-white/10 text-foreground"
        >
          <Edit2 className="size-3.5 text-primary" />
          Editar Sede
        </Button>
        <Button
          onClick={() => onDelete(branch)}
          variant="outline"
          size="icon"
          className="size-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
          title="Eliminar Sede"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
