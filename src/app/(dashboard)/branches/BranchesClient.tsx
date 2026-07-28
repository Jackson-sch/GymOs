"use client";

import React, { useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
} from "@/lib/actions/branch-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BranchCard } from "./components/BranchCard";
import { BranchNetworkStats } from "./components/BranchNetworkStats";
import { BranchControlBar } from "./components/BranchControlBar";
import { EditBranchDialog } from "./components/EditBranchDialog";

interface BranchAnalytic {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  totalMembers: number;
  totalAttendances: number;
  totalTrainers: number;
  totalRevenue: number;
}

export function BranchesClient({
  initialBranches,
}: {
  initialBranches: BranchAnalytic[];
}) {
  const [branches, setBranches] = useState<BranchAnalytic[]>(initialBranches);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal Create State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    address: "",
    phone: "",
    email: "",
  });

  // Modal Edit State
  const [editingBranch, setEditingBranch] = useState<BranchAnalytic | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    slug: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
  });

  // Modal Delete State
  const [deletingBranch, setDeletingBranch] = useState<BranchAnalytic | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setCreateForm((prev) => ({ ...prev, name, slug }));
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.slug) {
      toast.error("Nombre y Slug de la sede son requeridos");
      return;
    }

    setSubmittingCreate(true);
    const res = await createBranchAction(createForm);
    setSubmittingCreate(false);

    if (res.success && res.data) {
      toast.success(res.message);
      setBranches((prev) => [
        ...prev,
        {
          ...res.data,
          totalMembers: 0,
          totalAttendances: 0,
          totalTrainers: 0,
          totalRevenue: 0,
        },
      ]);
      setIsCreateOpen(false);
      setCreateForm({ name: "", slug: "", address: "", phone: "", email: "" });
    } else {
      toast.error(res.error || "Error al crear la sede");
    }
  };

  const openEditModal = (b: BranchAnalytic) => {
    setEditingBranch(b);
    setEditForm({
      id: b.id,
      name: b.name,
      slug: b.slug,
      address: b.address || "",
      phone: b.phone || "",
      email: b.email || "",
      isActive: b.isActive,
    });
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.slug) {
      toast.error("Nombre y Slug son requeridos");
      return;
    }

    setSubmittingEdit(true);
    const res = await updateBranchAction(editForm);
    setSubmittingEdit(false);

    if (res.success && res.data) {
      toast.success(res.message);
      setBranches((prev) =>
        prev.map((b) => (b.id === editForm.id ? { ...b, ...res.data } : b)),
      );
      setEditingBranch(null);
    } else {
      toast.error(res.error || "Error al actualizar la sede");
    }
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;

    setSubmittingDelete(true);
    const res = await deleteBranchAction(deletingBranch.id);
    setSubmittingDelete(false);

    if (res.success) {
      toast.success(res.message);
      setBranches((prev) => prev.filter((b) => b.id !== deletingBranch.id));
      setDeletingBranch(null);
    } else {
      toast.error(res.error || "Error al eliminar la sede");
    }
  };

  // Compute Network Multi-branch Stats
  const networkMetrics = useMemo(() => {
    const totalRevenue = branches.reduce((sum, b) => sum + (b.totalRevenue || 0), 0);
    const totalMembers = branches.reduce((sum, b) => sum + (b.totalMembers || 0), 0);
    const totalAttendances = branches.reduce((sum, b) => sum + (b.totalAttendances || 0), 0);
    const activeCount = branches.filter((b) => b.isActive).length;

    return {
      totalRevenue,
      totalMembers,
      totalAttendances,
      activeCount,
    };
  }, [branches]);

  // Filtered Branch List
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const query = search.trim().toLowerCase();
      const nameMatch = b.name.toLowerCase().includes(query);
      const slugMatch = b.slug.toLowerCase().includes(query);
      const addrMatch = b.address ? b.address.toLowerCase().includes(query) : false;
      const matchesSearch = !query || nameMatch || slugMatch || addrMatch;

      let matchesStatus = true;
      if (statusFilter === "ACTIVE") matchesStatus = b.isActive;
      else if (statusFilter === "INACTIVE") matchesStatus = !b.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  return (
    <div className="space-y-8 w-full animate-fade-in">
      <BranchNetworkStats
        totalBranches={branches.length}
        activeCount={networkMetrics.activeCount}
        totalMembers={networkMetrics.totalMembers}
        totalAttendances={networkMetrics.totalAttendances}
        totalRevenue={networkMetrics.totalRevenue}
      />

      <BranchControlBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isCreateOpen={isCreateOpen}
        onCreateOpenChange={setIsCreateOpen}
        createForm={createForm}
        onCreateFormChange={setCreateForm}
        submittingCreate={submittingCreate}
        onCreateSubmit={handleCreateBranch}
        onNameChange={handleNameChange}
      />

      {/* Directory & High-Contrast Branch Cards Grid */}
      {filteredBranches.length === 0 ? (
        <div className="py-20 text-center glass-card border-dashed border-white/10 rounded-3xl space-y-3">
          <MapPin className="size-12 mx-auto text-primary/40" />
          <p className="font-serif font-bold text-lg text-foreground">No se encontraron sedes físicas</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No hay sedes que coincidan con la búsqueda o filtro seleccionado. Crea una nueva sucursal para habilitar la administración multi-sede.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredBranches.map((branch) => {
            const revenueSharePct =
              networkMetrics.totalRevenue > 0
                ? Math.min(100, Math.round((branch.totalRevenue / networkMetrics.totalRevenue) * 100))
                : 0;

            return (
              <BranchCard
                key={branch.id}
                branch={branch}
                revenueSharePct={revenueSharePct}
                onEdit={openEditModal}
                onDelete={(b) => setDeletingBranch(b)}
              />
            );
          })}
        </div>
      )}

      <EditBranchDialog
        editingBranch={!!editingBranch}
        editForm={editForm}
        submittingEdit={submittingEdit}
        onEditFormChange={setEditForm}
        onUpdateSubmit={handleUpdateBranch}
        onCancel={() => setEditingBranch(null)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingBranch}
        onOpenChange={(open) => !open && setDeletingBranch(null)}
        onConfirm={handleDeleteBranch}
        title={`¿Eliminar Sede ${deletingBranch?.name}?`}
        description="Esta acción eliminará de forma permanente la sucursal física. Los socios vinculados pasarán a estado global sin sede predeterminada."
        confirmText="Sí, Eliminar Sede"
        cancelText="Cancelar"
        variant="danger"
        isLoading={submittingDelete}
      />
    </div>
  );
}
