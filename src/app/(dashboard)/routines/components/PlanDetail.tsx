"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Target,
  Play,
  User,
  Calendar,
  Sparkles,
  Timer,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RoutineSimulator } from "./RoutineSimulator";

const getPlanCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("fuerza") || n.includes("power") || n.includes("5x5")) {
    return { label: "Fuerza & Potencia", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
  }
  if (n.includes("hipertrofia") || n.includes("volumen") || n.includes("muscle")) {
    return { label: "Hipertrofia", color: "bg-primary/10 text-primary border-primary/30" };
  }
  if (n.includes("cardio") || n.includes("hiit") || n.includes("definicion")) {
    return { label: "Definición & HIIT", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
  }
  return { label: "Acondicionamiento", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
};

interface PlanDetailProps {
  plan: any;
  onBack: () => void;
}

export function PlanDetail({ plan, onBack }: PlanDetailProps) {
  const [memberPage, setMemberPage] = useState(1);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const MEMBERS_PER_PAGE = 10;

  const [prevPlan, setPrevPlan] = useState(plan);
  if (plan !== prevPlan) {
    setPrevPlan(plan);
    setMemberPage(1);
    setMemberSearchTerm("");
  }

  const filteredMembers = (plan.routines || []).filter((r: any) => {
    if (!memberSearchTerm.trim()) return true;
    const memberName = r.member?.fullName || "";
    const memberDni = r.member?.dni || "";
    const term = memberSearchTerm.toLowerCase();
    return (
      memberName.toLowerCase().includes(term) ||
      memberDni.toLowerCase().includes(term)
    );
  });

  const paginatedMembers = filteredMembers.slice(
    (memberPage - 1) * MEMBERS_PER_PAGE,
    memberPage * MEMBERS_PER_PAGE,
  );

  const category = getPlanCategory(plan.name);

  return (
    <div className="space-y-8 animate-slide-right w-full pb-8">
      {/* Simulation Modal */}
      <RoutineSimulator
        isOpen={isSimulating}
        onClose={() => setIsSimulating(false)}
        exercises={plan.routines[0]?.exercises || []}
        planName={plan.name}
      />

      {/* Detail Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 glass-card p-6 sm:p-8 rounded-3xl border-white/10">
        <div className="space-y-4">
          <button type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:gap-3 transition-colors group font-bold text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="size-4" />
            Volver a Todos los Planes
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 ${category.color}`}>
                {category.label}
              </Badge>
              <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] text-muted-foreground uppercase tracking-wider">
                Plan Prescrito
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-foreground">
              {plan.name}
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Panel de gestión estratégica para el plan de entrenamiento. Visualice a los socios que tienen asignada esta rutina y examine la secuencia técnica de ejercicios.
            </p>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="flex gap-4">
          <div className="glass-card px-6 py-4 rounded-2xl border-white/10 bg-white/5 text-center min-w-[120px]">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
              Socios Totales
            </p>
            <p className="text-3xl font-serif font-bold text-primary">
              {plan.routines.length}
            </p>
          </div>
          <div className="glass-card px-6 py-4 rounded-2xl border-white/10 bg-white/5 text-center min-w-[120px]">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
              Ejercicios
            </p>
            <p className="text-3xl font-serif font-bold text-foreground">
              {plan.exerciseCount}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Members Column */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="glass-card border-white/10 rounded-3xl overflow-hidden flex flex-col backdrop-blur-md h-full">
            <div className="p-6 border-b border-white/5 bg-white/2 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-foreground">Socios Vinculados</h3>
                <p className="text-xs text-muted-foreground">Alumnos con esta rutina asignada en su expediente</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por socio o DNI..."
                  className="pl-10 h-10 bg-white/5 border-white/10 rounded-xl text-xs focus-visible:ring-primary/40"
                  value={memberSearchTerm}
                  onChange={(e) => {
                    setMemberSearchTerm(e.target.value);
                    setMemberPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-bold text-xs py-3.5">
                      Socio
                    </TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-3.5">
                      Entrenador
                    </TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-3.5">
                      Asignado
                    </TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-3.5 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.map((r: any) => (
                    <TableRow
                      key={r.id}
                      className="border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {r.member?.fullName?.substring(0, 2).toUpperCase() || "M"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {r.member?.fullName}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              DNI: {r.member?.dni || "S/D"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {r.trainer?.fullName || "Staff Entrenador"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {r.createdAt
                          ? format(new Date(r.createdAt), "dd MMM yyyy", { locale: es })
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/members/${r.member?.id}`}
                          className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-primary hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          Ver Perfil <ExternalLink className="size-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedMembers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-muted-foreground text-xs"
                      >
                        No se encontraron socios asignados a este plan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredMembers.length > MEMBERS_PER_PAGE && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Mostrando{" "}
                  {Math.min(
                    filteredMembers.length,
                    memberPage * MEMBERS_PER_PAGE,
                  )}{" "}
                  de {filteredMembers.length} socios
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                    disabled={memberPage === 1}
                    className="h-8 w-8 p-0 rounded-lg border-white/10"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMemberPage((p) => p + 1)}
                    disabled={
                      memberPage * MEMBERS_PER_PAGE >= filteredMembers.length
                    }
                    className="h-8 w-8 p-0 rounded-lg border-white/10"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Plan Column */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="glass-card border-white/10 rounded-3xl flex flex-col h-full bg-white/2 overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                  <Target className="size-4" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Secuencia Técnica</h3>
                  <p className="text-xs text-muted-foreground">Prescripción de cargas del plan</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] font-bold uppercase bg-primary/10 text-primary border-primary/30">
                {plan.exerciseCount} Ejercicios
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 max-h-[600px]">
              {plan.routines[0]?.exercises?.length > 0 ? (
                plan.routines[0].exercises.map((item: any, idx: number) => (
                  <div
                    key={item.id || item.exerciseId || item.exercise?.id || item.exercise?.name || 'ex'}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors duration-300 group/ex space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-serif font-bold text-primary shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground group-hover/ex:text-primary transition-colors">
                            {item.exercise?.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {item.exercise?.muscleGroup || "General"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2 rounded-xl bg-black/20 border border-white/5 text-center">
                        <p className="text-[8px] uppercase text-muted-foreground font-bold">Series</p>
                        <p className="text-sm font-serif font-bold text-foreground">{item.sets}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-black/20 border border-white/5 text-center">
                        <p className="text-[8px] uppercase text-muted-foreground font-bold">Reps</p>
                        <p className="text-sm font-serif font-bold text-foreground">{item.reps}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-black/20 border border-white/5 text-center">
                        <p className="text-[8px] uppercase text-muted-foreground font-bold">Descanso</p>
                        <p className="text-sm font-serif font-bold text-emerald-400">60s</p>
                      </div>
                      <div className="p-2 rounded-xl bg-black/20 border border-white/5 text-center">
                        <p className="text-[8px] uppercase text-muted-foreground font-bold">Objetivo</p>
                        <p className="text-sm font-serif font-bold text-amber-400">RPE 8</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 opacity-40">
                  <Dumbbell className="size-10 mx-auto mb-3" />
                  <p className="text-xs uppercase font-bold tracking-widest">
                    Sin ejercicios configurados
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 bg-white/2 border-t border-white/5 mt-auto">
              <Button
                onClick={() => setIsSimulating(true)}
                disabled={!plan.routines[0]?.exercises?.length}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Play className="size-4 fill-current" />
                Simular Rutina Interactivamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
