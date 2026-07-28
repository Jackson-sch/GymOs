import { getMembersAction, getMembersStatsAction } from "@/lib/actions/members-actions";
import { getPlansAction } from "@/lib/actions/plans-actions";
import { MembersClient } from "./MembersClient";
import { Sparkles } from "lucide-react";

export default async function MembersPage() {
  const [result, plansResult, statsResult] = await Promise.all([
    getMembersAction(),
    getPlansAction(),
    getMembersStatsAction(),
  ]);
  const members = result.success ? (result.data as any[]) : [];
  const plans = plansResult.success ? (plansResult.data as any[]) : [];
  const stats = (statsResult.success && statsResult.data) ? statsResult.data : {
    total: 0,
    active: 0,
    newThisMonth: 0
  };

  return (
    <div className="space-y-8 animate-fade-in w-full">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Base de Datos de Socios
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight text-foreground">
            Directorio de Socios
          </h1>
          <p className="text-muted-foreground font-sans max-w-md text-sm">
            Gestión de la comunidad de{" "}
            <span className="text-foreground font-medium">GymOS</span> con precisión quirúrgica y estilo.
          </p>
        </div>
      </div>

      {/* Main Client Component with Consolidated Stats & TanStack Table */}
      <MembersClient data={members} plans={plans} serverStats={stats} />
    </div>
  );
}
