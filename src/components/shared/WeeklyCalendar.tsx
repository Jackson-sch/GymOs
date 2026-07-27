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
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const days = eachDayOfInterval({
    start: currentWeekStart,
    end: addDays(currentWeekStart, 6),
  });

  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const goToToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    onDateSelect(today);
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/15 backdrop-blur-md space-y-6 shadow-xl">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <CalendarIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-foreground">Horario Semanal</h3>
            <p className="text-[10px] uppercase tracking-widest text-primary font-mono font-bold capitalize">
              {format(currentWeekStart, "MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons < Hoy > */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md shadow-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={prevWeek}
            className="size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 hover:border-primary/40 text-foreground transition-all shadow-sm"
            title="Semana anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={goToToday}
            className="h-9 px-4 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary font-bold text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            Hoy
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={nextWeek}
            className="size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 hover:border-primary/40 text-foreground transition-all shadow-sm"
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
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden shadow-sm backdrop-blur-sm",
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
