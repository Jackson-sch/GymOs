"use client";

import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberForm } from "@/components/shared/forms/MemberForm";
import { RenewalForm } from "@/components/shared/forms/RenewalForm";
import { deleteMemberAction, toggleMemberStatusAction } from "@/lib/actions/members-actions";
import { toast } from "sonner";

import { getColumns } from "./columns";

import { type MemberStatus } from "@prisma/client";

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

  const handleStatusChange = React.useCallback(async (id: string, status: MemberStatus) => {
    const result = await toggleMemberStatusAction(id, status);
    if (result.success) toast.success(`Socio ${status === 'ACTIVE' ? 'reactivado' : 'suspendido'} exitosamente`);
    else toast.error(result.error);
  }, []);

  const columns = React.useMemo(() => getColumns({
    onEdit: setEditingMember,
    onDelete: handleDelete,
    onRenew: setRenewingMember,
    onStatusChange: handleStatusChange
  }), [handleDelete, handleStatusChange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2"
          >
            <Plus className="size-5" />
            Nuevo Socio
          </Button>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-4xl">
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
        <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl">
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
        <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg">
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
