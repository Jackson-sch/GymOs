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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="size-3.5" />
            Reserva de Clases Grupales
          </div>
          <h1 className="text-3xl font-serif font-bold">Horario de Clases en Vivo</h1>
          <p className="text-xs text-muted-foreground">
            Asegura tu cupo en tus disciplinas favoritas en tiempo real.
          </p>
        </div>
      </div>

      {!classes || classes.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 space-y-6 glass-card p-8 border-white/10">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-muted-foreground">
            <Calendar className="size-8" />
          </div>
          <h2 className="text-xl font-serif font-bold">No hay clases programadas hoy</h2>
          <p className="text-xs text-muted-foreground">
            Revisa más tarde o consulta los horarios con la recepción de tu gimnasio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => {
            const isBooked = cls.isBookedByMe;
            const availableSlots = cls.capacity - (cls.bookedCount || 0);
            const isFull = availableSlots <= 0;
            const isLoading = loadingId === cls.id || loadingId === cls.myBookingId;

            return (
              <div
                key={cls.id}
                className={`glass-card p-6 border-white/10 space-y-5 transition-all shadow-xl flex flex-col justify-between ${
                  isBooked ? "bg-primary/10 border-primary/40" : "hover:border-white/20"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold ${
                        isBooked
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : isFull
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {isBooked ? "✓ Reservado" : isFull ? "Agotado" : `${availableSlots} Cupos Libres`}
                    </Badge>

                    {cls.branchName && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                        <MapPin className="size-3 text-primary" /> {cls.branchName}
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

                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Clock className="size-3.5 text-primary" />
                        {typeof cls.schedule === "string" || cls.schedule instanceof Date
                          ? format(new Date(cls.schedule), "EEEE d 'de' MMMM, HH:mm 'hrs'", { locale: es })
                          : "Por definir"}
                      </span>
                    </div>

                    {cls.trainerName && (
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        <span>Instructor: <strong className="text-foreground">{cls.trainerName}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground" />
                      <span>Aforo: {cls.bookedCount} / {cls.capacity} asistencias registradas</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isBooked ? (
                    <Button
                      onClick={() => cls.myBookingId && handleCancel(cls.myBookingId)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-11 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30 text-xs font-bold gap-2"
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
                      {isFull ? "Sin Cupos Disponibles" : "Reservar Mi Cupo Instantáneo"}
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
