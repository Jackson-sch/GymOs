import React from "react";
import { getTrainerPortalDataAction } from "@/lib/actions/routine-actions";
import { verifySession } from "@/lib/security";
import { Calendar, Clock, MapPin, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function TrainerClassesPage() {
  await verifySession(["TRAINER", "ADMIN", "SUPER_ADMIN"]);
  const res = await getTrainerPortalDataAction();

  if (!res.success || !res.data || !('upcomingClasses' in res.data)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-serif text-muted-foreground">{res.error || "Datos no encontrados"}</h2>
      </div>
    );
  }

  const upcomingClasses = (res.data as any).upcomingClasses || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-serif">Gestión de Clases</h1>
        <p className="text-muted-foreground">Consulta tu horario y gestiona la asistencia de tus clases próximas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingClasses.map((cls: any) => (
          <div key={cls.id} className="glass-card overflow-hidden border-white/5 hover:border-white/10 transition-all group flex flex-col">
            <div className="p-6 space-y-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{cls.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {cls.location || "Sala Principal"}
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {cls.bookings.length} / {cls.maxCapacity}
                </Badge>
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-primary/70" />
                  <span className="text-sm">{format(new Date(cls.startTime), "EEEE d 'de' MMMM", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary/70" />
                  <span className="text-sm">
                    {format(new Date(cls.startTime), "HH:mm")} - {format(new Date(cls.endTime), "HH:mm")}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {cls.bookings.length} Reservas confirmadas
              </div>
              <Link href={`/portal/trainer/classes/${cls.id}/attendance`}>
                <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-lg h-9 px-4 uppercase text-[10px] font-bold tracking-widest">
                  Pasar Lista <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}

        {upcomingClasses.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 glass-card border-dashed border-white/10">
            <Calendar className="size-12 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">No tienes clases próximas asignadas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
