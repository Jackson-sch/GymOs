"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Plus,
  Users,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Loader2,
  Building2,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Search,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
} from "@/lib/actions/branch-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

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
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <MapPin className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold">
                {networkMetrics.activeCount} Activas
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">
                {branches.length} Sedes
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Red de Sucursales
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Users className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/30 uppercase font-bold">
                Red Global
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">
                {networkMetrics.totalMembers.toLocaleString("es-PE")}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Socios Distribuidos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <UserCheck className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/30 uppercase font-bold">
                Marcaciones
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">
                {networkMetrics.totalAttendances.toLocaleString("es-PE")}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Asistencias Totales
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 rounded-3xl overflow-hidden relative group backdrop-blur-md bg-zinc-950/85 shadow-xl">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <TrendingUp className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase font-bold">
                Facturación Red
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">
                {formatCurrency(networkMetrics.totalRevenue)}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                Recaudación Consolidada
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search + Status Filter Pills + Create Button */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
        <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
          {/* SINGLE UNIFIED SEARCH INPUT */}
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por nombre de sede, slug o dirección física..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar w-full md:w-auto">
            {[
              { id: "ALL", label: "Todas las Sedes" },
              { id: "ACTIVE", label: "Activas" },
              { id: "INACTIVE", label: "Inactivas" },
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
        </div>

        {/* Create Dialog Trigger */}
        <div className="flex items-center justify-end shrink-0">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus className="size-4 mr-2" /> Registrar Nueva Sede
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">
                  Nueva Sede / Sucursal Física
                </DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Ingresa los datos de la ubicación física para habilitar el control multi-sede.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateBranch} className="space-y-5 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                      Nombre de la Sede *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                      <Input
                        value={createForm.name}
                        onChange={handleNameChange}
                        placeholder="Ej. Sede Miraflores - Av. Larco"
                        className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                      Slug / Identificador *
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                      <Input
                        value={createForm.slug}
                        onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value }))}
                        placeholder="miraflores-larco"
                        className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl font-mono text-xs font-semibold focus-visible:ring-primary/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                      Dirección Física
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                      <Input
                        value={createForm.address}
                        onChange={(e) => setCreateForm((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Av. José Larco 1234, Miraflores"
                        className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                        Teléfono
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                        <Input
                          value={createForm.phone}
                          onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+51 987 654 321"
                          className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                        Email Corporativo
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                        <Input
                          type="email"
                          value={createForm.email}
                          onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="miraflores@gymos.com"
                          className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="h-11 px-5 rounded-2xl border-white/10 font-bold text-xs uppercase"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingCreate}
                    className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase shadow-lg shadow-primary/20"
                  >
                    {submittingCreate ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Guardando...
                      </>
                    ) : (
                      "Registrar Sede Física"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
              <div
                key={branch.id}
                className="glass-card group relative flex flex-col justify-between p-6 md:p-8 rounded-3xl border border-white/15 bg-zinc-950/85 hover:border-primary/40 backdrop-blur-md transition-all duration-300 shadow-xl"
              >
                {/* Branch Card Top Header */}
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="size-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0 shadow-sm">
                        <Building2 className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                          {branch.name}
                        </h3>
                        <p className="text-[10px] font-mono text-muted-foreground font-semibold">
                          slug: {branch.slug}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 border",
                        branch.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30",
                      )}
                    >
                      {branch.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>

                  {/* Contact Info Details */}
                  <div className="space-y-2 text-xs font-semibold text-foreground/90 p-4 rounded-2xl bg-white/5 border border-white/10">
                    {branch.address ? (
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary shrink-0" />
                        <span>{branch.address}</span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-4 text-muted-foreground shrink-0" />
                        <span className="italic text-[11px]">Sin dirección registrada</span>
                      </p>
                    )}

                    {branch.phone && (
                      <p className="flex items-center gap-2 text-xs font-mono">
                        <Phone className="size-4 text-primary shrink-0" />
                        <span>{branch.phone}</span>
                      </p>
                    )}

                    {branch.email && (
                      <p className="flex items-center gap-2 text-xs">
                        <Mail className="size-4 text-primary shrink-0" />
                        <span className="truncate">{branch.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Branch Performance Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Socios</p>
                      <p className="text-xl font-serif font-bold text-foreground">{branch.totalMembers}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Asistencias</p>
                      <p className="text-xl font-serif font-bold text-foreground">{branch.totalAttendances}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Facturación</p>
                      <p className="text-xs font-mono font-bold text-emerald-400">
                        {formatCurrency(branch.totalRevenue)}
                      </p>
                    </div>
                  </div>

                  {/* Share of Network Revenue Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase">
                      <span>Participación Red</span>
                      <span className="text-primary">{revenueSharePct}% del total</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${revenueSharePct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Controls Footer */}
                <div className="flex items-center justify-end gap-2 pt-6 border-t border-white/10 mt-6">
                  <Button
                    onClick={() => openEditModal(branch)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl text-xs font-bold gap-2 border-white/15 bg-white/5 hover:bg-white/10 text-foreground"
                  >
                    <Edit2 className="size-3.5 text-primary" />
                    Editar Sede
                  </Button>
                  <Button
                    onClick={() => setDeletingBranch(branch)}
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                    title="Eliminar Sede"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Branch Modal */}
      {editingBranch && (
        <Dialog open={!!editingBranch} onOpenChange={() => setEditingBranch(null)}>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">
                Editar Datos de la Sede
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Modifica el nombre, dirección o datos de contacto de esta sucursal.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateBranch} className="space-y-5 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                    Nombre de la Sede *
                  </Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                    Slug / Identificador *
                  </Label>
                  <Input
                    value={editForm.slug}
                    onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                    className="bg-white/5 border-white/15 h-11 rounded-2xl font-mono text-xs font-semibold focus-visible:ring-primary/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                    Dirección Física
                  </Label>
                  <Input
                    value={editForm.address}
                    onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                    className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                      Teléfono
                    </Label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                      className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-wider text-foreground">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                      className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingBranch(null)}
                  className="h-11 px-5 rounded-2xl border-white/10 font-bold text-xs uppercase"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingEdit}
                  className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase shadow-lg shadow-primary/20"
                >
                  {submittingEdit ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

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
