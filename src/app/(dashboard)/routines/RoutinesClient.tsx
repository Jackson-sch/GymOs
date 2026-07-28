"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Dumbbell,
  Search,
  ClipboardList,
  Video,
  LayoutGrid,
  List,
  Loader2,
  Users,
  Flame,
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createExerciseAction,
  seedOpenExerciseCatalogAction,
} from "@/lib/actions/routine-management-actions";
import { RoutineAssignmentDialog } from "./RoutineAssignmentDialog";
import { useQueryState, parseAsInteger } from "nuqs";
import { PlanDetail } from "./components/PlanDetail";
import { PlanCard } from "./components/PlanCard";
import { RoutineSimulator } from "./components/RoutineSimulator";
import { NewExerciseDialog } from "./components/NewExerciseDialog";
import { PaginationBar } from "@/components/shared/PaginationBar";

interface RoutinesClientProps {
  initialExercises: any[];
  initialRoutines: any[];
  members: any[];
  trainers: any[];
}

const MUSCLE_GROUPS = [
  { id: "ALL", label: "Todos" },
  { id: "Pecho", label: "Pecho" },
  { id: "Espalda", label: "Espalda" },
  { id: "Piernas", label: "Piernas" },
  { id: "Brazos", label: "Brazos" },
  { id: "Hombros", label: "Hombros" },
  { id: "Core", label: "Core / Abs" },
];

