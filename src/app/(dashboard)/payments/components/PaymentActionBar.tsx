"use client";

import React from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentForm } from "@/components/shared/forms/PaymentForm";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";
import type { PeriodPreset } from "../utils/payment-helpers";

const PERIOD_OPTIONS: Array<{ id: PeriodPreset; label: string }> = [
  { id: "TODAY", label: "Hoy" },
  { id: "MONTH", label: "Este Mes" },
  { id: "30D", label: "30 días" },
  { id: "ALL", label: "Histórico" },
];

interface PaymentActionBarProps {
  periodPreset: PeriodPreset;
  hasDateRange: boolean;
  onSelectPeriod: (preset: PeriodPreset) => void;
  filteredCount: number;
  grandTotal: number;
  onExportCsv: () => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  members: any[];
  plans: any[];
  trainers: any[];
  onPaymentSuccess: () => void;
}

export function PaymentActionBar({
  periodPreset,
  hasDateRange,
  onSelectPeriod,
  filteredCount,
  grandTotal,
  onExportCsv,
  isCreateOpen,
  setIsCreateOpen,
  members,
  plans,
  trainers,
  onPaymentSuccess,
}: PaymentActionBarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 glass-card p-4 rounded-2xl border-border">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPeriod(p.id)}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors",
                periodPreset === p.id && !hasDateRange
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 font-mono font-bold">
            {filteredCount} cobros
          </Badge>
          <span>
            Total:{" "}
            <strong className="text-foreground font-semibold tabular-nums">
              {formatCurrency(grandTotal)}
            </strong>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onExportCsv}
          disabled={filteredCount === 0}
          title="Exportar CSV"
          aria-label="Exportar CSV"
          className="h-10 px-3 sm:px-4 rounded-xl border-border bg-muted/40 hover:bg-muted text-xs font-bold uppercase tracking-wider gap-1.5"
        >
          <Download className="size-4 text-primary shrink-0" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </Button>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 px-4 sm:px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md shadow-primary/20">
              <Plus className="size-4 shrink-0" />
              <span>Registrar Cobro</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border bg-popover/95 dark:bg-zinc-950/95 backdrop-blur-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl sm:text-3xl font-serif text-foreground">
                Procesar Cobro en Caja
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Vincula un socio a un plan y registra la transacción financiera.
              </DialogDescription>
            </DialogHeader>
            {isCreateOpen && (
              <PaymentForm
                members={members}
                plans={plans}
                trainers={trainers}
                onSuccess={onPaymentSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
