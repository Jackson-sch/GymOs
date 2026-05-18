"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function MemberActivityHistory({ attendances }: { attendances: any[] }) {
  return (
    <Card className="border-border/10 shadow-sm bg-secondary/10">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
          <History className="size-4" /> Historial de Asistencia
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
            <Calendar className="size-10 mb-4" />
            <p className="text-xs uppercase tracking-widest">Sin asistencias registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendances.slice(0, 5).map((att: any) => (
              <div key={att.id} className="flex items-center justify-between p-4 rounded-xl border border-border/10 bg-background/20 group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{format(new Date(att.checkIn), "dd")}</div>
                  <div>
                    <div className="text-sm font-medium">{format(new Date(att.checkIn), "EEEE dd 'de' MMMM", { locale: es })}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{format(new Date(att.checkIn), "HH:mm")}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">ENTRADA</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
