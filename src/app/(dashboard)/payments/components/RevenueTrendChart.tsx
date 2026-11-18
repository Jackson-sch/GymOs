"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/formats";
import { BarChart3 } from "lucide-react";

interface RevenueTrendChartProps {
  payments: any[];
}

interface Bucket {
  key: string;
  label: string;
  total: number;
  count: number;
}

export function RevenueTrendChart({ payments }: RevenueTrendChartProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const { buckets, mode } = useMemo(() => {
    if (!payments.length) return { buckets: [] as Bucket[], mode: "day" as const };

    const timestamps = payments
      .map((p) => new Date(p.createdAt).getTime())
      .filter((t) => !Number.isNaN(t));

    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);
    const spanDays = (maxTs - minTs) / (1000 * 60 * 60 * 24);
    const groupByMonth = spanDays > 45;

    const map = new Map<string, Bucket>();

    payments.forEach((p) => {
      const date = new Date(p.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const key = groupByMonth
        ? format(date, "yyyy-MM")
        : format(date, "yyyy-MM-dd");
      const label = groupByMonth
        ? format(date, "MMM yy", { locale: es })
        : format(date, "dd MMM", { locale: es });

      const prev = map.get(key) || { key, label, total: 0, count: 0 };
      prev.total += Number(p.amount || 0);
      prev.count += 1;
      map.set(key, prev);
    });

    const sorted = Array.from(map.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-12);

    return { buckets: sorted, mode: groupByMonth ? ("month" as const) : ("day" as const) };
  }, [payments]);

  if (buckets.length === 0) {
    return (
      <div className="h-[190px] flex flex-col items-center justify-center text-muted-foreground/60 gap-2">
        <BarChart3 className="size-8" />
        <p className="text-xs uppercase tracking-widest font-medium">
          Sin datos para el período seleccionado
        </p>
      </div>
    );
  }

  const maxVal = Math.max(...buckets.map((b) => b.total), 1);
  const hovered = buckets.find((b) => b.key === hoveredKey) || buckets[buckets.length - 1];

  return (
    <div className="space-y-3">
      {/* Compact active bar readout */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-muted-foreground">
          {mode === "month" ? "Vista mensual" : "Vista diaria"} ·{" "}
          <strong className="text-foreground uppercase">{hovered.label}</strong>
        </span>
        <span className="font-mono font-semibold text-foreground">
          {formatCurrency(hovered.total)}{" "}
          <span className="text-muted-foreground font-normal">({hovered.count} cobros)</span>
        </span>
      </div>

      {/* Compact Bar Chart */}
      <div className="h-[170px] flex items-end gap-2 pt-4 pb-1 px-1">
        {buckets.map((bucket) => {
          const heightPct = Math.max(8, Math.round((bucket.total / maxVal) * 100));
          const isHovered = hovered.key === bucket.key;

          return (
            <div
              key={bucket.key}
              onMouseEnter={() => setHoveredKey(bucket.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group cursor-pointer min-w-0"
            >
              <div className="w-full flex-1 flex items-end justify-center">
                <div
                  className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                    isHovered
                      ? "bg-primary shadow-md shadow-primary/25"
                      : "bg-primary/45 group-hover:bg-primary/80"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground truncate w-full text-center uppercase">
                {bucket.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
