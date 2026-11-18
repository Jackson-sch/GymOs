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
import { Download, FileText, Receipt, CreditCard, Smartphone, Banknote, Building2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formats";

const getMethodBadge = (method: string) => {
  const m = (method || "").toUpperCase();
  if (m === "YAPE" || m === "PLIN" || m.includes("YAPE") || m.includes("PLIN") || m.includes("DIGITAL")) {
    return {
      label: m === "YAPE" || m === "PLIN" ? m : "YAPE / PLIN",
      icon: Smartphone,
      className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    };
  }
  if (m === "CARD" || m.includes("CARD") || m.includes("TARJETA") || m.includes("POS")) {
    return {
      label: "TARJETA POS",
      icon: CreditCard,
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    };
  }
  if (m === "TRANSFER" || m.includes("TRANSFER") || m.includes("BANK")) {
    return {
      label: "TRANSFERENCIA",
      icon: Building2,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    };
  }
  return {
    label: "EFECTIVO",
    icon: Banknote,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  };
};

export const getColumns = (defaultReceiptFormat: string = "A4"): ColumnDef<any>[] => [
  {
    accessorKey: "member.fullName",
    header: "Socio",
    id: "member_fullName",
    cell: ({ row }) => {
      const memberName = row.original.member?.fullName || "Cliente General";
      const initials = memberName.substring(0, 2).toUpperCase();
      const planName = row.original.membership?.plan?.name || "Cobro General";

      return (
        <div className="flex items-center gap-3 min-w-45">
          <div className="size-9 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-serif font-bold text-xs shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p
              title={memberName}
              className="text-sm font-semibold text-foreground truncate max-w-50"
            >
              {memberName}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-50">
              {planName}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "invoiceNumber",
    header: "N°",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-primary/90 whitespace-nowrap">
        {row.original.invoiceNumber || `F001-${row.original.id.substring(0, 4)}`}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => (
      <span className="text-sm font-serif font-bold text-foreground whitespace-nowrap tabular-nums">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ row }) => {
      const badgeInfo = getMethodBadge(row.original.method);
      const Icon = badgeInfo.icon;
      return (
        <Badge
          variant="outline"
          className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 gap-1.5 whitespace-nowrap ${badgeInfo.className}`}
        >
          <Icon className="size-3 shrink-0" />
          {badgeInfo.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
        {formatDate(row.original.createdAt, "d MMM, HH:mm")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Recibo</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-border bg-muted/50 hover:bg-muted text-[10px] uppercase font-bold tracking-wider gap-1.5"
            >
              <Download className="size-3.5 text-primary" />
              Recibo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 rounded-2xl border-border bg-popover/95 backdrop-blur-2xl shadow-2xl space-y-1"
          >
            <DropdownMenuItem
              onClick={() =>
                window.open(`/api/payments/${row.original.id}/receipt?format=a4`, "_blank")
              }
              className="flex items-center justify-between gap-2 rounded-xl cursor-pointer focus:bg-primary/20 focus:text-primary transition-colors p-2.5 text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <span>Recibo A4 (PDF)</span>
              </div>
              {defaultReceiptFormat === "A4" && (
                <Badge variant="outline" className="text-[8px] border-primary/30 text-primary uppercase font-bold bg-primary/10 px-1.5">
                  Default
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(`/api/payments/${row.original.id}/receipt?format=ticket`, "_blank")
              }
              className="flex items-center justify-between gap-2 rounded-xl cursor-pointer focus:bg-primary/20 focus:text-primary transition-colors p-2.5 text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-emerald-400" />
                <span>Ticket Tiempos (80mm)</span>
              </div>
              {defaultReceiptFormat === "TICKET" && (
                <Badge variant="outline" className="text-[8px] border-primary/30 text-primary uppercase font-bold bg-primary/10 px-1.5">
                  Default
                </Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
