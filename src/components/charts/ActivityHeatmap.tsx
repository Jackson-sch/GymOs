"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const hours = ["06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];

export function ActivityHeatmap({ data }: { data?: number[][] }) {
  if (!data) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Heatmap Grid Container */}
      <div className="relative">
        {/* Days Header */}
        <div className="grid grid-cols-[3rem_1fr] mb-4">
          <div /> {/* Spacer for hour labels */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div key={day} className="text-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {hours.map((hour, hIndex) => (
            <div key={hour} className="grid grid-cols-[3rem_1fr] items-center">
              <span className="text-[10px] text-right pr-4 text-muted-foreground font-medium uppercase tracking-tighter">
                {hour}
              </span>
              <div className="grid grid-cols-7 gap-2">
                {(data[hIndex] || Array(7).fill(0)).map((intensity, dIndex) => (
                  <Tooltip key={`${hIndex}-${dIndex}`} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "h-12 rounded-lg transition-all duration-500 hover:scale-[1.02] cursor-pointer relative group",
                          intensity > 0.7 ? "shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.2)]" : ""
                        )}
                        style={{
                          backgroundColor: `oklch(70% 0.15 280 / ${intensity})`,
                          border: `1px solid oklch(70% 0.15 280 / ${Math.max(0, intensity - 0.2)})`
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-secondary/90 backdrop-blur-md border-white/10 text-foreground font-medium">
                      {days[dIndex]} a las {hours[hIndex]}: {Math.round(intensity * 100)}%
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Menos</span>
        <div className="flex gap-1.5">
          {[0.2, 0.4, 0.6, 0.8, 1].map((lvl) => (
            <div 
              key={lvl} 
              className="w-4 h-4 rounded-md" 
              style={{ backgroundColor: `oklch(70% 0.15 280 / ${lvl})` }} 
            />
          ))}
        </div>
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Más</span>
      </div>
    </div>
  );
}
