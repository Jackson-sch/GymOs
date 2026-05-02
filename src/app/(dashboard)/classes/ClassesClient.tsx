"use client";

import React from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Dumbbell,
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { deleteClassAction } from "@/lib/actions/classes-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function ClassesClient({ classes, trainers }: { classes: any[], trainers: any[] }) {
  const [isCreateClassOpen, setIsCreateClassOpen] = React.useState(false);
  const [isCreateTrainerOpen, setIsCreateTrainerOpen] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<any>(null);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de cancelar esta clase?")) {
      const result = await deleteClassAction(id);
      if (result.success) toast.success("Clase cancelada");
      else toast.error(result.error);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Actions */}
      <div className="flex justify-end gap-4">
        <Dialog open={isCreateTrainerOpen} onOpenChange={setIsCreateTrainerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-6 h-12 font-sans font-semibold tracking-wide gap-2">
              Ver Entrenadores
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Staff Técnico</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Añade un nuevo instructor al equipo.
              </DialogDescription>
            </DialogHeader>
            {isCreateTrainerOpen && <TrainerForm onSuccess={() => setIsCreateTrainerOpen(false)} />}
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2">
              <Plus className="w-5 h-5" />
              Programar Clase
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Nueva Sesión</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Define el horario y entrenador para la clase grupal.
              </DialogDescription>
            </DialogHeader>
            {isCreateClassOpen && (
              <ClassForm 
                trainers={trainers} 
                onSuccess={() => setIsCreateClassOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Schedule View */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Próximas Sesiones</h2>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Hoy, {format(new Date(), "d 'de' MMMM", { locale: es })}</span>
          </div>

          <div className="grid gap-6">
            {classes.length > 0 ? (
              classes.map((session: any) => (
                <div key={session.id} className="glass-card group overflow-hidden border-white/5 interactive-hover flex flex-col md:flex-row relative">
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-white/10 bg-black/90 backdrop-blur-xl">
                        <DropdownMenuItem 
                          className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
                          onClick={() => setEditingClass(session)}
                        >
                          <Edit2 className="w-3 h-3" /> Editar Clase
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-rose-500/20 text-rose-500 cursor-pointer"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 className="w-3 h-3" /> Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="bg-white/[0.02] p-6 md:w-32 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                    <p className="text-2xl font-serif leading-none mb-1">{format(new Date(session.startTime), "HH:mm")}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{format(new Date(session.startTime), "aaa")}</p>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-serif">{session.name}</h3>
                        <Badge variant="outline" className="text-[8px] tracking-tighter uppercase px-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          <span>{session._count.bookings} / {session.maxCapacity} Cupos</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{session.durationMins} Minutos</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          <span>{session.location || "Sala Principal"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Entrenador</p>
                        <p className="text-sm font-medium">{session.trainer.fullName}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {session.trainer.photo ? (
                          <img src={session.trainer.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-5 h-5 text-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center glass-card border-dashed border-white/10 opacity-30">
                <Dumbbell className="w-12 h-12 mx-auto mb-4" />
                <p className="font-serif text-lg">No hay clases programadas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Trainers Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Staff Activo</h2>
            <TrendingUp className="w-5 h-5 text-primary opacity-50" />
          </div>

          <div className="space-y-4">
            {trainers.map((trainer: any) => (
              <div key={trainer.id} className="glass-card p-4 border-white/5 interactive-hover flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                  {trainer.photo ? (
                    <img src={trainer.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-primary/60" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{trainer.fullName}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest truncate max-w-[120px]">
                    {trainer.email}
                  </p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] px-1.5 h-4 uppercase font-bold">Activo</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Class Dialog */}
      <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
        <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif">Ajustar Sesión</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
              Modifica los detalles de la clase programada.
            </DialogDescription>
          </DialogHeader>
          {editingClass && (
            <ClassForm 
              initialData={editingClass} 
              trainers={trainers}
              onSuccess={() => setEditingClass(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
