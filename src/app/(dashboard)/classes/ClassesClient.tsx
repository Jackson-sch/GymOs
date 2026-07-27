"use client";

import React, { useState, useReducer, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Plus,
  ChevronRight,
  TrendingUp,
  Dumbbell,
  MoreVertical,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  UserCheck,
  Zap,
  Award,
} from "lucide-react";
import { ClassDetailsDialog } from "./components/ClassDetailsDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassForm } from "@/components/shared/forms/ClassForm";
import { TrainerForm } from "@/components/shared/forms/TrainerForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deleteClassAction } from "@/lib/actions/classes-actions";
import { toast } from "sonner";
import { isSameDay } from "date-fns";
import { WeeklyCalendar } from "@/components/shared/WeeklyCalendar";
import { formatDate, formatLongDate, formatTime } from "@/lib/formats";
import { cn } from "@/lib/utils";

const classesReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_CREATE_CLASS_OPEN":
      return { ...state, isCreateClassOpen: action.payload };
    case "SET_CREATE_TRAINER_OPEN":
      return { ...state, isCreateTrainerOpen: action.payload };
    case "SET_EDITING_CLASS":
      return { ...state, editingClass: action.payload };
    case "SET_SELECTED_CLASS":
      return { ...state, selectedClassId: action.payload };
    case "SET_SELECTED_DATE":
      return { ...state, selectedDate: action.payload };
    case "SET_MOUNTED":
      return { ...state, mounted: true };
    default:
      return state;
  }
};

