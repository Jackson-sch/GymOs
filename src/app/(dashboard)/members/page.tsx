import React from "react";
import { getMembersAction } from "@/lib/actions/members-actions";
import { getPlansAction } from "@/lib/actions/plans-actions";
import { MembersClient } from "./MembersClient";
import { Users, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function MembersPage() {
  const [result, plansResult] = await Promise.all([
    getMembersAction(),
    getPlansAction()
  ]);
  const members = result.success ? (result.data as any[]) : [];
  const plans = plansResult.success ? (plansResult.data as any[]) : [];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Base de Datos de Socios</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Membresía Elite</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Gestionando la comunidad de <span className="text-foreground font-medium">GymOS</span> con precisión quirúrgica y estilo.
          </p>
        </div>
        
        <div className="flex gap-4">
          {/* El botón ahora vive dentro de MembersClient para manejar el estado del Dialog */}
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Socios", value: members.length, icon: Users, color: "text-primary" },
          { label: "Activos Hoy", value: members.filter((m: any) => m.status === "ACTIVE").length, icon: Sparkles, color: "text-accent" },
          { label: "Nuevos (Mes)", value: "+12", icon: Plus, color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{stat.label}</p>
              <p className="text-2xl font-serif">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif">Listado Maestro</h2>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {members.length} Socios Registrados
          </span>
        </div>
        <MembersClient data={members as any} plans={plans} />
      </div>
    </div>
  );
}
