"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  captionLayout?: "label" | "dropdown";
  startYear?: number;
  endYear?: number;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha...",
  className,
  disabled = false,
  clearable = true,
  captionLayout = "dropdown",
  startYear = 1940,
  endYear = 2035,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  const startMonth = React.useMemo(() => new Date(startYear, 0), [startYear]);
  const endMonth = React.useMemo(() => new Date(endYear, 11), [endYear]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-11 px-3.5 rounded-2xl justify-between text-left font-normal border-white/15 bg-white/5 hover:bg-white/10 text-xs transition-all shadow-sm",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            <CalendarIcon className="size-4 text-primary shrink-0" />
            <span className="truncate font-medium">
              {selectedDate ? (
                format(selectedDate, "PPP", { locale: es })
              ) : (
                <span>{placeholder}</span>
              )}
            </span>
          </div>

          {clearable && selectedDate && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as any);
                }
              }}
              className="p-1 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Limpiar fecha"
            >
              <X className="size-3.5" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 glass-card bg-zinc-950/95 border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}
