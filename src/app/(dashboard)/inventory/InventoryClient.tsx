"use client";

import React, { useState } from "react";
import {
  Wrench,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Dumbbell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EquipmentStatus } from "@prisma/client";
import { EquipmentForm } from "@/components/shared/forms/EquipmentForm";
import { deleteEquipmentAction } from "@/lib/actions/inventory-actions";
import { MaintenanceSchedule } from "@/components/shared/MaintenanceSchedule";
import Image from "next/image";
import { formatDate } from "@/lib/formats";

export function InventoryClient({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este equipo?")) {
      const res = await deleteEquipmentAction(id);
      if (res.success) toast.success("Equipo eliminado");
      else toast.error(res.error);
    }
  };

  const getStatusInfo = (status: EquipmentStatus) => {
    switch (status) {
      case "OPERATIONAL":
        return {
          label: "Operativo",
          color: "text-green-500",
          bg: "bg-green-500/10",
          icon: CheckCircle2,
        };
      case "MAINTENANCE":
        return {
          label: "En Mantenimiento",
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
          icon: Clock,
        };
      case "OUT_OF_SERVICE":
        return {
          label: "Fuera de Servicio",
          color: "text-red-500",
          bg: "bg-red-500/10",
          icon: AlertTriangle,
        };
      default:
        return {
          label: "Desconocido",
          color: "text-muted-foreground",
          bg: "bg-muted/10",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o categoría..."
              className="pl-11 h-12 bg-secondary/20 border-white/5 rounded-2xl focus:bg-background/40 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-background/50 p-1 rounded-2xl border border-white/10 w-full md:w-auto overflow-x-auto scrollbar-hide">
            {["ALL", "OPERATIONAL", "MAINTENANCE", "OUT_OF_SERVICE"].map(
              (status) => {
                const info =
                  status === "ALL"
                    ? null
                    : getStatusInfo(status as EquipmentStatus);
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                      statusFilter === status
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-white/5",
                    )}
                  >
                    {status === "ALL" ? "Todos" : info?.label}
                  </button>
                );
              },
            )}
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsScheduleOpen(true)}
            className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest transition-all"
          >
            <Wrench className="w-4 h-4 mr-2" /> Cronograma
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-2xl h-12 px-6 shadow-lg shadow-primary/20 bg-primary font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Equipo
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => {
          const status = getStatusInfo(item.status);
          const isOverdue =
            item.nextMaintenance && new Date(item.nextMaintenance) < new Date();

          return (
            <Card
              key={item.id}
              className="border-border/10 bg-secondary/10 backdrop-blur-sm overflow-hidden hover:border-primary/20 transition-all group relative p-0"
            >
              <div className="h-64 relative overflow-hidden bg-background/40">
                {item.photo ? (
                  <Image
                    src={item.photo}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110 duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                    <Dumbbell className="w-20 h-20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge
                    className={cn(
                      "border-none font-bold text-[8px] tracking-[0.2em] px-3 py-1.5 shadow-lg backdrop-blur-md",
                      status.bg,
                      status.color,
                    )}
                  >
                    {status.label.toUpperCase()}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
                      >
                        <MoreVertical className="w-4 h-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-background/80 backdrop-blur-xl border-white/10 rounded-2xl p-1 shadow-2xl"
                    >
                      <DropdownMenuItem
                        onClick={() => setEditingItem(item)}
                        className="text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl focus:bg-primary/10 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 mr-2" /> Editar Equipo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl focus:bg-red-500/10 text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                      {item.category}
                    </p>
                    <h3 className="text-xl font-serif mt-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  {isOverdue && (
                    <div
                      className="animate-pulse bg-red-500/10 text-red-500 p-1.5 rounded-lg border border-red-500/20"
                      title="Mantenimiento Vencido"
                    >
                      <AlertTriangle className="size-4" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-background/20 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Wrench className="size-3 text-primary/60" /> Último
                      Mant.
                    </p>
                    <p className="text-xs font-medium tracking-tight">
                      {item.lastMaintenance
                        ? formatDate(item.lastMaintenance)
                        : "Pendiente"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-primary/60" /> Próximo
                      Mant.
                    </p>
                    <p
                      className={cn(
                        "text-xs font-medium tracking-tight",
                        isOverdue ? "text-red-500 font-bold" : "",
                      )}
                    >
                      {item.nextMaintenance
                        ? formatDate(item.nextMaintenance)
                        : "No programado"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">
                      S/N
                    </span>
                    <span className="text-[10px] font-mono opacity-40">
                      {item.serialNumber || "N/A"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                    className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-white/5 hover:bg-primary hover:text-white hover:border-primary transition-all flex-1"
                  >
                    Mantenimiento
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Dumbbell className="size-10" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.4em]">
            Sin equipos registrados
          </p>
          <p className="text-[10px] mt-2 tracking-widest">
            Inicia agregando una nueva máquina al inventario
          </p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif">
              Registrar Activo
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
              Añade nueva maquinaria al inventario de GymOS.
            </DialogDescription>
          </DialogHeader>
          <EquipmentForm onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif">
              Cronograma de Mantenimiento
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
              Seguimiento de la salud técnica y ciclos de servicio de tus
              activos.
            </DialogDescription>
          </DialogHeader>
          <MaintenanceSchedule data={data} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif">
              Gestión de Equipo
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
              Ajusta el estado y detalles de {editingItem?.name}.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <EquipmentForm
              initialData={editingItem}
              onSuccess={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