export function RoutinesClient({
  initialExercises,
  initialRoutines,
  members,
  trainers,
}: RoutinesClientProps) {
  const [exercises, setExercises] = useState(initialExercises);
  const [routines, setRoutines] = useState(initialRoutines);

  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "rutinas",
  });
  const [planName, setPlanName] = useQueryState("plan");
  const [searchTerm, setSearchTerm] = useQueryState("search", {
    defaultValue: "",
  });
  const [routineSearchTerm, setRoutineSearchTerm] = useQueryState("q", {
    defaultValue: "",
  });
  const [selectedMuscle, setSelectedMuscle] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Exercise Pagination State
  const [exercisePage, setExercisePage] = useQueryState(
    "exPage",
    parseAsInteger.withDefault(1),
  );
  const [exercisePageSize, setExercisePageSize] = useQueryState(
    "exSize",
    parseAsInteger.withDefault(12),
  );

  // Plans Pagination State
  const [plansPage, setPlansPage] = useQueryState(
    "pPage",
    parseAsInteger.withDefault(1),
  );
  const [plansPageSize, setPlansPageSize] = useQueryState(
    "pSize",
    parseAsInteger.withDefault(8),
  );

  // Simulator State
  const [simulatingPlan, setSimulatingPlan] = useState<any | null>(null);

  // Seeder State
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedCatalog = async () => {
    setIsSeeding(true);
    toast.info("Conectando con el repositorio open-source para poblar catálogo...");
    const res = await seedOpenExerciseCatalogAction();
    setIsSeeding(false);

    if (res.success && res.data) {
      setExercises(res.data);
      setExercisePage(1);
      if (res.addedCount > 0) {
        toast.success(
          `¡Sincronizado! Se agregaron ${res.addedCount} nuevos ejercicios. Total: ${res.totalCount}`,
        );
      } else {
        toast.success(
          `El catálogo ya está actualizado con los ${res.totalCount} ejercicios.`,
        );
      }
    } else {
      toast.error(res.error || "Error al sincronizar el catálogo de ejercicios");
    }
  };

  // New Exercise Form State
  const [newExForm, setNewExForm] = useState({
    name: "",
    muscleGroup: "Pecho",
    description: "",
    demoUrl: "",
  });
  const [creatingEx, setCreatingEx] = useState(false);
  const [isNewExOpen, setIsNewExOpen] = useState(false);

  const handleCreateExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExForm.name.trim()) {
      toast.error("El nombre del ejercicio es obligatorio");
      return;
    }
    setCreatingEx(true);
    try {
      const res = await createExerciseAction({
        name: newExForm.name,
        muscleGroup: newExForm.muscleGroup,
        demoUrl: newExForm.demoUrl,
      });
      if (res.success && res.data) {
        toast.success("Ejercicio creado correctamente");
        setExercises((prev) => [res.data, ...prev]);
        setIsNewExOpen(false);
        setNewExForm({
          name: "",
          muscleGroup: "Pecho",
          description: "",
          demoUrl: "",
        });
      } else {
        toast.error(res.error || "Error al crear el ejercicio");
      }
    } catch (err) {
      toast.error("Error de servidor al guardar el ejercicio");
    } finally {
      setCreatingEx(false);
    }
  };

  // Reset exercise page on filter change
  useEffect(() => {
    setExercisePage(1);
  }, [searchTerm, selectedMuscle, setExercisePage]);

  // Reset plan page on search change
  useEffect(() => {
    setPlansPage(1);
  }, [routineSearchTerm, setPlansPage]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroup?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMuscle =
        selectedMuscle === "ALL" ||
        ex.muscleGroup?.toLowerCase().includes(selectedMuscle.toLowerCase());

      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchTerm, selectedMuscle]);

  const totalExercisePages = Math.ceil(
    filteredExercises.length / (exercisePageSize || 16),
  );

  const paginatedExercises = useMemo(() => {
    const p = exercisePage || 1;
    const s = exercisePageSize || 16;
    return filteredExercises.slice((p - 1) * s, p * s);
  }, [filteredExercises, exercisePage, exercisePageSize]);

  const filteredRoutines = useMemo(() => {
    return routines.filter((routine) => {
      if (!routineSearchTerm.trim()) return true;
      const term = routineSearchTerm.toLowerCase();
      const planNameMatches = routine.name?.toLowerCase().includes(term);
      const memberNameMatches = routine.member?.fullName?.toLowerCase().includes(term);
      const trainerNameMatches = routine.trainer?.fullName?.toLowerCase().includes(term);
      return Boolean(planNameMatches || memberNameMatches || trainerNameMatches);
    });
  }, [routines, routineSearchTerm]);

  const groupedRoutines = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredRoutines.forEach((routine) => {
      if (!groups[routine.name]) {
        groups[routine.name] = {
          name: routine.name,
          routines: [],
          exerciseCount: routine._count?.exercises || 0,
          trainer: routine.trainer?.fullName || "N/A",
          isActive: routine.isActive,
          rawExercises: routine.exercises || [],
        };
      }
      groups[routine.name].routines.push(routine);
    });
    return Object.values(groups);
  }, [filteredRoutines]);

  const totalPlanPages = Math.ceil(
    groupedRoutines.length / (plansPageSize || 12),
  );

  const paginatedGroups = useMemo(() => {
    const p = plansPage || 1;
    const s = plansPageSize || 12;
    return groupedRoutines.slice((p - 1) * s, p * s);
  }, [groupedRoutines, plansPage, plansPageSize]);

  const activePlan = useMemo(
    () =>
      planName ? groupedRoutines.find((g) => g.name === planName) : null,
    [planName, groupedRoutines],
  );

  if (activePlan) {
    return <PlanDetail plan={activePlan} onBack={() => setPlanName(null)} />;
  }

  const totalAssignedMembers = new Set(routines.map((r) => r.memberId)).size;

  return (
    <div className="space-y-8 animate-fade-in-fast w-full pb-8">
      {/* Studio Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass-card p-6 sm:p-8 rounded-3xl border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Flame className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Workout & Training Hub
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight">
            Rutinas & Catálogo Deportivo
          </h1>
          <p className="text-xs text-muted-foreground font-sans max-w-lg">
            Diseño de planes personalizados, prescripción de cargas e instrucción audiovisual para socios.
          </p>
        </div>

        {/* Studio KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center min-w-27.5">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
              Planes
            </p>
            <p className="text-2xl font-serif font-bold text-primary">
              {groupedRoutines.length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center min-w-27.5">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
              Ejercicios
            </p>
            <p className="text-2xl font-serif font-bold text-foreground">
              {exercises.length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center min-w-27.5">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
              Socios
            </p>
            <p className="text-2xl font-serif font-bold text-emerald-400">
              {totalAssignedMembers}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center min-w-27.5">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
              Entrenadores
            </p>
            <p className="text-2xl font-serif font-bold text-amber-400">
              {trainers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs
        value={activeTab ?? "rutinas"}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl grid grid-cols-2 max-w-md">
          <TabsTrigger
            value="rutinas"
            className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors uppercase tracking-wider"
          >
            <ClipboardList className="size-4" />
            Planes de Entrenamiento
          </TabsTrigger>
          <TabsTrigger
            value="ejercicios"
            className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors uppercase tracking-wider"
          >
            <Dumbbell className="size-4" />
            Catálogo de Ejercicios
          </TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* TAB 1: PLANES DE ENTRENAMIENTO */}
        {/* ========================================== */}
        <TabsContent
          value="rutinas"
          className="space-y-8 outline-hidden animate-fade-in-fast"
        >
          {/* Search & Actions Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 rounded-3xl border-white/10">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plan por nombre, socio o entrenador..."
                className="pl-12 h-11 rounded-2xl bg-white/5 border-white/10 text-xs focus-visible:ring-primary/40"
                value={routineSearchTerm ?? ""}
                onChange={(e) => setRoutineSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <RoutineAssignmentDialog
                members={members}
                trainers={trainers}
                exercises={exercises}
                onSuccess={(newRoutine) =>
                  setRoutines((prev) => [newRoutine, ...prev])
                }
              />
            </div>
          </div>

          {/* Routine Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedGroups.map((group, idx) => (
              <PlanCard
                key={group.name || group.id}
                group={group}
                onSelect={setPlanName}
                onSimulate={(g) => setSimulatingPlan(g)}
              />
            ))}
          </div>

          {groupedRoutines.length === 0 && (
            <div className="text-center py-16 glass-card rounded-3xl border-dashed border-white/10">
              <ClipboardList className="size-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <h3 className="text-xl font-serif text-foreground">
                No se encontraron planes
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Pruebe con otro término de búsqueda o asigne una nueva rutina a un alumno.
              </p>
            </div>
          )}

          {/* Plans Pagination Bar */}
          <PaginationBar
            currentPage={plansPage || 1}
            totalPages={totalPlanPages}
            pageSize={plansPageSize || 12}
            totalItems={groupedRoutines.length}
            onPageChange={(p) => setPlansPage(p)}
            onPageSizeChange={(s) => setPlansPageSize(s)}
            pageSizeOptions={[8, 12, 24, 48]}
            itemLabel="planes"
          />
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: CATÁLOGO DE EJERCICIOS */}
        {/* ========================================== */}
        <TabsContent
          value="ejercicios"
          className="space-y-8 outline-hidden animate-fade-in-fast"
        >
          {/* Search, Muscle Group Pills & Controls */}
          <div className="space-y-4 glass-card p-5 rounded-3xl border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ejercicio por nombre o grupo muscular..."
                  className="pl-12 h-11 rounded-2xl bg-white/5 border-white/10 text-xs focus-visible:ring-primary/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {/* View Mode Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    title="Vista Cuadrícula"
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    title="Vista Lista"
                  >
                    <List className="size-4" />
                  </button>
                </div>

                {/* Seed Open Source Catalog Button */}
                <Button
                  variant="outline"
                  onClick={handleSeedCatalog}
                  disabled={isSeeding}
                  className="rounded-2xl gap-2 h-11 px-4 font-bold text-xs uppercase tracking-wider border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
                  title="Importar catálogo open-source gratuito (+800 ejercicios)"
                >
                  {isSeeding ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <Sparkles className="size-4 text-amber-400" />
                  )}
                  {isSeeding ? "Sincronizando..." : "Poblar Catálogo (+800)"}
                </Button>

                {/* Add New Exercise Dialog */}
                <NewExerciseDialog
                  open={isNewExOpen}
                  onOpenChange={setIsNewExOpen}
                  formState={newExForm}
                  setFormState={setNewExForm}
                  onSubmit={handleCreateExerciseSubmit}
                  isLoading={creatingEx}
                />
              </div>
            </div>

            {/* Muscle Group Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1 shrink-0">
                Grupo:
              </span>
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg.id}
                  type="button"
                  onClick={() => setSelectedMuscle(mg.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    selectedMuscle === mg.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  {mg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises Presentation View */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {paginatedExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="glass-card p-5 rounded-3xl border-white/10 hover:border-primary/30 transition-colors group flex flex-col justify-between backdrop-blur-md bg-white/2"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors">
                        <Dumbbell className="size-5" />
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/30"
                      >
                        {ex.muscleGroup || "General"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-base font-serif font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {ex.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {ex.description || "Sin descripción de postura cargada."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                    {ex.demoUrl || ex.videoUrl ? (
                      <a
                        href={ex.demoUrl || ex.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 hover:underline"
                      >
                        <Video className="size-3.5" /> Ver Demo Video
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Guía Estándar
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ID #{ex.id.substring(0, 5)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
              <div className="divide-y divide-white/5">
                {paginatedExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Dumbbell className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {ex.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold uppercase bg-white/5 border-white/10"
                          >
                            {ex.muscleGroup || "General"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {ex.description || "Sin descripción de ejecución."}
                        </p>
                      </div>
                    </div>

                    {(ex.demoUrl || ex.videoUrl) && (
                      <a
                        href={ex.demoUrl || ex.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:underline shrink-0"
                      >
                        <Video className="size-3.5" /> Demo Video
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredExercises.length === 0 && (
            <div className="text-center py-16 glass-card rounded-3xl border-dashed border-white/10">
              <Dumbbell className="size-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <h3 className="text-xl font-serif text-foreground">
                No se encontraron ejercicios
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Pruebe filtrando por otro grupo muscular o agregue uno nuevo al catálogo.
              </p>
            </div>
          )}

          {/* Exercise Catalog Pagination Bar */}
          <PaginationBar
            currentPage={exercisePage || 1}
            totalPages={totalExercisePages}
            pageSize={exercisePageSize || 12}
            totalItems={filteredExercises.length}
            onPageChange={(p) => setExercisePage(p)}
            onPageSizeChange={(s) => setExercisePageSize(s)}
            pageSizeOptions={[8, 12, 24, 48]}
            itemLabel="ejercicios"
          />
        </TabsContent>
      </Tabs>

      {/* Routine Simulator Modal */}
      {simulatingPlan && (
        <RoutineSimulator
          isOpen={!!simulatingPlan}
          onClose={() => setSimulatingPlan(null)}
          planName={simulatingPlan.name}
          exercises={simulatingPlan.rawExercises || []}
        />
      )}
    </div>
  );
}
