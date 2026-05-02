"use client";

import React from "react";
import { format, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateEquipmentAction } from "@/lib/actions/inventory-actions";
import { toast } from "sonner";

export function MaintenanceSchedule({ data }: { data: any[] }) {
  const [loading, setLoading] = React.useState<string | null>(null);

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      if (!a.nextMaintenance) return 1;
      if (!b.nextMaintenance) return -1;
      return new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime();
    });
  }, [data]);

  const handleMarkAsMaintained = async (item: any) => {
    setLoading(item.id);
    const today = new Date();
    const nextDate = addDays(today, 90); // Default 3 months interval

    const result = await updateEquipmentAction(item.id, {
      ...item,
      lastMaintenance: today.toISOString(),
      nextMaintenance: nextDate.toISOString(),
      status: "OPERATIONAL"
    });

    if (result.success) {
      toast.success(`${item.name} marcado como mantenido.`);
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {sortedData.length === 0 ? (
          <div className="text-center py-12 glass-card border-dashed border-white/10">
            <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-serif italic">No hay equipos registrados para mantenimiento.</p>
          </div>
        ) : (
          sortedData.map((item) => {
            const nextDate = item.nextMaintenance ? new Date(item.nextMaintenance) : null;
            const isOverdue = nextDate && isBefore(nextDate, new Date());
            const daysLeft = nextDate ? Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div 
                key={item.id} 
                className={cn(
                  "glass-card p-5 border-white/5 flex items-center justify-between group transition-all duration-300",
                  isOverdue ? "bg-rose-500/5 border-rose-500/20" : "hover:bg-white/2"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border",
                    isOverdue ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-white/5 border-white/10 text-muted-foreground"
                  )}>
                    {isOverdue ? <AlertCircle className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground flex items-center gap-1.5">
                      <span className="font-mono">{item.serialNumber || "S/N"}</span>
                      <ChevronRight className="w-2 h-2 opacity-30" />
                      {item.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Próximo</p>
                    <p className={cn(
                      "text-xs font-semibold",
                      isOverdue ? "text-rose-500" : "text-foreground"
                    )}>
                      {nextDate ? format(nextDate, "d 'de' MMMM", { locale: es }) : "No programado"}
                    </p>
                    {daysLeft !== null && (
                      <p className={cn(
                        "text-[9px] mt-0.5",
                        isOverdue ? "text-rose-400 font-bold" : "text-muted-foreground"
                      )}>
                        {isOverdue ? `Vencido hace ${Math.abs(daysLeft)} días` : `En ${daysLeft} días`}
                      </p>
                    )}
                  </div>

                  <Button 
                    size="sm"
                    variant="ghost"
                    disabled={loading === item.id}
                    onClick={() => handleMarkAsMaintained(item)}
                    className="h-10 px-4 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 border border-white/5 transition-all group-hover:border-emerald-500/30"
                  >
                    {loading === item.id ? (
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Completado</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
