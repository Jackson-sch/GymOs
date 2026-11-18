"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RoutineSimulator } from "./RoutineSimulator";
import { PlanAddMemberDialog } from "./PlanAddMemberDialog";
import { PlanAddExercisesDialog } from "./PlanAddExercisesDialog";
import { PlanMembersCard } from "./PlanMembersCard";
import { PlanTechnicalSequence } from "./PlanTechnicalSequence";

const getPlanCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("fuerza") || n.includes("power") || n.includes("5x5")) {
    return {
      label: "Fuerza & Potencia",
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    };
  }
  if (n.includes("hipertrofia") || n.includes("volumen") || n.includes("muscle")) {
    return {
      label: "Hipertrofia",
      color: "bg-primary/10 text-primary border-primary/30",
    };
  }
  if (n.includes("cardio") || n.includes("hiit") || n.includes("definicion")) {
    return {
      label: "Definición & HIIT",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    };
  }
  return {
    label: "Acondicionamiento",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  };
};

interface PlanDetailProps {
  plan: any;
  exercises?: any[];
  members?: any[];
  trainers?: any[];
  onRoutineAssigned?: (newRoutine: any) => void;
  onRoutinesUpdated?: (updatedRoutines: any[]) => void;
  onBack: () => void;
}

export function PlanDetail({
  plan,
  exercises = [],
  members = [],
  trainers = [],
  onRoutineAssigned,
  onRoutinesUpdated,
  onBack,
}: PlanDetailProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExercisesOpen, setIsAddExercisesOpen] = useState(false);

  const category = getPlanCategory(plan.name);
  const templateExercises = plan.routines?.[0]?.exercises || [];

  return (
    <div className="space-y-8 animate-slide-right w-full pb-8">
      <RoutineSimulator
        isOpen={isSimulating}
        onClose={() => setIsSimulating(false)}
        exercises={templateExercises}
        planName={plan.name}
      />

      <PlanAddMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        plan={plan}
        members={members}
        trainers={trainers}
        onRoutineAssigned={onRoutineAssigned}
      />

      <PlanAddExercisesDialog
        open={isAddExercisesOpen}
        onOpenChange={setIsAddExercisesOpen}
        plan={plan}
        exercises={exercises}
        onRoutinesUpdated={onRoutinesUpdated}
      />

      {/* Detail Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 glass-card p-5 sm:p-8 rounded-3xl border-border/70 dark:border-white/10">
        <div className="space-y-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:gap-3 transition-all group font-bold text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="size-4" />
            Volver a Todos los Planes
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 ${category.color}`}
              >
                {category.label}
              </Badge>
              <Badge
                variant="outline"
                className="bg-muted/50 dark:bg-white/5 border-border/70 dark:border-white/10 text-[10px] text-muted-foreground uppercase tracking-wider"
              >
                Plan Prescrito
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif tracking-tight text-foreground">
              {plan.name}
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Panel de gestión estratégica para el plan de entrenamiento. Visualice a los socios que tienen asignada esta rutina y examine la secuencia técnica de ejercicios.
            </p>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="flex gap-4 shrink-0">
          <div className="glass-card px-6 py-4 rounded-2xl border-border/70 dark:border-white/10 bg-muted/30 dark:bg-white/5 text-center min-w-[110px]">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
              Socios Totales
            </p>
            <p className="text-3xl font-serif font-bold text-primary tabular-nums">
              {plan.routines.length}
            </p>
          </div>
          <div className="glass-card px-6 py-4 rounded-2xl border-border/70 dark:border-white/10 bg-muted/30 dark:bg-white/5 text-center min-w-[110px]">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
              Ejercicios
            </p>
            <p className="text-3xl font-serif font-bold text-foreground tabular-nums">
              {plan.exerciseCount}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-7 flex flex-col">
          <PlanMembersCard
            routines={plan.routines || []}
            onAddMember={onRoutineAssigned ? () => setIsAddMemberOpen(true) : undefined}
          />
        </div>

        <div className="xl:col-span-5 flex flex-col">
          <PlanTechnicalSequence
            exercises={templateExercises}
            exerciseCount={plan.exerciseCount}
            onAddExercises={onRoutinesUpdated ? () => setIsAddExercisesOpen(true) : undefined}
            onSimulate={() => setIsSimulating(true)}
          />
        </div>
      </div>
    </div>
  );
}
