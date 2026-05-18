import {
  getExercisesAction,
  getAllAssignedRoutinesAction,
  getMembersForRoutineAction,
  getTrainersForRoutineAction,
  getRoutinesStatsAction,
} from "@/lib/actions/routine-management-actions";
import { RoutinesClient } from "./RoutinesClient";
import { ClipboardList, Users, Library } from "lucide-react";

export default async function RoutinesAdminPage() {
  const [exercisesRes, routinesRes, membersRes, trainersRes, statsRes] =
    await Promise.all([
      getExercisesAction(),
      getAllAssignedRoutinesAction(),
      getMembersForRoutineAction(),
      getTrainersForRoutineAction(),
      getRoutinesStatsAction(),
    ]);

  const stats =
    statsRes.success && statsRes.data
      ? statsRes.data
      : {
          totalRoutines: 0,
          totalExercises: 0,
          membersWithRoutines: 0,
        };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ClipboardList className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Programación de Entrenamiento
            </span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Rutinas</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Diseñando experiencias de entrenamiento{" "}
            <span className="text-foreground font-medium">personalizadas</span>{" "}
            y seguimiento de progreso técnico.
          </p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Rutinas Asignadas",
            value: stats.totalRoutines,
            icon: ClipboardList,
            color: "text-primary",
          },
          {
            label: "Ejercicios en Library",
            value: stats.totalExercises,
            icon: Library,
            color: "text-accent",
          },
          {
            label: "Socios con Plan",
            value: stats.membersWithRoutines,
            icon: Users,
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
              <stat.icon className="size-6" />
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

      <RoutinesClient
        initialExercises={
          exercisesRes.success && exercisesRes.data ? exercisesRes.data : []
        }
        initialRoutines={
          routinesRes.success && routinesRes.data ? routinesRes.data : []
        }
        members={membersRes.success && membersRes.data ? membersRes.data : []}
        trainers={
          trainersRes.success && trainersRes.data ? trainersRes.data : []
        }
      />
    </div>
  );
}
