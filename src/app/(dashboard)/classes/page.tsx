import React from "react";
import { getClassesAction, getTrainersAction } from "@/lib/actions/classes-actions";
import { Calendar } from "lucide-react";
import { ClassesClient } from "./ClassesClient";

export default async function ClassesPage() {
  const [classesRes, trainersRes] = await Promise.all([
    getClassesAction(),
    getTrainersAction()
  ]);

  const classes = classesRes.success ? (classesRes.data as any[]) : [];
  const trainers = trainersRes.success ? (trainersRes.data as any[]) : [];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Agenda de Sesiones</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Clases Grupales</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Gestionando la programación de <span className="text-foreground font-medium">entrenamientos dirigidos</span> y staff técnico.
          </p>
        </div>
      </div>

      {/* Main Client Component */}
      <ClassesClient classes={classes} trainers={trainers} />
    </div>
  );
}
