"use client";

import React, { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Plus,
  UserCheck,
  AlertTriangle,
  UserX,
  Search,
  Crown,
  ShieldCheck,
  UserPlus,
  Sparkles,
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deleteMemberAction, toggleMemberStatusAction } from "@/lib/actions/members-actions";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { type MemberStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

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
  const [editingMember, setEditingMember] = useState<any>(null);
  const [renewingMember, setRenewingMember] = useState<any>(null);
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

  // Compute Member Executive Statistics (Merging Server Stats + Dynamic Filtering)
  const stats = useMemo(() => {
    const totalCount = serverStats?.total ?? data.length;
    const activeCount = serverStats?.active ?? data.filter((m) => m.status === "ACTIVE").length;
    const newThisMonth = serverStats?.newThisMonth ?? 0;
    const inactiveCount = totalCount - activeCount;

    // Check expiring memberships in next 7 days
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
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      {/* Consolidated 5-Card Executive Dashboard Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <Users className="size-4" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30 uppercase font-bold">
                Total Base
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">
                {stats.totalCount}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Socios Registrados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <UserCheck className="size-4" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold">
                {stats.activePct}% Activos
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">
                {stats.activeCount}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Membresías Vigentes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <UserPlus className="size-4" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-sky-500/10 text-sky-400 border-sky-500/30 uppercase font-bold">
                Este Mes
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-sky-400">
                +{stats.newThisMonth}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Nuevos Registros
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="size-4" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30 uppercase font-bold">
                7 Días Máx.
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-amber-400">
                {stats.expiringCount}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Por Vencer
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <UserX className="size-4" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-400 border-rose-500/30 uppercase font-bold">
                Inactivos
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">
                {stats.inactiveCount}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Pendientes Renovación
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Status Filter Pills + Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {[
            { id: "ALL", label: "Todos los Socios" },
            { id: "ACTIVE", label: "Socios Activos" },
            { id: "INACTIVE", label: "Inactivos" },
            { id: "VIP", label: "Socios VIP" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                statusFilter === s.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Create Member Button */}
        <div className="flex items-center justify-end shrink-0">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="size-4 mr-2" /> Registrar Nuevo Socio
            </Button>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-4xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Registrar Nuevo Socio</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Completa los datos personales y de contacto para incorporar un miembro a GymOS.
                </DialogDescription>
              </DialogHeader>
              {isCreateOpen && <MemberForm onSuccess={() => setIsCreateOpen(false)} />}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TanStack Data Table Container */}
      <DataTable
        columns={columns}
        data={filteredData}
        filterColumn="fullName"
        placeholder="Buscar socio por nombre, DNI o email..."
      />

      {/* Edit Member Dialog */}
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

      {/* Renewal Dialog */}
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

      {/* Delete Member Confirmation Modal */}
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
