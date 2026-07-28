"use client";

import React from "react";
import { format, addDays, startOfWeek, isSameDay, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeeklyCalendar({ selectedDate, onDateSelect }: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = React.useState(
    () => startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const today = React.useMemo(() => new Date(), []);

  const days = eachDayOfInterval({
    start: currentWeekStart,
    end: addDays(currentWeekStart, 6),
  });

  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <CalendarIcon className="size-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm tracking-wide text-foreground capitalize">
              {format(currentWeekStart, "MMMM yyyy", { locale: es })}
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Semana Actual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={prevWeek}
            className="size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 hover:border-primary/40 text-foreground transition-colors duration-200 shadow-sm"
            title="Semana anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={nextWeek}
            className="size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 hover:border-primary/40 text-foreground transition-colors duration-200 shadow-sm"
            title="Semana siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* 7-Day Grid with High-Contrast Soft Borders */}
      <div className="grid grid-cols-7 gap-2.5 md:gap-4">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toString()}
              type="button"
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl border transition-colors duration-300 group relative overflow-hidden shadow-sm backdrop-blur-sm",
                isSelected
                  ? "bg-primary border-primary shadow-lg shadow-primary/30 text-primary-foreground font-bold scale-[1.03]"
                  : isToday
                  ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/20 hover:border-primary"
                  : "bg-white/5 border-white/15 hover:bg-white/10 hover:border-primary/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {isSelected && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
              <span className={cn(
                "text-[10px] uppercase tracking-wider font-bold mb-1",
                isSelected ? "text-primary-foreground/90" : "text-foreground/80 group-hover:text-primary"
              )}>
                {format(day, "EEE", { locale: es })}
              </span>
              <span className={cn(
                "text-lg md:text-2xl font-serif font-bold leading-none",
                isSelected ? "text-primary-foreground" : isToday ? "text-primary" : "text-foreground"
              )}>
                {format(day, "d")}
              </span>
              {isToday && !isSelected && (
                <div className="mt-1.5 size-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
