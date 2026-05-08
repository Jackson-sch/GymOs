"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Plus, 
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Crown
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
import { MemberForm } from "@/components/shared/forms/MemberForm";
import { RenewalForm } from "@/components/shared/forms/RenewalForm";
import { deleteMemberAction } from "@/lib/actions/members-actions";
import { toast } from "sonner";

export function MembersClient({ data, plans }: { data: any[], plans: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<any>(null);
  const [renewingMember, setRenewingMember] = React.useState<any>(null);

  const handleDelete = React.useCallback(async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este socio?")) {
      const result = await deleteMemberAction(id);
      if (result.success) toast.success("Socio eliminado");
      else toast.error(result.error);
    }
  }, []);

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "fullName",
      header: "Socio",
      filterFn: (row, id, value) => {
        const search = value.toLowerCase();
        const name = (row.original.fullName || "").toLowerCase();
        const dni = (row.original.dni || "").toLowerCase();
        return name.includes(search) || dni.includes(search);
      },
      cell: ({ row }) => {
        const membership = row.original.memberships?.[0];
        const planName = membership?.plan?.name || "";
        const isVip = /vip|premium/i.test(planName);
        const isStandard = /est[aá]ndar/i.test(planName);
        const isBasic = /b[aá]sico/i.test(planName);
        const tierBorder = isVip 
          ? 'border-amber-400/50 ring-1 ring-amber-400/20' 
          : isStandard 
            ? 'border-emerald-400/40 ring-1 ring-emerald-400/10' 
            : isBasic 
              ? 'border-slate-400/25' 
              : 'border-white/10';
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-white/5 border flex items-center justify-center overflow-hidden ${tierBorder}`}>
                {row.original.photo ? (
                  <img 
                    src={row.original.photo} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    style={{ objectPosition: `50% ${row.original.photoPosition ?? 50}%` }}
                  />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground/30" />
                )}
              </div>
              {isVip && (
                <div className="absolute -top-1 -right-1 bg-linear-to-br from-amber-400 to-yellow-500 rounded-full p-0.5 shadow-sm border border-background">
                  <Crown className="w-2.5 h-2.5 text-amber-900" />
                </div>
              )}
              {isStandard && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 border-2 border-background shadow-sm" />
              )}
              {isBasic && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-slate-400/60 border-2 border-background" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{row.original.fullName}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{row.original.dni}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const active = row.original.status === "ACTIVE";
        return (
          <Badge variant="outline" className={`rounded-full text-[9px] uppercase tracking-widest px-2.5 ${active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
            {active ? "Activo" : "Inactivo"}
          </Badge>
        );
      }
    },
    {
      accessorKey: "email",
      header: "Contacto",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-xs font-medium">{row.original.email}</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Smartphone className="w-3 h-3" />
            <span>{row.original.phone}</span>
          </div>
        </div>
      )
    },
    {
      id: "membership",
      header: "Plan Actual",
      cell: ({ row }) => {
        const membership = row.original.memberships?.[0];
        return membership ? (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">{membership.plan.name}</span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest italic opacity-50">Sin Plan</span>
        );
      }
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
              asChild
            >
              <Link href={`/members/${row.original.id}`}>
                <User className="w-3 h-3" /> Ver Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
              onClick={() => setEditingMember(row.original)}
            >
              <Edit2 className="w-3 h-3" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-emerald-500/20 text-emerald-500 cursor-pointer"
              onClick={() => setRenewingMember(row.original)}
            >
              <RefreshCw className="w-3 h-3" /> Renovar Plan
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
  ], [handleDelete, setEditingMember, setRenewingMember]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Socio
          </Button>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Registrar Socio</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Completa los datos del nuevo miembro de GymOS.
              </DialogDescription>
            </DialogHeader>
            {isCreateOpen && <MemberForm onSuccess={() => setIsCreateOpen(false)} />}
          </DialogContent>
        </Dialog>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        filterColumn="fullName" 
        placeholder="Buscar socio por nombre o DNI..." 
      />

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif">Editar Socio</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
              Modifica la información de {editingMember?.fullName}.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <MemberForm 
              initialData={editingMember} 
              onSuccess={() => setEditingMember(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Renewal Dialog */}
      <Dialog open={!!renewingMember} onOpenChange={() => setRenewingMember(null)}>
        <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif">Renovar Membresía</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
              Asigna un nuevo plan a {renewingMember?.fullName}.
            </DialogDescription>
          </DialogHeader>
          {renewingMember && (
            <RenewalForm 
              member={renewingMember} 
              plans={plans}
              onSuccess={() => setRenewingMember(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
