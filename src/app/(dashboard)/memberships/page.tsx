import { getPlansAction, getMembershipsStatsAction } from "@/lib/actions/plans-actions";
import { ShieldCheck } from "lucide-react";
import { MembershipsClient } from "./MembershipsClient";
import { formatCurrency } from "@/lib/formats";

export default async function MembershipsPage() {
  const [plansResult, statsResult] = await Promise.all([
    getPlansAction(),
    getMembershipsStatsAction()
  ]);

  const plans = plansResult.success ? (plansResult.data as any[]) : [];
  const stats = ((statsResult.success && statsResult.data) ? statsResult.data : {
    bestSeller: "N/A",
    projectedIncome: 0,
    renewalRate: 0,
    conversionRate: 0
  }) as any;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Arquitectura de Ingresos</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Planes de Membresía</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Diseñando experiencias de acceso exclusivas para los socios de <span className="text-foreground font-medium">GymOS</span>.
          </p>
        </div>
      </div>

      {/* Grid Client Component */}
      <MembershipsClient data={plans} />

      {/* Stats Section */}
      <div className="glass-card p-10 border-white/5 bg-linear-to-br from-primary/5 to-transparent">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {[
            { label: "Plan más Vendido", value: stats.bestSeller, trend: "TOP" },
            { 
              label: "Ingreso Proyectado", 
              value: formatCurrency(stats.projectedIncome), 
              trend: "LIVE" 
            },
            { label: "Tasa de Renovación", value: `${stats.renewalRate.toFixed(0)}%`, trend: "AVG" },
            { label: "Conversión", value: `${stats.conversionRate.toFixed(1)}%`, trend: "RATIO" },
          ].map((stat, i) => (
            <div key={i} className="space-y-1 border-l border-white/5 pl-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-serif leading-none">{stat.value}</p>
                <span className="text-[10px] text-emerald-500 font-bold mb-1 opacity-50">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
