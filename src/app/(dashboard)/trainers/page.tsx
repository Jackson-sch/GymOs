import { getTrainers, getTrainersStatsAction } from "@/lib/actions/trainers-actions";
import { TrainersClient } from "./TrainersClient";
import { Plus, Sparkles, Users, Award } from "lucide-react";
import { serialize } from "@/lib/utils";

export default async function TrainersPage() {
  const [trainers, statsResult] = await Promise.all([
    getTrainers(),
    getTrainersStatsAction()
  ]);

  const stats = (statsResult.success && statsResult.data) ? statsResult.data : {
    totalStaff: 0,
    classesToday: 0,
    specialtiesCount: 0
  };
  
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Award className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Staff Técnico & Expertos
            </span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Entrenadores</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Gestionando el equipo de élite que impulsa el rendimiento de <span className="text-foreground font-medium">GymOS</span>.
          </p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Staff",
            value: stats.totalStaff,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Clases Hoy",
            value: stats.classesToday,
            icon: Sparkles,
            color: "text-accent",
          },
          {
            label: "Especialidades",
            value: stats.specialtiesCount,
            icon: Award,
            color: "text-primary",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-6 border-white/5 flex items-center gap-4"
          >
            <div
              className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {stat.label}
              </p>
              <p className="text-2xl font-serif">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <TrainersClient data={serialize(trainers)} />
    </div>
  );
}