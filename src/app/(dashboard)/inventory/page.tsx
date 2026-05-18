import { getEquipmentAction, getEquipmentKPIs, getMaintenanceAlerts } from "@/lib/actions/inventory-actions";
import { InventoryClient } from "./InventoryClient";
import { Dumbbell, CheckCircle2, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function InventoryPage() {
  const [result, kpis, alertsResult] = await Promise.all([
    getEquipmentAction(),
    getEquipmentKPIs(),
    getMaintenanceAlerts()
  ]);
  
  const equipment = result.success ? (result.data as any[]) : [];
  const alerts = alertsResult.success ? (alertsResult.data as any[]) : [];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Gestión de Activos & Infraestructura
            </span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Inventario</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Supervisando la integridad técnica de la maquinaria que impulsa el <span className="text-foreground font-medium">rendimiento élite</span> de GymOS.
          </p>
        </div>
      </div>

      {/* Critical Alerts Section */}
      {alerts.length > 0 && (
        <div className="glass-card p-8 border-rose-500/20 bg-rose-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 size-64 -mr-24 -mt-24 bg-rose-500/5 blur-3xl rounded-full transition-all group-hover:bg-rose-500/10" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="size-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="size-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-rose-500">Alertas de Mantenimiento Crítico</h2>
              <p className="text-[9px] text-rose-500/60 uppercase tracking-[0.2em] font-bold">Atención inmediata requerida</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {alerts.map((item: any) => (
              <div key={item.id} className="bg-zinc-950/40 p-4 rounded-2xl border border-rose-500/10 hover:border-rose-500/30 transition-all group/item cursor-default shadow-xl">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-serif truncate flex-1 group-hover/item:text-rose-500 transition-colors">{item.name}</p>
                  <Badge variant="outline" className="text-[7px] border-rose-500/30 text-rose-500 uppercase h-4 px-1.5 font-bold">
                    {item.status === "MAINTENANCE" ? "EN REP." : "VENCIDO"}
                  </Badge>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[9px] uppercase text-muted-foreground tracking-widest font-bold">{item.category}</p>
                  <span className="text-[8px] text-muted-foreground/40 font-mono">{item.serialNumber || "S/D"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Equipos", value: kpis.total, icon: Dumbbell, color: "text-primary", bg: "bg-primary/5" },
          { label: "Operativos", value: kpis.operational, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/5" },
          { label: "Mantenimiento", value: kpis.maintenance, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/5" },
          { label: "Fuera de Servicio", value: kpis.outOfService, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/5" },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-8 border-white/5 flex items-center gap-5 interactive-hover group"
          >
            <div
              className={`p-4 rounded-2xl border border-white/10 transition-all duration-500 group-hover:scale-110 ${stat.bg} ${stat.color}`}
            >
              <stat.icon className="size-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
                {stat.label}
              </p>
              <p className="text-3xl font-serif tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <InventoryClient data={equipment} />
    </div>
  );
}

