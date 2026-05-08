"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MoreHorizontal, Edit2, Trash2, Plus, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrainerForm } from "@/components/shared/forms/TrainerForm";
import { toast } from "sonner";
import Link from "next/link";

export function TrainersClient({ data }: { data: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingTrainer, setEditingTrainer] = React.useState<any>(null);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este entrenador?")) {
      const res = await fetch(`/api/trainers?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success("Entrenador eliminado");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "fullName",
      header: "Entrenador",
      cell: ({ row }) => (
        <Link href={`/trainers/${row.original.id}`} className="flex items-center gap-3 hover:underline">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            {row.original.photo ? (
              <img src={row.original.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground/30" />
            )}
          </div>
          <div>
            <div className="font-medium">{row.original.fullName}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: "specialties",
      header: "Especialidades",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.specialties || []).slice(0, 3).map((spec: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {spec}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone}</span>,
    },
    {
      accessorKey: "commissionPct",
      header: "Comisión",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.commissionPct ? `${row.original.commissionPct}%` : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingTrainer(row.original)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrenadores</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona los trainers de tu gimnasio
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Entrenador
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Staff Técnico</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Añade un nuevo instructor al equipo.
              </DialogDescription>
            </DialogHeader>
            <TrainerForm
              onSuccess={() => {
                setIsCreateOpen(false);
                toast.success("Entrenador creado");
                window.location.reload();
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={data} filterColumn="fullName" />
      
      {editingTrainer && (
        <Dialog open={!!editingTrainer} onOpenChange={(open) => !open && setEditingTrainer(null)}>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Editar Perfil</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Actualiza la información técnica del entrenador.
              </DialogDescription>
            </DialogHeader>
            <TrainerForm
              trainer={editingTrainer}
              onSuccess={() => {
                setEditingTrainer(null);
                toast.success("Entrenador actualizado");
                window.location.reload();
              }}
              onCancel={() => setEditingTrainer(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}