export function ClassesClient({ classes, trainers }: { classes: any[]; trainers: any[] }) {
  const [state, dispatch] = useReducer(classesReducer, {
    isCreateClassOpen: false,
    isCreateTrainerOpen: false,
    editingClass: null,
    selectedClassId: null,
    selectedDate: new Date(),
    mounted: false,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { isCreateClassOpen, isCreateTrainerOpen, editingClass, selectedClassId, selectedDate, mounted } = state;

  useEffect(() => {
    dispatch({ type: "SET_MOUNTED" });
  }, []);

  // Compute daily & global stats
  const classStats = useMemo(() => {
    const todayClasses = classes.filter((session) =>
      isSameDay(new Date(session.startTime), selectedDate),
    );

    let totalBookings = 0;
    let totalMaxCapacity = 0;
    let totalMins = 0;

    todayClasses.forEach((c) => {
      totalBookings += c._count?.bookings || 0;
      totalMaxCapacity += c.maxCapacity || 1;
      totalMins += c.durationMins || 45;
    });

    const occupancyRate =
      totalMaxCapacity > 0 ? Math.round((totalBookings / totalMaxCapacity) * 100) : 0;

    return {
      todayCount: todayClasses.length,
      totalBookings,
      occupancyRate,
      totalMins,
      trainersCount: trainers.length,
    };
  }, [classes, selectedDate, trainers]);

  // Filtered classes for the selected date + search + status
  const filteredClasses = useMemo(() => {
    return classes.filter((session) => {
      const matchesDay = isSameDay(new Date(session.startTime), selectedDate);

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        session.name?.toLowerCase().includes(query) ||
        session.trainer?.fullName?.toLowerCase().includes(query) ||
        session.location?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (session.status || "").toUpperCase() === statusFilter.toUpperCase();

      return matchesDay && matchesSearch && matchesStatus;
    });
  }, [classes, selectedDate, search, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleteLoading(true);
    try {
      const result = await deleteClassAction(deletingId);
      if (result.success) {
        toast.success("Clase cancelada con éxito");
        setDeletingId(null);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al intentar cancelar la clase");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full" suppressHydrationWarning>
      {/* Executive Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10 overflow-hidden relative group backdrop-blur-md">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <CalendarIcon className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30 uppercase font-bold">
                Para esta fecha
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">
                {classStats.todayCount} Clases
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Programadas Hoy
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 overflow-hidden relative group backdrop-blur-md">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold">
                {classStats.occupancyRate}% Ocupación
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">
                {classStats.totalBookings} Alumnos
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Reservas Confirmadas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 overflow-hidden relative group backdrop-blur-md">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <UserCheck className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/30 uppercase font-bold">
                Staff Activo
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">
                {classStats.trainersCount} Entrenadores
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Instructores Disponibles
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 overflow-hidden relative group backdrop-blur-md">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30 uppercase font-bold">
                Tiempo Total
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">
                {classStats.totalMins} Min
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Horas de Entrenamiento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search + Status Pills + Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
        <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
          {/* SINGLE UNIFIED SEARCH INPUT */}
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar clase por nombre, instructor o sala..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar w-full md:w-auto">
            {[
              { id: "ALL", label: "Todas" },
              { id: "SCHEDULED", label: "Programadas" },
              { id: "IN_PROGRESS", label: "En Curso" },
              { id: "COMPLETED", label: "Dictadas" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  statusFilter === s.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center gap-3 justify-end shrink-0">
          <Dialog
            open={isCreateTrainerOpen}
            onOpenChange={(val) => dispatch({ type: "SET_CREATE_TRAINER_OPEN", payload: val })}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="size-3.5 mr-2 text-primary" /> Nuevo Entrenador
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Staff Técnico</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Añade un nuevo instructor al equipo.
                </DialogDescription>
              </DialogHeader>
              {isCreateTrainerOpen && (
                <TrainerForm onSuccess={() => dispatch({ type: "SET_CREATE_TRAINER_OPEN", payload: false })} />
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateClassOpen}
            onOpenChange={(val) => dispatch({ type: "SET_CREATE_CLASS_OPEN", payload: val })}
          >
            <DialogTrigger asChild>
              <Button className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus className="size-4 mr-2" /> Programar Clase
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Nueva Sesión Grupal</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Define el horario, aforo y entrenador para la clase dirigidos.
                </DialogDescription>
              </DialogHeader>
              {isCreateClassOpen && (
                <ClassForm
                  trainers={trainers}
                  onSuccess={() => dispatch({ type: "SET_CREATE_CLASS_OPEN", payload: false })}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Schedule Timeline View */}
        <div className="lg:col-span-8 space-y-6">
          <WeeklyCalendar
            selectedDate={selectedDate}
            onDateSelect={(date) => dispatch({ type: "SET_SELECTED_DATE", payload: date })}
          />

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Sesiones para el {mounted ? formatLongDate(selectedDate) : "..."}
            </h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-xs font-bold px-3 py-1">
              {filteredClasses.length} Sesiones
            </Badge>
          </div>

          <div className="grid gap-4">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((session: any) => {
                const bookingsCount = session._count?.bookings || 0;
                const maxCap = session.maxCapacity || 1;
                const pct = Math.min(100, Math.round((bookingsCount / maxCap) * 100));

                return (
                  <div
                    key={session.id}
                    onClick={() => dispatch({ type: "SET_SELECTED_CLASS", payload: session.id })}
                    className="glass-card group overflow-hidden border-white/15 hover:border-primary/40 bg-zinc-950/80 backdrop-blur-md rounded-3xl flex flex-col md:flex-row relative cursor-pointer transition-all duration-300 shadow-xl"
                  >
                    {/* Actions Dropdown */}
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-xl hover:bg-white/10 text-muted-foreground"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-2xl">
                          <DropdownMenuItem
                            className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: "SET_EDITING_CLASS", payload: session });
                            }}
                          >
                            <Edit2 className="size-3 text-primary" /> Editar Sesión
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-rose-500/20 text-rose-400 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(session.id);
                            }}
                          >
                            <Trash2 className="size-3" /> Cancelar Clase
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Time Column */}
                    <div className="bg-white/5 p-6 md:w-36 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 shrink-0">
                      <p className="text-3xl font-serif font-bold text-foreground leading-none mb-1.5">
                        {mounted ? formatTime(new Date(session.startTime), "HH:mm") : "--:--"}
                      </p>
                      <p className="text-[9px] uppercase tracking-widest text-primary font-mono font-bold">
                        {mounted ? formatDate(new Date(session.startTime), "aaaa") : "..."}
                      </p>
                    </div>

                    {/* Session Details Column */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 pr-8">
                          <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                            {session.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5",
                              session.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : session.status === "IN_PROGRESS"
                                ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                                : "bg-primary/10 text-primary border-primary/30",
                            )}
                          >
                            {session.status === "COMPLETED"
                              ? "Dictada"
                              : session.status === "IN_PROGRESS"
                              ? "En Curso"
                              : "Programada"}
                          </Badge>
                        </div>

                        {/* Technical Indicators */}
                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                          <div className="flex items-center gap-1.5 text-foreground/90">
                            <Users className="size-3.5 text-primary shrink-0" />
                            <span>
                              {bookingsCount} / {maxCap} Cupos
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-foreground/90">
                            <Clock className="size-3.5 text-primary shrink-0" />
                            <span>{session.durationMins} Minutos</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-foreground/90">
                            <MapPin className="size-3.5 text-primary shrink-0" />
                            <span>{session.location || "Sala Principal"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Capacity Meter Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <span>Aforo Reservado</span>
                          <span className={cn(pct >= 90 ? "text-rose-400 font-bold" : "text-emerald-400")}>
                            {pct}% ({bookingsCount}/{maxCap})
                          </span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              pct >= 90
                                ? "bg-rose-500"
                                : pct >= 70
                                ? "bg-amber-500"
                                : "bg-primary",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Trainer Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs overflow-hidden relative shrink-0">
                            {session.trainer?.photo ? (
                              <Image
                                src={session.trainer.photo}
                                alt={session.trainer.fullName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              session.trainer?.fullName?.substring(0, 2).toUpperCase() || "TR"
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{session.trainer?.fullName}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-mono">Instructor</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                          <span>Ver Alumnos</span>
                          <ChevronRight className="size-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center glass-card border-dashed border-white/10 rounded-3xl space-y-3">
                <Dumbbell className="size-12 mx-auto text-primary/40" />
                <p className="font-serif font-bold text-lg text-foreground">No hay clases programadas</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No se encontraron sesiones para la fecha o filtros seleccionados. Programe una nueva sesión o cambie la fecha.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Trainers Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-3xl border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-foreground">Staff de Instructores</h3>
                <p className="text-xs text-muted-foreground">Equipo a cargo de las clases dirigidas</p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-xs font-bold px-2.5 py-0.5">
                {trainers.length} Activos
              </Badge>
            </div>

            <div className="space-y-3">
              {trainers.map((trainer: any) => (
                <Link
                  key={trainer.id}
                  href={`/trainers/${trainer.id}`}
                  className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs overflow-hidden relative shrink-0">
                      {trainer.photo ? (
                        <Image
                          src={trainer.photo}
                          alt={trainer.fullName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        trainer.fullName.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {trainer.fullName}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate max-w-[140px]">
                        {trainer.email || "Sin email"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Class Dialog */}
      {editingClass && (
        <Dialog open={!!editingClass} onOpenChange={() => dispatch({ type: "SET_EDITING_CLASS", payload: null })}>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">Ajustar Sesión</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Modifica los detalles de la clase programada.
              </DialogDescription>
            </DialogHeader>
            <ClassForm
              initialData={editingClass}
              trainers={trainers}
              onSuccess={() => dispatch({ type: "SET_EDITING_CLASS", payload: null })}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Class Details Modal */}
      <ClassDetailsDialog
        classId={selectedClassId}
        onClose={() => dispatch({ type: "SET_SELECTED_CLASS", payload: null })}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Cancelar Clase Programada"
        description="¿Estás seguro de cancelar esta sesión? Esta acción no se puede deshacer y notificará a los socios inscritos."
        confirmText="Cancelar Clase"
        cancelText="Volver"
        variant="danger"
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
