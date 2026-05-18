import { Users, Cake, Zap } from "lucide-react";

export function LiveStatusMonitor({
  occupancy,
  stats,
}: {
  occupancy: number;
  stats: any;
}) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="glass-card p-8 border-white/5 bg-linear-to-br from-emerald-500/5 to-transparent">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">
            Ocupación Actual
          </h3>
          <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-6xl font-serif leading-none">{occupancy}</span>
          <span className="text-muted-foreground font-sans text-sm uppercase tracking-widest">
            Socios en sala
          </span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
            style={{ width: `${Math.min((occupancy / 100) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Estadísticas de Hoy */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="size-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Total Hoy
            </p>
            <p className="text-2xl font-serif">{stats.totalToday}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="size-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Cake className="size-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Cumpleaños
            </p>
            <p className="text-2xl font-serif">{stats.birthdaysToday}</p>
          </div>
        </div>
      </div>

      {/* Distribución por Plan */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-emerald-500" />
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">
            Distribución
          </h3>
        </div>

        <div className="space-y-4">
          {stats.planDistribution.length > 0 ? (
            stats.planDistribution.map((plan: any) => (
              <div key={plan.name} className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-medium">
                  <span className="text-muted-foreground">{plan.name}</span>
                  <span>{plan.value}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500/50 rounded-full"
                    style={{
                      width: `${Math.min((plan.value / occupancy) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-muted-foreground uppercase italic text-center py-4">
              Esperando socios…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
