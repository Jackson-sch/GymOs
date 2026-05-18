"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { WeeklyCalendar } from "@/components/shared/WeeklyCalendar";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { bookPortalClassAction, cancelPortalBookingAction } from "@/lib/actions/portal-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClassesClientProps {
  initialData: any;
}

export function ClassesClient({ initialData: data }: ClassesClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const classesForSelectedDate = data.availableClasses.filter((c: any) => 
    isSameDay(parseISO(c.startTime), selectedDate)
  );

  const myBookings = data.myBookings;

  const handleBook = async (classId: string) => {
    setLoading(classId);
    try {
      const res = await bookPortalClassAction(classId);
      if (res.success) {
        toast.success(res.message);
        // Refresh data (simplified for now by just updating status locally or full reload)
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Error al procesar la reserva");
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    setLoading(confirmCancel);
    try {
      const res = await cancelPortalBookingAction(confirmCancel);
      if (res.success) {
        toast.success(res.message);
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Error al cancelar");
    } finally {
      setLoading(null);
      setConfirmCancel(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-white/5 bg-primary/5 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Calendar className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mis Reservas</p>
            <p className="text-2xl font-serif">{data.myBookings.filter((b: any) => b.status !== "CANCELLED").length}</p>
          </div>
        </div>
        <div className="glass-card p-6 border-white/5 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Asistencias</p>
            <p className="text-2xl font-serif">{data.myBookings.filter((b: any) => b.status === "ATTENDED").length}</p>
          </div>
        </div>
        <div className="glass-card p-6 border-white/5 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <Users className="size-6 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Cupos Libres</p>
            <p className="text-2xl font-serif">{data.availableClasses.length}</p>
          </div>
        </div>
      </div>

      <WeeklyCalendar 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classes List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-serif flex items-center gap-2 mb-6">
            <Clock className="size-5 text-primary" />
            Clases para el {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h2>

          {classesForSelectedDate.length === 0 ? (
            <div className="glass-card p-12 text-center border-white/5">
              <div className="bg-white/5 size-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Calendar className="size-8 text-muted-foreground opacity-20" />
              </div>
              <p className="text-muted-foreground italic">No hay clases programadas para este día.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classesForSelectedDate.map((c: any) => {
                const booking = myBookings.find((b: any) => b.classId === c.id);
                const isFull = c._count.bookings >= c.maxCapacity;
                
                return (
                  <div key={c.id} className="glass-card p-6 border-white/5 flex flex-col group hover:border-primary/30 transition-all duration-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-primary/20 text-primary text-[10px] font-semibold px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
                        {c.name}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {format(parseISO(c.startTime), "HH:mm")}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif mb-4 group-hover:text-primary transition-colors">{c.description || c.name}</h3>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <User className="size-4" />
                        <span>{c.trainer?.fullName || "Instructor"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Users className="size-4" />
                        <span>{c._count.bookings} / {c.maxCapacity} cupos</span>
                      </div>
                    </div>

                    {booking ? (
                      <div className={cn(
                        "w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border",
                        booking.status === "CONFIRMED" 
                          ? "bg-green-500/10 border-green-500/20 text-green-500"
                          : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                      )}>
                        <CheckCircle2 className="size-4" />
                        {booking.status === "CONFIRMED" ? "RESERVADO" : "EN ESPERA"}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleBook(c.id)}
                        disabled={loading === c.id}
                        variant={isFull ? "outline" : "default"}
                        className={cn(
                          "w-full py-6 rounded-xl font-semibold tracking-tight shadow-xl",
                          isFull && "border-white/10 hover:bg-white/5"
                        )}
                      >
                        {loading === c.id ? "Procesando..." : isFull ? "Lista de Espera" : "Reservar Ahora"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Current Bookings */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            Mis Próximas Clases
          </h2>

          <div className="space-y-4">
            {myBookings.reduce((acc: any[], b: any) => {
              if (b.status !== "CANCELLED") {
                acc.push(
                  <div key={b.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {format(parseISO(b.class.startTime), "EEEE d 'de' MMMM", { locale: es })}
                      </span>
                      <button 
                        onClick={() => setConfirmCancel(b.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <XCircle className="size-4" />
                      </button>
                    </div>
                    <h4 className="font-medium mb-1">{b.class.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{format(parseISO(b.class.startTime), "HH:mm")}</span>
                      <span>•</span>
                      <span className={cn(
                        "font-semibold",
                        b.status === "CONFIRMED" ? "text-green-500" : "text-yellow-500"
                      )}>
                        {b.status === "CONFIRMED" ? "Confirmada" : "En Espera"}
                      </span>
                    </div>
                    {b.status === "WAITLISTED" ? (
                      <div className="mt-2 text-[9px] uppercase tracking-widest font-semibold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg inline-block">
                        Turno: Próximo en lista
                      </div>
                    ) : (
                      <a 
                        href={generateGoogleCalendarUrl({
                          title: `Clase: ${b.class.name}`,
                          start: parseISO(b.class.startTime),
                          end: parseISO(b.class.endTime),
                          location: b.class.location || "GymOS",
                          description: `Entrenador: ${b.class.trainer?.fullName || 'N/A'}`
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-[9px] uppercase tracking-widest font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                      >
                        <Calendar className="size-3" />
                        Añadir a Google Calendar
                      </a>
                    )}
                  </div>
                );
              }
              return acc;
            }, [])}
            {myBookings.filter((b: any) => b.status !== "CANCELLED").length === 0 && (
              <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                <p className="text-sm text-muted-foreground">No tienes reservas activas.</p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <AlertCircle className="size-5" />
              <h4 className="font-semibold text-sm uppercase tracking-wider">Importante</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Recuerda cancelar tu asistencia con al menos 2 horas de anticipación si no puedes asistir. 
              Esto permite que otros socios en lista de espera puedan tomar tu lugar.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!confirmCancel} onOpenChange={(open) => !open && setConfirmCancel(null)}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[425px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif mb-2">¿Cancelar reserva?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Esta acción liberará tu cupo para otro socio. No podrás deshacer esta acción si la clase se llena.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-6">
            <Button variant="ghost" onClick={() => setConfirmCancel(null)} className="rounded-xl">
              Mantener Reserva
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={loading === confirmCancel}
              className="rounded-xl shadow-lg shadow-destructive/20"
            >
              {loading === confirmCancel ? "Cancelando..." : "Sí, Cancelar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
