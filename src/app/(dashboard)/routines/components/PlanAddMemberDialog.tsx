"use client";

import React, { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MemberCombobox } from "@/components/shared/MemberCombobox";
import { Combobox } from "@/components/ui/combobox";
import { assignRoutineAction } from "@/lib/actions/routine-management-actions";
import { toast } from "sonner";

interface PlanAddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: any;
  members: any[];
  trainers: any[];
  onRoutineAssigned?: (newRoutine: any) => void;
}

export function PlanAddMemberDialog({
  open,
  onOpenChange,
  plan,
  members,
  trainers,
  onRoutineAssigned,
}: PlanAddMemberDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState(
    plan.routines?.[0]?.trainerId || ""
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedMemberId("");
      setSelectedTrainerId(plan.routines?.[0]?.trainerId || "");
    }
  }

  const assignedMemberIds = new Set(
    (plan.routines || []).map((r: any) => r.memberId || r.member?.id)
  );
  const availableMembers = members.filter(
    (m: any) => !assignedMemberIds.has(m.id)
  );

  const handleAssignToMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error("Debes seleccionar un socio");
      return;
    }
    if (!selectedTrainerId) {
      toast.error("Debes seleccionar un entrenador");
      return;
    }

    setIsAssigning(true);
    try {
      const templateRoutine = plan.routines?.[0];
      const templateExercises = (templateRoutine?.exercises || []).map(
        (ex: any, idx: number) => ({
          exerciseId: ex.exerciseId || ex.exercise?.id,
          day: ex.day || "Lunes",
          order: ex.order ?? idx,
          sets: ex.sets || 3,
          reps: String(ex.reps || "12"),
          weight: ex.weight || undefined,
          rest: ex.rest || undefined,
          notes: ex.notes || undefined,
        })
      );

      const result = await assignRoutineAction({
        name: plan.name,
        description: templateRoutine?.description || "",
        memberId: selectedMemberId,
        trainerId: selectedTrainerId,
        exercises: templateExercises,
      });

      if (result.success) {
        toast.success("Socio agregado al plan correctamente");
        onRoutineAssigned?.(result.data);
        onOpenChange(false);
        setSelectedMemberId("");
      } else {
        toast.error(result.error || "No se pudo agregar el socio");
      }
    } catch {
      toast.error("Error al asignar el plan al socio");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-background/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-border/80 dark:border-white/10 rounded-3xl shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-start gap-3.5 pr-6">
            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <UserPlus className="size-5" />
            </div>
            <div className="space-y-1 text-left">
              <DialogTitle className="text-xl font-serif tracking-tight">
                Agregar Socio al Plan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Asigna <span className="font-semibold text-foreground">{plan.name}</span> ({plan.exerciseCount} ejercicios) a otro socio.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleAssignToMember} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">
              Socio disponible ({availableMembers.length})
            </label>
            <MemberCombobox
              members={availableMembers}
              value={selectedMemberId}
              onChange={setSelectedMemberId}
              placeholder={
                availableMembers.length === 0
                  ? "Todos los socios ya tienen este plan"
                  : "Seleccionar socio..."
              }
              triggerClassName="h-11 rounded-xl bg-background border-border/80 hover:bg-muted/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">
              Entrenador responsable
            </label>
            <Combobox
              items={trainers.map((t: any) => ({
                label: t.fullName,
                value: t.id,
              }))}
              value={selectedTrainerId}
              onSelect={setSelectedTrainerId}
              placeholder="Seleccionar entrenador"
              searchPlaceholder="Buscar entrenador..."
              triggerClassName="h-11 rounded-xl bg-background border-border/80 hover:bg-muted/40"
              icon={UserCheck}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isAssigning}
              className="h-10 px-4 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isAssigning || availableMembers.length === 0}
              className="h-10 px-5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 gap-2"
            >
              {isAssigning && <Loader2 className="size-4 animate-spin" />}
              {isAssigning ? "Asignando..." : "Agregar Socio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
