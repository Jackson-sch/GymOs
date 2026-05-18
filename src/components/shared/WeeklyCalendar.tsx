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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-serif">Horario Semanal</h3>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              {format(currentWeekStart, "MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={prevWeek}
            className="hover:bg-white/5 rounded-xl border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={goToToday}
            className="bg-white/5 hover:bg-white/10 border-white/10 rounded-xl h-9 text-[10px] uppercase tracking-widest font-bold"
          >
            Hoy
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={nextWeek}
            className="hover:bg-white/5 rounded-xl border border-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                isSelected 
                  ? "bg-primary border-primary shadow-lg shadow-primary/20 text-primary-foreground" 
                  : "bg-white/2 border-white/5 hover:bg-white/5 text-muted-foreground hover:text-foreground"
              )}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
              )}
              <span className="text-[10px] uppercase tracking-tighter font-bold mb-1 opacity-60">
                {format(day, "EEE", { locale: es })}
              </span>
              <span className={cn(
                "text-lg md:text-xl font-serif leading-none",
                isToday && !isSelected && "text-primary"
              )}>
                {format(day, "d")}
              </span>
              {isToday && !isSelected && (
                <div className="mt-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
