"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  Loader2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { bookClassAction, cancelBookingAction } from "@/lib/actions/classes-actions";

interface ClassItem {
  id: string;
  name: string;
  description?: string | null;
  trainerName?: string | null;
  capacity: number;
  bookedCount: number;
  schedule: string | Date;
  isBookedByMe?: boolean;
  myBookingId?: string | null;
  branchName?: string | null;
}

export function PortalClassesClient({ classes, memberId }: { classes: ClassItem[]; memberId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "BOOKED" | "AVAILABLE">("ALL");

  const bookedCount = classes.filter((c) => c.isBookedByMe).length;
  const filteredClasses = classes.filter((c) => {
    if (filter === "BOOKED") return !!c.isBookedByMe;
    if (filter === "AVAILABLE") return c.capacity - (c.bookedCount || 0) > 0;
    return true;
  });

  const handleBook = async (classId: string) => {
    setLoadingId(classId);
    toast.info("Reservando tu cupo...");
    const res = await bookClassAction({ classId, memberId });
    setLoadingId(null);

    if (res.success) {
      toast.success("¡Cupo reservado con éxito! Te esperamos en la clase.");
    } else {
      toast.error(res.error || "No se pudo reservar el cupo");
    }
  };

  const handleCancel = async (bookingId: string) => {
    setLoadingId(bookingId);
    toast.info("Cancelando reserva...");
    const res = await cancelBookingAction(bookingId);
    setLoadingId(null);

    if (res.success) {
      toast.success("Reserva cancelada correctamente.");
    } else {
      toast.error(res.error || "Error al cancelar la reserva");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 dark:border-white/10 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-1">
            <Sparkles className="size-3.5" />
            Reserva de Clases Grupales
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Horario de Clases en Vivo</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Asegura tu cupo en tus disciplinas favoritas en tiempo real.
          </p>
        </div>

        {classes.length > 0 && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/50 dark:bg-white/5 border border-border/70 dark:border-white/10 self-start md:self-auto">
            {[
              { id: "ALL", label: `Todas (${classes.length})` },
              { id: "BOOKED", label: `Mis Reservas (${bookedCount})` },
              { id: "AVAILABLE", label: "Con Cupo" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as "ALL" | "BOOKED" | "AVAILABLE")}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                  filter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!classes || classes.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 space-y-4 glass-card p-5 sm:p-8 border-border/70 dark:border-white/10">
          <div className="size-16 rounded-2xl bg-muted/60 border border-border/70 flex items-center justify-center mx-auto text-muted-foreground">
            <Calendar className="size-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">No hay clases programadas hoy</h2>
          <p className="text-xs text-muted-foreground">
            Revisa más tarde o consulta los horarios con la recepción de tu gimnasio.
          </p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-14 space-y-3 glass-card p-5 sm:p-8 border-border/70 dark:border-white/10">
          <Calendar className="size-8 mx-auto text-muted-foreground/60" />
          <h2 className="text-lg font-serif font-bold text-foreground">Sin clases en esta categoría</h2>
          <p className="text-xs text-muted-foreground">
            Prueba seleccionando otro filtro para ver más horarios disponibles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClasses.map((cls) => {
            const isBooked = cls.isBookedByMe;
            const availableSlots = cls.capacity - (cls.bookedCount || 0);
            const isFull = availableSlots <= 0;
            const occupancyPct = cls.capacity > 0 ? Math.min(100, Math.round(((cls.bookedCount || 0) / cls.capacity) * 100)) : 0;
            const isLoading = loadingId === cls.id || loadingId === cls.myBookingId;

            return (
              <div
                key={cls.id}
                className={`glass-card p-6 space-y-5 transition-colors shadow-xl flex flex-col justify-between ${
                  isBooked
                    ? "bg-primary/5 border-primary/40"
                    : "border-border/70 dark:border-white/10 hover:border-primary/30"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold ${
                        isBooked
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : isFull
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          : "bg-primary/10 text-primary border-primary/25"
                      }`}
                    >
                      {isBooked ? "✓ Reservado" : isFull ? "Agotado" : `${availableSlots} Cupos Libres`}
                    </Badge>

                    {cls.branchName && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold">
                        <MapPin className="size-3.5 text-primary" /> {cls.branchName}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      {cls.name}
                    </h3>
                    {cls.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{cls.description}</p>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-border/60 dark:border-white/10 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground capitalize">
                      <Clock className="size-3.5 text-primary shrink-0" />
                      {typeof cls.schedule === "string" || cls.schedule instanceof Date
                        ? format(new Date(cls.schedule), "EEEE d 'de' MMMM, HH:mm 'hrs'", { locale: es })
                        : "Por definir"}
                    </div>

                    {cls.trainerName && (
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <span>Instructor: <strong className="text-foreground">{cls.trainerName}</strong></span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5 text-muted-foreground" />
                          Aforo registrado
                        </span>
                        <span className="font-mono font-semibold text-foreground tabular-nums">
                          {cls.bookedCount} / {cls.capacity}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] duration-500 ${
                            isFull ? "bg-rose-500" : "bg-primary"
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  {isBooked ? (
                    <Button
                      onClick={() => cls.myBookingId && handleCancel(cls.myBookingId)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/30 text-xs font-bold gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Cancelar Reserva
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBook(cls.id)}
                      disabled={isLoading || isFull}
                      className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-2 tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90"
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      {isFull ? "Sin Cupos Disponibles" : "Reservar Mi Cupo"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
