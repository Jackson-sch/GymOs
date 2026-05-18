"use client";

import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  getClassDetailWithBookingsAction, 
  getMembersForBookingAction, 
  createBookingAction, 
  updateBookingStatusAction, 
  cancelBookingAction,
  completeClassAction 
} from "@/lib/actions/classes-actions";
import { MemberCombobox } from "@/components/shared/MemberCombobox";
import { toast } from "sonner";
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  UserPlus,
  Loader2,
  Trash2,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ClassDetailsDialogProps {
  classId: string | null;
  onClose: () => void;
}

export function ClassDetailsDialog({ classId, onClose }: ClassDetailsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classData, setClassData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const loadData = async () => {
    if (!classId) return;
    setLoading(true);
    const [classRes, membersRes] = await Promise.all([
      getClassDetailWithBookingsAction(classId),
      getMembersForBookingAction()
    ]);

    if (classRes.success) setClassData(classRes.data);
    if (membersRes.success) setMembers(membersRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (classId) loadData();
  }, [classId]);

  const handleAddBooking = async () => {
    if (!selectedMemberId || !classId) return;
    setSubmitting(true);
    const res = await createBookingAction(classId, selectedMemberId);
    if (res.success) {
      toast.success("Socio inscrito correctamente");
      setSelectedMemberId("");
      loadData();
    } else {
      toast.error(res.error);
    }
    setSubmitting(false);
  };

  const handleUpdateStatus = async (bookingId: string, status: "CONFIRMED" | "CANCELLED" | "ATTENDED") => {
    const res = await updateBookingStatusAction(bookingId, status);
    if (res.success) {
      toast.success("Estado actualizado");
      loadData();
    } else {
      toast.error(res.error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const res = await cancelBookingAction(bookingId);
    if (res.success) {
      toast.success("Reserva cancelada");
      loadData();
    } else {
      toast.error(res.error);
    }
  };

  if (!classId) return null;

  return (
    <Dialog open={!!classId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-black/90 backdrop-blur-2xl border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">Detalles de la Clase</DialogTitle>
        <DialogDescription className="sr-only">Detalles de la sesión, lista de inscritos y gestión de asistencia.</DialogDescription>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : classData ? (
          <div className="flex flex-col">
            {/* Header / Info */}
            <div className="p-6 border-b border-white/10 bg-linear-to-br from-primary/20 to-transparent">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "mb-2 border-primary/20",
                      classData.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary"
                    )}>
                      {classData.status === "COMPLETED" ? "Finalizada" : classData.status}
                    </Badge>
                    {classData.status !== "COMPLETED" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={async () => {
                          if (confirm("¿Finalizar sesión? Esto cerrará la asistencia y la contará para nómina.")) {
                            setSubmitting(true);
                            const res = await completeClassAction(classId!);
                            if (res.success) {
                              toast.success("Sesión finalizada");
                              loadData();
                            } else {
                              toast.error(res.error);
                            }
                            setSubmitting(false);
                          }
                        }}
                        className="h-6 rounded-full text-[9px] uppercase font-bold tracking-tighter border-white/10 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        Finalizar Sesión
                      </Button>
                    )}
                  </div>
                  <DialogTitle className="text-2xl font-serif tracking-tight">
                    {classData.name}
                  </DialogTitle>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-primary font-bold text-xl">
                    <Users className="size-5" />
                    <span>{classData.bookings.filter((b: any) => b.status !== "CANCELLED").length} / {classData.maxCapacity}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Capacidad</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Fecha</p>
                    <p className="text-sm font-medium">{format(new Date(classData.startTime), "EEEE dd", { locale: es })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Clock className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Hora</p>
                    <p className="text-sm font-medium">{format(new Date(classData.startTime), "HH:mm")} - {format(new Date(classData.endTime), "HH:mm")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <MapPin className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sala</p>
                    <p className="text-sm font-medium">{classData.location || "Sala Principal"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inscription Form */}
            <div className="p-6 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <MemberCombobox 
                    members={members} 
                    value={selectedMemberId} 
                    onChange={setSelectedMemberId}
                    placeholder="Buscar socio para inscribir..."
                  />
                </div>
                <Button 
                  onClick={handleAddBooking} 
                  disabled={submitting || !selectedMemberId || classData.bookings.length >= classData.maxCapacity}
                  className="rounded-2xl h-12 px-6 gap-2"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                  Inscribir
                </Button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
              <div className="p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 px-2">Socios Inscritos</p>
                {classData.bookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="size-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm italic">No hay socios inscritos aún</p>
                  </div>
                ) : (
                  classData.bookings.map((booking: any) => (
                    <div 
                      key={booking.id} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all",
                        booking.status === "CANCELLED" 
                          ? "bg-rose-500/5 border-rose-500/10 opacity-60" 
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-white/10">
                          <AvatarImage src={booking.member.photo} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {booking.member.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">{booking.member.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">DNI: {booking.member.dni}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.status === "CONFIRMED" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleUpdateStatus(booking.id, "ATTENDED")}
                              className="h-8 rounded-lg hover:bg-emerald-500/20 text-emerald-500 gap-2"
                            >
                              <Check className="size-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Presente</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleCancelBooking(booking.id)}
                              className="h-8 w-8 rounded-lg hover:bg-rose-500/20 text-rose-500"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </>
                        )}
                        {booking.status === "ATTENDED" && (
                          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/20 gap-1 px-3 py-1">
                            <CheckCircle2 className="size-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Asistió</span>
                          </Badge>
                        )}
                        {booking.status === "CANCELLED" && (
                          <Badge variant="outline" className="border-white/10 text-muted-foreground gap-1 px-3 py-1">
                            <XCircle className="size-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Cancelada</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-rose-500">
            Error al cargar la clase
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
