"use client";

import React, { useState, useReducer, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  Dumbbell,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { ClassDetailsDialog } from "./components/ClassDetailsDialog";
import { ClassStatsGrid } from "./components/ClassStatsGrid";
import { ClassControlBar } from "./components/ClassControlBar";
import { ClassSessionCard } from "./components/ClassSessionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassForm } from "@/components/shared/forms/ClassForm";
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
      <ClassStatsGrid stats={classStats} />

      <ClassControlBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dispatch={dispatch}
        state={state}
        trainers={trainers}
      />

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
              filteredClasses.map((session: any) => (
                <ClassSessionCard
                  key={session.id}
                  session={session}
                  mounted={mounted}
                  onSelect={(id) => dispatch({ type: "SET_SELECTED_CLASS", payload: id })}
                  onEdit={(sess) => dispatch({ type: "SET_EDITING_CLASS", payload: sess })}
                  onDelete={(id) => setDeletingId(id)}
                />
              ))
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
                  className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-colors duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs overflow-hidden relative shrink-0">
                      {trainer.photo ? (
                        <Image
                          src={trainer.photo}
                          alt={trainer.fullName}
                          fill
                          sizes="44px"
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
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate max-w-35">
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
