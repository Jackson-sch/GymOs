"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SessionTimelineProps {
  classes: any[];
  mounted: boolean;
  onSelectClass: (id: string) => void;
}

export function SessionTimeline({ classes, mounted, onSelectClass }: SessionTimelineProps) {
  return (
    <div className="lg:col-span-8">
      <Card className="border-border/10 shadow-sm bg-secondary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Sesiones Programadas
          </CardTitle>
          <div className="h-px flex-1 mx-6 bg-border/10" />
          <Badge variant="ghost" className="text-[10px] opacity-40">EN TIEMPO REAL</Badge>
        </CardHeader>
        <CardContent>
          {!mounted ? (
            <div className="flex items-center justify-center py-12">
              <Activity className="size-8 text-primary animate-pulse" />
            </div>
          ) : (classes || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
              <Calendar className="size-10 mb-4" />
              <p className="text-xs uppercase tracking-widest">Sin actividad programada</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {(classes || []).slice(0, 10).map((classItem: any) => (
                <div 
                  key={classItem.id}
                  onClick={() => onSelectClass(classItem.id)}
                  className="group flex items-center gap-6 p-4 rounded-xl border border-border/20 bg-background/20 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col items-center min-w-[48px] border-r border-border/10 pr-6">
                    <span className="text-[10px] font-black text-primary uppercase">{format(new Date(classItem.startTime), "MMM", { locale: es })}</span>
                    <span className="text-xl font-light">{format(new Date(classItem.startTime), "dd")}</span>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-foreground/90 group-hover:text-primary transition-colors">{classItem.name}</div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                      <span className="flex items-center gap-1.5"><Clock className="size-3" /> {format(new Date(classItem.startTime), "HH:mm")}</span>
                      {classItem.location && <span className="flex items-center gap-1.5"><MapPin className="size-3" /> {classItem.location}</span>}
                    </div>
                  </div>

                  <div className={cn(
                    "size-2 rounded-full",
                    classItem.status === "COMPLETED" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                    classItem.status === "IN_PROGRESS" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" :
                    "bg-primary animate-pulse"
                  )} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
