"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Calendar, MapPin, ChevronRight } from "lucide-react";
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
      <Card className="glass-card border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Sesiones & Clases Programadas
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[9px] uppercase font-bold px-2.5 py-0.5">
            Monitoreo en Tiempo Real
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          {!mounted ? (
            <div className="flex items-center justify-center py-12">
              <Activity className="size-8 text-primary animate-spin" />
            </div>
          ) : (classes || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
              <Calendar className="size-10 text-primary/40" />
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Sin sesiones programadas</p>
              <p className="text-[11px] text-muted-foreground">Este entrenador no posee clases grupales en la agenda actual.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {(classes || []).slice(0, 10).map((classItem: any) => (
                <div
                  key={classItem.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
                  onClick={() => onSelectClass(classItem.id)}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center min-w-[50px] border-r border-white/10 pr-4">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
                        {format(new Date(classItem.startTime), "MMM", { locale: es })}
                      </span>
                      <span className="text-lg font-serif font-bold text-foreground">
                        {format(new Date(classItem.startTime), "dd")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {classItem.name}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-primary" /> {format(new Date(classItem.startTime), "HH:mm")}
                        </span>
                        {classItem.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-primary" /> {classItem.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase px-2.5 py-0.5",
                        classItem.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : classItem.status === "IN_PROGRESS"
                          ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30",
                      )}
                    >
                      {classItem.status === "COMPLETED"
                        ? "Dictada"
                        : classItem.status === "IN_PROGRESS"
                        ? "En Curso"
                        : "Programada"}
                    </Badge>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-colors transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
