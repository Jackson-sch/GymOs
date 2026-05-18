"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon } from "lucide-react";
import { formatDate, formatTime } from "@/lib/formats";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "createdAt",
    header: "FECHA",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-xs">
          {formatDate(row.original.createdAt, "dd 'de' MMMM yyyy")}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {formatTime(row.original.createdAt)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "user.name",
    header: "ADMINISTRADOR",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <UserIcon className="size-4 text-muted-foreground/50" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-xs">{row.original.user.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.user.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "ACCIÓN",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold bg-white/5 border-white/10 px-2 py-0.5">
        {row.original.action}
      </Badge>
    ),
  },
  {
    accessorKey: "entity",
    header: "ENTIDAD",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-primary" />
        <span className="text-xs font-medium uppercase tracking-tight">{row.original.entity}</span>
      </div>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "ORIGEN",
    cell: ({ row }) => (
      <span className="text-[10px] font-mono text-muted-foreground/60">
        {row.original.ipAddress || "Internal"}
      </span>
    ),
  },
];
