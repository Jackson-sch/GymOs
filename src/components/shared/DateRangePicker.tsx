"use client";

import React, { useMemo } from "react";
import { format, subDays, startOfMonth, startOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from?: string | null;
  to?: string | null;
  onSelectRange: (range: { from: string | null; to: string | null }) => void;
  placeholder?: string;
  className?: string;
  showPresets?: boolean;
  align?: "start" | "center" | "end";
}

export function DateRangePicker({
  from,
  to,
  onSelectRange,
  placeholder = "Filtrar por fechas",
  className,
  showPresets = true,
  align = "end",
}: DateRangePickerProps) {
  // Convert string (YYYY-MM-DD) to Date object safely
  const dateRange: DateRange | undefined = useMemo(() => {
    const fromDate = from ? new Date(from.includes("T") ? from : `${from}T00:00:00`) : undefined;
    const toDate = to ? new Date(to.includes("T") ? to : `${to}T00:00:00`) : undefined;

    if (!fromDate && !toDate) return undefined;
    return { from: fromDate, to: toDate };
  }, [from, to]);

  const handleSelect = (range: DateRange | undefined) => {
    const fromStr = range?.from ? format(range.from, "yyyy-MM-dd") : null;
    const toStr = range?.to ? format(range.to, "yyyy-MM-dd") : null;
    onSelectRange({ from: fromStr, to: toStr });
  };

  const handleQuickPreset = (days: number | "month" | "year") => {
    const now = new Date();
    let startDate: Date;

    if (days === "month") {
      startDate = startOfMonth(now);
    } else if (days === "year") {
      startDate = startOfYear(now);
    } else {
      startDate = subDays(now, days);
    }

    onSelectRange({
      from: format(startDate, "yyyy-MM-dd"),
      to: format(now, "yyyy-MM-dd"),
    });
  };

  const handleReset = () => {
    onSelectRange({ from: null, to: null });
  };

  const hasSelection = Boolean(from || to);

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {showPresets && (
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className="text-[9px] uppercase font-bold text-muted-foreground mr-1">Rápido:</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleQuickPreset(7)}
            className="h-6 text-[9px] font-bold px-2 rounded-lg hover:bg-white/10"
          >
            7D
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleQuickPreset(30)}
            className="h-6 text-[9px] font-bold px-2 rounded-lg hover:bg-white/10"
          >
            30D
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleQuickPreset("month")}
            className="h-6 text-[9px] font-bold px-2 rounded-lg hover:bg-white/10"
          >
            Este Mes
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleQuickPreset("year")}
            className="h-6 text-[9px] font-bold px-2 rounded-lg hover:bg-white/10"
          >
            Año
          </Button>
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="glass-card bg-white/5 hover:bg-white/10 border-white/10 rounded-xl h-11 px-4 font-bold text-xs gap-2.5 transition-all"
          >
            <CalendarIcon className="size-4 text-primary shrink-0" />
            <span className="truncate">
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM yyyy")}`
                : dateRange?.from
                ? `Desde ${format(dateRange.from, "dd MMM yyyy")}`
                : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl w-auto rounded-3xl shadow-2xl"
          align={align}
        >
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2035, 11)}
            className="p-3"
          />
          {hasSelection && (
            <div className="p-3 border-t border-white/5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="w-full h-9 text-[10px] uppercase tracking-widest font-bold hover:bg-rose-500/10 text-rose-400 transition-colors gap-2"
              >
                <X className="size-3.5" />
                Resetear Rango de Fechas
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
