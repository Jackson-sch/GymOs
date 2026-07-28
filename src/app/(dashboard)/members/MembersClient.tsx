"use client";

import React, { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/shared/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberForm } from "@/components/shared/forms/MemberForm";
import { RenewalForm } from "@/components/shared/forms/RenewalForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deleteMemberAction, toggleMemberStatusAction } from "@/lib/actions/members-actions";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { type MemberStatus } from "@prisma/client";
import { MemberStatsCards } from "./components/MemberStatsCards";
import { MemberControlBar } from "./components/MemberControlBar";

interface MembersClientProps {
  data: any[];
  plans: any[];
  serverStats?: {
    total: number;
    active: number;
    newThisMonth: number;
  };
}

export function MembersClient({ data, plans, serverStats }: MembersClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [renewingMember, setRenewingMember] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleteLoading(true);
    try {
      const result = await deleteMemberAction(deletingId);
      if (result.success) {
        toast.success("Socio eliminado con éxito");
        setDeletingId(null);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al eliminar el socio");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleStatusChange = useCallback(async (id: string, status: MemberStatus) => {
    const result = await toggleMemberStatusAction(id, status);
    if (result.success) {
      toast.success(`Socio ${status === "ACTIVE" ? "reactivado" : "suspendido"} exitosamente`);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  }, []);

  // Compute Member Executive Statistics
  const stats = useMemo(() => {
    const totalCount = serverStats?.total ?? data.length;
    const activeCount = serverStats?.active ?? data.filter((m) => m.status === "ACTIVE").length;
    const newThisMonth = serverStats?.newThisMonth ?? 0;
    const inactiveCount = totalCount - activeCount;

    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const expiringCount = data.filter((m) => {
      const endDate = m.memberships?.[0]?.endDate;
      if (!endDate) return false;
      const endD = new Date(endDate);
      return endD >= now && endD <= next7Days;
    }).length;

    return {
      totalCount,
      activeCount,
      newThisMonth,
      expiringCount,
      inactiveCount,
      activePct: totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0,
    };
  }, [data, serverStats]);

  // Filtered dataset for Table
  const filteredData = useMemo(() => {
    return data.filter((m) => {
      if (statusFilter === "ACTIVE") return m.status === "ACTIVE";
      if (statusFilter === "INACTIVE") return m.status !== "ACTIVE";
      if (statusFilter === "VIP") {
        const planName = m.memberships?.[0]?.plan?.name || "";
        return /vip|premium/i.test(planName);
      }
      return true;
    });
  }, [data, statusFilter]);

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: setEditingMember,
        onDelete: handleDelete,
        onRenew: setRenewingMember,
        onStatusChange: handleStatusChange,
      }),
    [handleDelete, handleStatusChange],
  );

  return (
    <div className="space-y-8 w-full animate-fade-in">
      <MemberStatsCards stats={stats} />

      <MemberControlBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
      />

      <DataTable
        columns={columns}
        data={filteredData}
        filterColumn="fullName"
        placeholder="Buscar socio por nombre, DNI o email..."
      />

      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">Editar Datos del Socio</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Modifica la información personal o de contacto de {editingMember?.fullName}.
              </DialogDescription>
            </DialogHeader>
            <MemberForm initialData={editingMember} onSuccess={() => setEditingMember(null)} />
          </DialogContent>
        </Dialog>
      )}

      {renewingMember && (
        <Dialog open={!!renewingMember} onOpenChange={() => setRenewingMember(null)}>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">Renovar Membresía</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Asigna un nuevo plan o extiende el período para {renewingMember?.fullName}.
              </DialogDescription>
            </DialogHeader>
            <RenewalForm
              member={renewingMember}
              plans={plans}
              onSuccess={() => setRenewingMember(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Expediente del Socio"
        description="¿Estás seguro de eliminar este socio? Esta acción borrará de forma permanente sus datos, historial de asistencias y registros de pagos."
        confirmText="Eliminar Socio"
        cancelText="Volver"
        variant="danger"
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
