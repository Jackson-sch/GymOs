"use client";

import React from "react";
import { Banknote, Smartphone, CreditCard, Building2, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";
import type { MethodKey } from "../utils/payment-helpers";

const CHANNEL_META: Array<{
  key: MethodKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  barClass: string;
  badgeClass: string;
}> = [
  {
    key: "CASH",
    label: "Efectivo",
    icon: Banknote,
    barClass: "bg-emerald-500",
    badgeClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  {
    key: "YAPE_PLIN",
    label: "Yape / Plin",
    icon: Smartphone,
    barClass: "bg-purple-500",
    badgeClass: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
  {
    key: "CARD",
    label: "Tarjeta POS",
    icon: CreditCard,
    barClass: "bg-blue-500",
    badgeClass: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
  {
    key: "TRANSFER",
    label: "Transferencia",
    icon: Building2,
    barClass: "bg-amber-500",
    badgeClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
];

interface PaymentChannelBreakdownProps {
  totals: Record<MethodKey, { amount: number; count: number }>;
  grandTotal: number;
}

export function PaymentChannelBreakdown({
  totals,
  grandTotal,
}: PaymentChannelBreakdownProps) {
  return (
    <div className="lg:col-span-4 flex flex-col justify-between glass-card p-6 border-border rounded-3xl backdrop-blur-md space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <Layers className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-foreground">
                Desglose de Caja
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Según filtros activos
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {CHANNEL_META.map((channel) => {
            const stat = totals[channel.key];
            const pct = grandTotal > 0 ? Math.round((stat.amount / grandTotal) * 100) : 0;
            const Icon = channel.icon;

            return (
              <div key={channel.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("p-1.5 rounded-lg shrink-0", channel.badgeClass)}>
                      <Icon className="size-3.5" />
                    </span>
                    <span className="font-medium text-foreground truncate">
                      {channel.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ({stat.count})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="font-mono font-semibold text-foreground tabular-nums">
                      {formatCurrency(stat.amount)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground font-mono font-semibold">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-500", channel.barClass)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">
          Total en vista
        </span>
        <span className="text-lg font-serif font-bold text-foreground tabular-nums">
          {formatCurrency(grandTotal)}
        </span>
      </div>
    </div>
  );
}
