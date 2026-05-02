"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings2, 
  Wrench, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Plus,
  AlertCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EquipmentForm } from "@/components/shared/forms/EquipmentForm";
import { deleteEquipmentAction } from "@/lib/actions/inventory-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { MaintenanceSchedule } from "@/components/shared/MaintenanceSchedule";

export function InventoryClient({ data }: { data: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este equipo?")) {
      const result = await deleteEquipmentAction(id);
      if (result.success) toast.success("Equipo eliminado");
      else toast.error(result.error);
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "name",
      header: "Equipo",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">{row.original.category}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "serialNumber",
      header: "Número de Serie",
      cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.serialNumber || "N/A"}</span>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: any = {
          OPERATIONAL: { label: "Operativo", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          MAINTENANCE: { label: "Mantenimiento", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          OUT_OF_SERVICE: { label: "Fuera de Servicio", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
        };
        const config = variants[status] || { label: status, color: "" };
        return (
          <Badge variant="outline" className={`rounded-full text-[9px] uppercase tracking-widest px-2.5 ${config.color} border`}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "purchaseDate",
      header: "Adquisición",
      cell: ({ row }) => row.original.purchaseDate ? (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.original.purchaseDate), "MMM yyyy", { locale: es })}
        </span>
      ) : <span className="text-xs text-muted-foreground/30 italic">N/A</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/5">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-white/10 bg-black/90 backdrop-blur-xl">
            <DropdownMenuItem 
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
              onClick={() => setEditingItem(row.original)}
            >
              <Wrench className="w-3 h-3" /> Mant. / Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-rose-500/20 text-rose-500 cursor-pointer"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="w-3 h-3" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  return (
    <div className="space-y-12">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Settings2 className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Activos Fijos</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Inventario</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Gestionando la <span className="text-foreground font-medium">integridad y operatividad</span> de cada equipo en GymOS.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 h-12 px-6 font-sans font-semibold tracking-wide gap-2">
                <Wrench className="w-4 h-4" />
                Cronograma Mant.
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif">Cronograma de Mantenimiento</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Seguimiento de la salud técnica y ciclos de servicio de tus activos.
                </DialogDescription>
              </DialogHeader>
              <MaintenanceSchedule data={data} />
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2">
                <Plus className="w-5 h-5" />
                Nuevo Equipo
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif">Registrar Activo</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Añade nueva maquinaria al inventario de GymOS.
                </DialogDescription>
              </DialogHeader>
              {isCreateOpen && <EquipmentForm onSuccess={() => setIsCreateOpen(false)} />}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Equipos", val: data.length, icon: Settings2, color: "primary" },
          { label: "En Operación", val: data.filter((e: any) => e.status === "OPERATIONAL").length, icon: Settings2, color: "emerald" },
          { label: "Mantenimiento", val: data.filter((e: any) => e.status === "MAINTENANCE").length, icon: Wrench, color: "amber" },
          { label: "Inactivos", val: data.filter((e: any) => e.status === "OUT_OF_SERVICE").length, icon: AlertCircle, color: "rose" },
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 border-white/5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${item.color}-500/10 text-${item.color}-500 border border-${item.color}-500/20`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold">{item.label}</p>
              <p className="text-2xl font-serif">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        filterColumn="name" 
        placeholder="Buscar equipo por nombre o modelo..." 
      />

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif">Gestión de Equipo</DialogTitle>
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
