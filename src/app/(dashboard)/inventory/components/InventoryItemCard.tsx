"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dumbbell, MoreVertical, Edit, Wrench, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formats";

interface InventoryItemCardProps {
  item: any;
  status: { label: string; color: string; bg: string };
  isOverdue: boolean;
  onEdit: (item: any) => void;
  onService: (item: any) => void;
  onDelete: (id: string) => void;
}

export function InventoryItemCard({
  item,
  status,
  isOverdue,
  onEdit,
  onService,
  onDelete,
}: InventoryItemCardProps) {
  return (
    <Card className="glass-card border-white/10 overflow-hidden hover:border-primary/30 transition-colors duration-300 group relative p-0 backdrop-blur-md">
      <div className="h-56 relative overflow-hidden bg-black/40">
        {item.photo ? (
          <Image
            src={item.photo}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105 duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
            <Dumbbell className="w-20 h-20 text-primary" />
          </div>
        )}

        <div className="absolute top-4 left-4">
          <Badge
            variant="outline"
            className={cn(
              "font-bold text-[9px] tracking-wider uppercase px-3 py-1 backdrop-blur-md shadow-lg",
              status.bg,
              status.color,
            )}
          >
            {status.label}
          </Badge>
        </div>

        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-zinc-950/95 backdrop-blur-xl border-white/10 rounded-2xl p-1 shadow-2xl"
            >
              <DropdownMenuItem
                onClick={() => onEdit(item)}
                className="text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl focus:bg-primary/10 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 mr-2" /> Editar Equipo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onService(item)}
                className="text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl focus:bg-emerald-500/10 text-emerald-400 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 mr-2" /> Registrar Servicio
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl focus:bg-rose-500/10 text-rose-500 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {item.category}
            </p>
            <h3 className="text-xl font-serif font-bold text-foreground mt-1 group-hover:text-primary transition-colors">
              {item.name}
            </h3>
          </div>
          {isOverdue && (
            <Badge
              variant="outline"
              className="bg-rose-500/10 border-rose-500/30 text-rose-400 text-[8px] font-bold uppercase animate-pulse"
            >
              Vencido
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-2xl border border-white/5 text-xs">
          <div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              Último Mant.
            </p>
            <p className="font-semibold text-foreground mt-0.5">
              {item.lastMaintenance ? formatDate(item.lastMaintenance) : "Pendiente"}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              Próximo Mant.
            </p>
            <p className={cn("font-semibold mt-0.5", isOverdue ? "text-rose-400" : "text-foreground")}>
              {item.nextMaintenance ? formatDate(item.nextMaintenance) : "No programado"}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center text-xs">
          <div className="flex flex-col">
            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
              N° de Serie
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {item.serialNumber || "N/A"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onService(item)}
            className="h-8 rounded-xl border-white/10 hover:bg-white/10 text-[10px] uppercase font-bold tracking-wider"
          >
            <Wrench className="size-3 mr-1 text-primary" /> Mantenimiento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
