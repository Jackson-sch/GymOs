import { getAuditLogsAction, getAuditStatsAction } from "@/lib/actions/audit-actions";
import { AuditLogClient } from "./AuditLogClient";
import { Shield, Activity, Users, Zap } from "lucide-react";

export const metadata = {
  title: "Auditoría de Sistema | GymOS",
  description: "Registro de acciones y cambios en el sistema.",
};

export default async function AuditLogPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const actionParam = typeof searchParams.action === 'string' ? searchParams.action : undefined;
  const entityParam = typeof searchParams.entity === 'string' ? searchParams.entity : undefined;

  const [result, statsResult] = await Promise.all([
    getAuditLogsAction({ 
      limit: 100,
      action: actionParam,
      entity: entityParam
    }),
    getAuditStatsAction()
  ]);

  const logs = result.success ? result.data : [];
  const stats = (statsResult.success && statsResult.data) ? statsResult.data : {
    totalToday: 0,
    activeAdmins: 0,
    topEntity: "N/A"
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Transparencia & Seguridad
            </span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Auditoría</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Registro histórico de cada acción administrativa ejecutada en <span className="text-foreground font-medium">GymOS</span>.
          </p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Eventos Hoy",
            value: stats.totalToday,
            icon: Activity,
            color: "text-primary",
            bg: "bg-primary/5",
          },
          {
            label: "Admins Activos",
            value: stats.activeAdmins,
            icon: Users,
            color: "text-accent",
            bg: "bg-accent/5",
          },
          {
            label: "Entidad Más Activa",
            value: stats.topEntity,
            icon: Zap,
            color: "text-primary",
            bg: "bg-primary/5",
          },
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


      <AuditLogClient data={logs as any[]} />
    </div>
  );
}
