"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MoreHorizontal, Edit2, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { enableTrainerPortalAccessAction, disableTrainerPortalAccessAction } from "@/lib/actions/trainers-actions";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils";

interface ColumnsProps {
  onEdit: (trainer: any) => void;
  onDelete: (id: string) => void;
}

interface ActionCellProps {
  row: any;
  onEdit: (trainer: any) => void;
  onDelete: (id: string) => void;
}

const ActionCell = ({ row, onEdit, onDelete }: ActionCellProps) => {
  const [isDisableOpen, setIsDisableOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDisable = async () => {
    setIsLoading(true);
    const res = await disableTrainerPortalAccessAction(row.original.id);
    setIsLoading(false);
    setIsDisableOpen(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = () => {
    onDelete(row.original.id);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 hover:bg-white/5">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-white/10 bg-zinc-950/90 backdrop-blur-xl">
          <DropdownMenuItem 
            onClick={() => onEdit(row.original)}
            className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-white/10 cursor-pointer"
          >
            <Edit2 className="size-3" />
            Editar
          </DropdownMenuItem>
          {row.original.hasPortalAccess ? (
            <DropdownMenuItem 
              onClick={() => setIsDisableOpen(true)}
              className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-amber-500/10 text-amber-500 cursor-pointer"
            >
              <ShieldAlert className="size-3" />
              Deshabilitar Portal
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={async () => {
                const res = await enableTrainerPortalAccessAction(row.original.id);
                if (res.success) {
                  toast.success(res.message);
                } else {
                  toast.error(res.error);
                }
              }}
              className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-emerald-500/10 text-emerald-500 cursor-pointer"
            >
              <ShieldCheck className="size-3" />
              Habilitar Portal
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)} 
            className="gap-2 text-[10px] uppercase tracking-widest font-semibold focus:bg-rose-500/20 text-rose-500 cursor-pointer"
          >
            <Trash2 className="size-3" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        isOpen={isDisableOpen}
        onOpenChange={setIsDisableOpen}
        onConfirm={handleDisable}
        isLoading={isLoading}
        title="Deshabilitar Acceso"
        description={`¿Estás seguro de que deseas quitar el acceso al portal para ${row.original.fullName}? No podrá iniciar sesión hasta que sea habilitado nuevamente.`}
        confirmText="Deshabilitar"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Eliminar Entrenador"
        description={`¿Estás seguro de que deseas eliminar a ${row.original.fullName}? Esta acción no se puede deshacer y se perderán sus datos técnicos.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </>
  );
};

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<any>[] => [
  {
    accessorKey: "fullName",
    header: "Entrenador",
    cell: ({ row }) => (
      <Link href={`/trainers/${row.original.id}`} className="flex items-center gap-3 hover:underline">
        <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
          {row.original.photo ? (
            <Image 
              src={row.original.photo} 
              alt={row.original.fullName} 
              fill
              className="object-cover" 
              sizes="40px"
            />
          ) : (
            <User className="size-5 text-muted-foreground/30" />
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
        {(row.original.specialties || []).slice(0, 3).map((spec: string) => (
          <Badge key={`spec-${row.original.id}-${spec}`} variant="secondary" className="text-[10px] uppercase tracking-widest px-2 font-bold bg-white/5 border-white/10">
            {spec}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.phone}</span>,
  },
  {
    accessorKey: "commissionPct",
    header: "Comisión",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.commissionPct ? `${row.original.commissionPct}%` : "-"}
      </span>
    ),
  },
  {
    accessorKey: "baseSalary",
    header: "Salario",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.baseSalary ? `$${row.original.baseSalary}` : "-"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => (
      <Badge 
        variant={row.original.isActive ? "secondary" : "outline"}
        className={cn(
          "text-[10px] uppercase tracking-widest px-2 font-bold",
          row.original.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
        )}
      >
        {row.original.isActive ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
];
