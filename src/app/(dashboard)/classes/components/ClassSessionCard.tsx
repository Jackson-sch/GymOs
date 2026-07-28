"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Clock, MapPin, MoreVertical, Edit2, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/formats";

interface ClassSessionCardProps {
  session: any;
  mounted: boolean;
  onSelect: (id: string) => void;
  onEdit: (session: any) => void;
  onDelete: (id: string) => void;
}

export function ClassSessionCard({
  session,
  mounted,
  onSelect,
  onEdit,
  onDelete,
}: ClassSessionCardProps) {
  const bookingsCount = session._count?.bookings || 0;
  const maxCap = session.maxCapacity || 1;
  const pct = Math.min(100, Math.round((bookingsCount / maxCap) * 100));

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(session.id);
        }
      }}
      onClick={() => onSelect(session.id)}
      className="glass-card group overflow-hidden border-white/15 hover:border-primary/40 bg-zinc-950/80 backdrop-blur-md rounded-3xl flex flex-col md:flex-row relative cursor-pointer transition-colors duration-300 shadow-xl"
    >
      {/* Actions Dropdown */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-xl hover:bg-white/10 text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-2xl"
          >
            <DropdownMenuItem
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session);
              }}
            >
              <Edit2 className="size-3 text-primary" /> Editar Sesión
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-rose-500/20 text-rose-400 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
            >
              <Trash2 className="size-3" /> Cancelar Clase
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Time Column */}
      <div className="bg-white/5 p-6 md:w-36 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 shrink-0">
        <p className="text-3xl font-serif font-bold text-foreground leading-none mb-1.5">
          {mounted ? formatTime(new Date(session.startTime), "HH:mm") : "--:--"}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-primary font-mono font-bold">
          {mounted ? formatDate(new Date(session.startTime), "aaaa") : "..."}
        </p>
      </div>

      {/* Session Details Column */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 pr-8">
            <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
              {session.name}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5",
                session.status === "COMPLETED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : session.status === "IN_PROGRESS"
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                  : "bg-primary/10 text-primary border-primary/30",
              )}
            >
              {session.status === "COMPLETED"
                ? "Dictada"
                : session.status === "IN_PROGRESS"
                ? "En Curso"
                : "Programada"}
            </Badge>
          </div>

          {/* Technical Indicators */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground/90">
              <Users className="size-3.5 text-primary shrink-0" />
              <span>
                {bookingsCount} / {maxCap} Cupos
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/90">
              <Clock className="size-3.5 text-primary shrink-0" />
              <span>{session.durationMins} Minutos</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/90">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span>{session.location || "Sala Principal"}</span>
            </div>
          </div>
        </div>

        {/* Capacity Meter Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Aforo Reservado</span>
            <span className={cn(pct >= 90 ? "text-rose-400 font-bold" : "text-emerald-400")}>
              {pct}% ({bookingsCount}/{maxCap})
            </span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className={cn(
                "h-full rounded-full transition-colors duration-500",
                pct >= 90
                  ? "bg-rose-500"
                  : pct >= 70
                  ? "bg-amber-500"
                  : "bg-primary",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Trainer Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs overflow-hidden relative shrink-0">
              {session.trainer?.photo ? (
                <Image
                  src={session.trainer.photo}
                  alt={session.trainer?.fullName || "Trainer"}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                (session.trainer?.fullName?.[0] || "T")
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground leading-tight">
                {session.trainer?.fullName || "Instructor Sin Asignar"}
              </p>
              <p className="text-[10px] text-muted-foreground">Entrenador Sede</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-primary text-xs font-bold group-hover:translate-x-1 transition-transform">
            <span>Ver Asistentes</span>
            <ChevronRight className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
