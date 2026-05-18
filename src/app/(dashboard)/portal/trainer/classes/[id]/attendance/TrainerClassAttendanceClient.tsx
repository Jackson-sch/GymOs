"use client";

import React from "react";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  UserMinus,
  Loader2,
  Calendar,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { markClassAttendanceAction } from "@/lib/actions/attendance-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function TrainerClassAttendanceClient({ gymClass }: { gymClass: any }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loadingIds, setLoadingIds] = React.useState<string[]>([]);

  const filteredBookings = gymClass.bookings.filter((b: any) => 
    b.member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.member.dni.includes(searchTerm)
  );

  const handleToggleAttendance = async (memberId: string, currentStatus: string) => {
    setLoadingIds(prev => [...prev, memberId]);
    const isAttended = currentStatus === "ATTENDED";
    
    try {
      const res = await markClassAttendanceAction({
        classId: gymClass.id,
        memberId,
        attended: !isAttended
      });

      if (res.success) {
        toast.success(isAttended ? "Asistencia removida" : "Asistencia registrada");
      } else {
        toast.error(res.error || "Error al procesar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== memberId));
    }
  };

  const attendedCount = gymClass.bookings.filter((b: any) => b.status === "ATTENDED").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Resumen de Clase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 border-white/5 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Inscritos</p>
            <p className="text-xl font-sans font-light">{gymClass.bookings.length} / {gymClass.maxCapacity}</p>
          </div>
        </div>

        <div className="glass-card p-4 border-white/5 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Presentes</p>
            <p className="text-xl font-sans font-light text-emerald-500">{attendedCount}</p>
          </div>
        </div>

        <div className="glass-card p-4 border-white/5 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Horario</p>
            <p className="text-sm font-sans font-medium">
              {format(new Date(gymClass.startTime), "HH:mm")} - {format(new Date(gymClass.endTime), "HH:mm")}
            </p>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Buscar por nombre o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/20 text-lg font-serif"
        />
      </div>

      {/* Lista de Socios */}
      <div className="space-y-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking: any) => (
            <div 
              key={booking.id} 
              className={cn(
                "glass-card p-4 border-white/5 flex items-center justify-between transition-all group",
                booking.status === "ATTENDED" && "bg-emerald-500/5 border-emerald-500/20"
              )}
            >
              <div className="flex items-center gap-4">
                <Avatar className="size-12 border border-white/10">
                  <AvatarImage src={booking.member.photo || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {booking.member.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">{booking.member.fullName}</h3>
                  <p className="text-xs text-muted-foreground">DNI: {booking.member.dni}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] uppercase tracking-tighter",
                      booking.status === "ATTENDED" 
                        ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" 
                        : "border-white/10 text-muted-foreground"
                    )}
                  >
                    {booking.status === "ATTENDED" ? "Presente" : "Ausente"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  {loadingIds.includes(booking.memberId) ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : (
                    <Switch 
                      checked={booking.status === "ATTENDED"}
                      onCheckedChange={() => handleToggleAttendance(booking.memberId, booking.status)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 glass-card bg-white/5 border-dashed border-white/10">
            <UserMinus className="size-12 text-muted-foreground opacity-20" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No se encontraron inscritos</p>
              <p className="text-xs text-muted-foreground">
                {searchTerm ? "Intenta con otro término de búsqueda" : "No hay reservas para esta clase"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
