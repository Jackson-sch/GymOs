"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Receipt } from "lucide-react";
import { formatCurrency, formatDate, formatPaymentMethod } from "@/lib/formats";

export const getColumns = (defaultReceiptFormat: string = "A4"): ColumnDef<any>[] => [
  {
    accessorKey: "member.fullName",
    header: "Socio",
    id: "member_fullName",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.member.fullName}</span>
    )
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <span className="text-sm font-sans font-semibold">{formatCurrency(row.original.amount)}</span>
    )
  },
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px] px-2 bg-white/5 border-white/10 font-medium">
        {formatPaymentMethod(row.original.method)}
      </Badge>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(row.original.createdAt, "d MMM, HH:mm")}
      </span>
    )
  },
  {
    id: "actions",
    header: () => <div className="text-right">ACCIONES</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="size-8 p-0 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-white/10 bg-zinc-950/80 backdrop-blur-xl">
            <DropdownMenuItem
              onClick={() => window.open(`/api/payments/${row.original.id}/receipt?format=a4`, "_blank")}
              className="flex items-center justify-between gap-2 rounded-lg cursor-pointer focus:bg-primary/20 focus:text-primary transition-all duration-200 p-2"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4" />
                <span className="text-xs font-semibold">Recibo A4</span>
              </div>
              {defaultReceiptFormat === "A4" && (
                <Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary uppercase font-semibold px-1.5 bg-primary/5">Por defecto</Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`/api/payments/${row.original.id}/receipt?format=ticket`, "_blank")}
              className="flex items-center justify-between gap-2 rounded-lg cursor-pointer focus:bg-primary/20 focus:text-primary transition-all duration-200 p-2"
            >
              <div className="flex items-center gap-2">
                <Receipt className="size-4" />
                <span className="text-xs font-semibold">Ticket 80mm</span>
              </div>
              {defaultReceiptFormat === "TICKET" && (
                <Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary uppercase font-semibold px-1.5 bg-primary/5">Por defecto</Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }
];
