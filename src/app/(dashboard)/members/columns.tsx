"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Crown
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

import { type MemberStatus } from "@prisma/client";

interface ColumnsProps {
  onEdit: (member: any) => void;
  onDelete: (id: string) => void;
  onRenew: (member: any) => void;
  onStatusChange: (id: string, status: MemberStatus) => void;
}

export const getColumns = ({ onEdit, onDelete, onRenew, onStatusChange }: ColumnsProps): ColumnDef<any>[] => [
  {
    accessorKey: "fullName",
    header: "Socio",
    filterFn: (row, id, value) => {
      const search = value.toLowerCase();
      const name = (row.original.fullName || "").toLowerCase();
      const dni = (row.original.dni || "").toLowerCase();
      return name.includes(search) || dni.includes(search);
    },
    cell: ({ row }) => {
      const membership = row.original.memberships?.[0];
      const planName = membership?.plan?.name || "";
      const isVip = /vip|premium/i.test(planName);
      const isStandard = /est[aá]ndar/i.test(planName);
      const isBasic = /b[aá]sico/i.test(planName);
      
      const tierBorder = isVip 
        ? 'border-amber-400/50 ring-1 ring-amber-400/20' 
        : isStandard 
          ? 'border-emerald-400/40 ring-1 ring-emerald-400/10' 
          : isBasic 
            ? 'border-zinc-400/25' 
            : 'border-white/10';

      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`size-10 rounded-xl bg-white/5 border flex items-center justify-center overflow-hidden relative ${tierBorder}`}>
              {row.original.photo ? (
                <Image 
                  src={row.original.photo} 
                  alt={row.original.fullName} 
                  fill
                  className="object-cover" 
                  style={{ objectPosition: `50% ${row.original.photoPosition ?? 50}%` }}
                  sizes="40px"
                />
              ) : (
                <User className="size-5 text-muted-foreground/30" />
              )}
            </div>
            {isVip && (
              <div className="absolute -top-1 -right-1 bg-linear-to-br from-amber-400 to-yellow-500 rounded-full p-0.5 shadow-sm border border-background">
                <Crown className="size-2.5 text-amber-900" />
              </div>
            )}
            {isStandard && (
              <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 border-2 border-background shadow-sm" />
            )}
            {isBasic && (
              <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-zinc-400/60 border-2 border-background" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{row.original.fullName}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{row.original.dni}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const active = row.original.status === "ACTIVE";
      return (
        <Badge variant="outline" className={`rounded-full text-[9px] uppercase tracking-widest px-2.5 ${active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
          {active ? "Activo" : "Inactivo"}
        </Badge>
      );
    }
  },
  {
    accessorKey: "email",
    header: "Contacto",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-xs font-medium">{row.original.email}</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Smartphone className="size-3" />
          <span>{row.original.phone}</span>
        </div>
      </div>
    )
  },
  {
    id: "membership",
    header: "Plan Actual",
    cell: ({ row }) => {
      const membership = row.original.memberships?.[0];
      return membership ? (
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <span className="text-xs font-medium">{membership.plan.name}</span>
        </div>
      ) : (
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest italic opacity-50">Sin Plan</span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0 hover:bg-white/5">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-white/10 bg-zinc-950/90 backdrop-blur-xl">
          <DropdownMenuItem 
            className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-white/10 cursor-pointer"
            asChild
          >
            <Link href={`/members/${row.original.id}`}>
              <User className="size-3" /> Ver Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-white/10 cursor-pointer"
            onClick={() => onEdit(row.original)}
          >
            <Edit2 className="size-3" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-emerald-500/20 text-emerald-500 cursor-pointer"
            onClick={() => onRenew(row.original)}
          >
            <RefreshCw className="size-3" /> Renovar Plan
          </DropdownMenuItem>
          {row.original.status !== "ACTIVE" ? (
            <DropdownMenuItem 
              className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-emerald-500/20 text-emerald-500 cursor-pointer"
              onClick={() => onStatusChange(row.original.id, "ACTIVE")}
            >
              <ShieldCheck className="size-3" /> Reactivar Socio
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-amber-500/20 text-amber-500 cursor-pointer"
              onClick={() => onStatusChange(row.original.id, "INACTIVE")}
            >
              <ShieldCheck className="size-3" /> Suspender Socio
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-rose-500/20 text-rose-500 cursor-pointer"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="size-3" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
