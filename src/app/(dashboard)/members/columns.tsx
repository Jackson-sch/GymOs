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
  Crown,
  Mail,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { type MemberStatus } from "@prisma/client";

interface ColumnsProps {
  onEdit: (member: any) => void;
  onDelete: (id: string) => void;
  onRenew: (member: any) => void;
  onStatusChange: (id: string, status: MemberStatus) => void;
}

export const getColumns = ({
  onEdit,
  onDelete,
  onRenew,
  onStatusChange,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    accessorKey: "fullName",
    header: "Socio / Documento",
    filterFn: (row, id, value) => {
      const search = value.toLowerCase();
      const name = (row.original.fullName || "").toLowerCase();
      const dni = (row.original.dni || "").toLowerCase();
      const email = (row.original.email || "").toLowerCase();
      return name.includes(search) || dni.includes(search) || email.includes(search);
    },
    cell: ({ row }) => {
      const membership = row.original.memberships?.[0];
      const planName = membership?.plan?.name || "";
      const isVip = /vip|premium/i.test(planName);
      const isStandard = /est[aá]ndar/i.test(planName);

      const tierBorder = isVip
        ? "border-amber-400/60 ring-2 ring-amber-400/20 shadow-amber-500/10"
        : isStandard
        ? "border-emerald-400/50 ring-1 ring-emerald-400/20"
        : "border-white/15";

      return (
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div
              className={`size-11 rounded-2xl bg-white/5 border flex items-center justify-center overflow-hidden relative shadow-md ${tierBorder}`}
            >
              {row.original.photo ? (
                <Image
                  src={row.original.photo}
                  alt={row.original.fullName}
                  fill
                  className="object-cover"
                  style={{ objectPosition: `50% ${row.original.photoPosition ?? 50}%` }}
                  sizes="44px"
                />
              ) : (
                <User className="size-5 text-muted-foreground/40" />
              )}
            </div>
            {isVip && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full p-1 shadow-md border border-background">
                <Crown className="size-3 text-amber-950" />
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <Link
              href={`/members/${row.original.id}`}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
            >
              <span>{row.original.fullName}</span>
              <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              DNI: {row.original.dni || "N/A"}
            </p>
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
        <Badge
          variant="outline"
          className={`rounded-xl text-[9px] font-bold uppercase tracking-wider px-3 py-1 border ${
            active
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}
        >
          {active ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contacto Directo",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.email && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <Mail className="size-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[180px]">{row.original.email}</span>
          </div>
        )}
        {row.original.phone && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            <Smartphone className="size-3.5 text-primary shrink-0" />
            <span>{row.original.phone}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    id: "membership",
    header: "Membresía & Plan",
    cell: ({ row }) => {
      const membership = row.original.memberships?.[0];
      if (!membership) {
        return (
          <span className="text-[10px] text-muted-foreground uppercase font-mono font-semibold opacity-60">
            Sin Plan Activo
          </span>
        );
      }

      const planName = membership.plan?.name || "Plan Activo";
      const isVip = /vip|premium/i.test(planName);

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-xl border ${
              isVip
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-primary/10 text-primary border-primary/30"
            }`}
          >
            <ShieldCheck className="size-3 mr-1" /> {planName}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl hover:bg-white/10 text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-2xl">
          <DropdownMenuItem
            className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
            asChild
          >
            <Link href={`/members/${row.original.id}`}>
              <User className="size-3 text-primary" /> Ver Perfil 360°
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
            onClick={() => onEdit(row.original)}
          >
            <Edit2 className="size-3 text-primary" /> Editar Socio
          </DropdownMenuItem>

          <DropdownMenuItem
            className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-emerald-500/20 text-emerald-400 cursor-pointer"
            onClick={() => onRenew(row.original)}
          >
            <RefreshCw className="size-3" /> Renovar Membresía
          </DropdownMenuItem>

          {row.original.status !== "ACTIVE" ? (
            <DropdownMenuItem
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-emerald-500/20 text-emerald-400 cursor-pointer"
              onClick={() => onStatusChange(row.original.id, "ACTIVE")}
            >
              <ShieldCheck className="size-3" /> Reactivar Socio
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-amber-500/20 text-amber-400 cursor-pointer"
              onClick={() => onStatusChange(row.original.id, "INACTIVE")}
            >
              <ShieldCheck className="size-3" /> Suspender Socio
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-rose-500/20 text-rose-400 cursor-pointer"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="size-3" /> Eliminar Socio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
