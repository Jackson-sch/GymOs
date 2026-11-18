"use client";

import React from "react";
import {
  Search,
  Banknote,
  Smartphone,
  CreditCard,
  Building2,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { cn } from "@/lib/utils";

const METHOD_FILTERS = [
  { id: "ALL", label: "Todos", icon: null },
  { id: "CASH", label: "Efectivo", icon: Banknote },
  { id: "YAPE_PLIN", label: "Yape / Plin", icon: Smartphone },
  { id: "CARD", label: "Tarjeta POS", icon: CreditCard },
  { id: "TRANSFER", label: "Transferencia", icon: Building2 },
];

interface PaymentFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  dateFrom: string | null;
  dateTo: string | null;
  onDateRangeChange: (range: { from: string | null; to: string | null }) => void;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function PaymentFilterBar({
  search,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateRangeChange,
  selectedMethod,
  onMethodChange,
  hasActiveFilters,
  onResetFilters,
}: PaymentFilterBarProps) {
  return (
    <div className="flex flex-col 2xl:flex-row justify-between items-stretch 2xl:items-center gap-3 glass-card p-4 rounded-2xl border-border">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-1 min-w-55 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por socio, plan o N° de comprobante..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-muted/40 border-border rounded-xl text-xs focus-visible:ring-primary/30 transition-colors"
          />
        </div>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onSelectRange={onDateRangeChange}
          placeholder="Filtrar por fechas"
          showPresets={false}
          align="start"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
          {METHOD_FILTERS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => onMethodChange(m.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5",
                  selectedMethod === m.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {Icon && <Icon className="size-3" />}
                {m.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
