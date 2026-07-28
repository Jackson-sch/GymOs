"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Power,
  Loader2,
  Sparkles,
  DollarSign,
  Mail,
  User,
  Lock,
  Globe,
  Award,
  Crown,
  Zap,
  Layers,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  createOrganizationAction,
  updateOrganizationDetailsAction,
  deleteOrganizationAction,
  toggleOrganizationStatusAction,
  updateOrganizationPlanTierAction
} from "@/lib/actions/organization-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo?: string | null;
  isActive: boolean;
  planTier?: "STARTER" | "PRO" | "ENTERPRISE" | any;
  monthlyPrice?: any;
  maxMembers?: number;
  maxTrainers?: number;
  createdAt: string | Date;
  _count?: {
    members: number;
    users: number;
    plans: number;
    trainers: number;
  };
  users?: Array<{ email: string; name: string }>;
}

interface SuperAdminStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalMembers: number;
  totalUsers: number;
  totalRevenue: number;
  estimatedMRR: number;
}

const SAAS_PLANS = [
  {
    tier: "STARTER" as const,
    name: "Starter Gym",
    price: 49,
    icon: Zap,
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    features: [
      "Hasta 150 Socios Activos",
      "Hasta 3 Entrenadores",
      "Check-in con Código QR",
      "Cobros manuales e historial",
      "Soporte Estándar por Email",
    ],
  },
  {
    tier: "PRO" as const,
    name: "Pro Performance",
    price: 99,
    isPopular: true,
    icon: Award,
    color: "from-primary/20 to-amber-500/10 border-primary/40 text-primary",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
    features: [
      "Hasta 500 Socios Activos",
      "Hasta 10 Entrenadores",
      "Integración WhatsApp Cloud API",
      "Pasarela Culqi y Mercado Pago",
      "Reportes Avanzados e Inventario",
      "Soporte Prioritario 24/7",
    ],
  },
  {
    tier: "ENTERPRISE" as const,
    name: "Enterprise Multi-Branch",
    price: 199,
    icon: Crown,
    color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    features: [
      "Socios Ilimitados",
      "Entrenadores Ilimitados",
      "Infraestructura BYOK Cifrada",
      "Soporte Multi-Sede & Dominio Custom",
      "Registro de Auditoría Dedicado",
      "Ejecutivo de Cuenta Asignado",
    ],
  },
];

export function SuperAdminClient({
  initialStats,
  initialOrganizations
}: {
  initialStats: SuperAdminStats;
  initialOrganizations: Organization[];
}) {
  const [stats, setStats] = useState<SuperAdminStats>(initialStats);
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "plans">("directory");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    subdomain: "",
    email: "",
    phone: "",
    address: "",
    logo: "",
    planTier: "PRO" as "STARTER" | "PRO" | "ENTERPRISE",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  // Edit Modal State
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    slug: "",
    subdomain: "",
    email: "",
    phone: "",
    address: "",
    logo: "",
    planTier: "PRO" as "STARTER" | "PRO" | "ENTERPRISE",
  });

  // Delete State
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);

  // Auto-generate slug from name during creation
  const handleCreateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setCreateForm((prev) => ({ ...prev, name, slug, subdomain: slug }));
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.slug || !createForm.adminEmail || !createForm.adminName) {
      toast.error("Por favor complete los campos obligatorios");
      return;
    }

    setSubmittingCreate(true);
    const res = await createOrganizationAction(createForm);
    setSubmittingCreate(false);

    if (res.success && res.data) {
      toast.success(res.message);
      if (res.data.initialPassword && res.data.initialPassword !== "*****") {
        toast.info(`Contraseña temporal generada para el Admin: ${res.data.initialPassword}`, {
          duration: 10000,
        });
      }

      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        slug: "",
        subdomain: "",
        email: "",
        phone: "",
        address: "",
        logo: "",
        planTier: "PRO",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });

      window.location.reload();
    } else {
      toast.error(res.error || "Error al registrar la organización");
    }
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setEditForm({
      id: org.id,
      name: org.name,
      slug: org.slug,
      subdomain: org.subdomain || org.slug,
      email: org.email || "",
      phone: org.phone || "",
      address: org.address || "",
      logo: org.logo || "",
      planTier: org.planTier || "PRO",
    });
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.slug) {
      toast.error("Nombre y Slug son requeridos");
      return;
    }

    setSubmittingEdit(true);
    const res = await updateOrganizationDetailsAction(editForm);
    setSubmittingEdit(false);

    if (res.success && res.data) {
      toast.success(res.message);
      setOrganizations((prev) =>
        prev.map((o) => (o.id === editForm.id ? { ...o, ...res.data } : o))
      );
      setEditingOrg(null);
    } else {
      toast.error(res.error || "Error al actualizar gimnasio");
    }
  };

  const handleDeleteOrg = async () => {
    if (!deletingOrg) return;
    setSubmittingDelete(true);
    const res = await deleteOrganizationAction(deletingOrg.id);
    setSubmittingDelete(false);

    if (res.success) {
      toast.success(res.message);
      setOrganizations((prev) => prev.filter((o) => o.id !== deletingOrg.id));
      setStats((prev) => ({
        ...prev,
        totalOrganizations: prev.totalOrganizations - 1,
        activeOrganizations: deletingOrg.isActive
          ? prev.activeOrganizations - 1
          : prev.activeOrganizations,
      }));
      setDeletingOrg(null);
    } else {
      toast.error(res.error || "Error al eliminar gimnasio");
    }
  };

  const handleToggleStatus = async (orgId: string, currentStatus: boolean) => {
    setTogglingId(orgId);
    const res = await toggleOrganizationStatusAction(orgId);
    setTogglingId(null);

    if (res.success) {
      toast.success(res.message);
      setOrganizations((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, isActive: !currentStatus } : o))
      );
      setStats((prev) => ({
        ...prev,
        activeOrganizations: currentStatus
          ? prev.activeOrganizations - 1
          : prev.activeOrganizations + 1,
      }));
    } else {
      toast.error(res.error || "Error al actualizar estado");
    }
  };

  const handleChangePlanTier = async (
    orgId: string,
    newTier: "STARTER" | "PRO" | "ENTERPRISE"
  ) => {
    setUpdatingPlanId(orgId);
    const res = await updateOrganizationPlanTierAction(orgId, newTier);
    setUpdatingPlanId(null);

    if (res.success) {
      toast.success(res.message);
      setOrganizations((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, planTier: newTier } : o))
      );
    } else {
      toast.error(res.error || "Error al actualizar plan SaaS");
    }
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase()) ||
      o.users?.[0]?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card p-8 md:p-10 border-white/5 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="size-64 text-primary" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="size-3.5" />
              Torre de Control SaaS Global (CRUD Completo)
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-foreground">
              Panel de Administrador General
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl font-sans">
              Gestión centralizada de gimnasios clientes, CRUD completo de tenants, planes de suscripción y métricas de expansión.
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold tracking-wide gap-2 shadow-xl shadow-primary/25 hover:bg-primary/90 transition-colors transition-transform hover:scale-105">
                <Plus className="size-5" />
                Registrar Nuevo Gimnasio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-card/95 border-white/10 backdrop-blur-2xl text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">
                  Onboarding de Nuevo Gimnasio Client
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Crea un nuevo Tenant en la plataforma y asigna su Plan SaaS inicial.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateOrg} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-semibold text-muted-foreground">
                      Nombre del Gimnasio *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        value={createForm.name}
                        onChange={handleCreateNameChange}
                        placeholder="Ej. BodyFit Miraflores"
                        className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-semibold text-muted-foreground">
                        Slug / Identificador *
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          value={createForm.slug}
                          onChange={(e) =>
                            setCreateForm((p) => ({ ...p, slug: e.target.value }))
                          }
                          placeholder="bodyfit-miraflores"
                          className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl font-mono text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-semibold text-muted-foreground">
                        Plan SaaS Contratado *
                      </Label>
                      <Select
                        value={createForm.planTier}
                        onValueChange={(val) =>
                          setCreateForm((p) => ({
                            ...p,
                            planTier: val as any,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full bg-white/5 border-white/10 h-11 rounded-xl text-xs font-bold">
                          <SelectValue placeholder="Seleccionar plan..." />
                        </SelectTrigger>
                        <SelectContent className="glass-card bg-zinc-950/95 border-white/10 text-foreground rounded-2xl">
                          <SelectItem value="STARTER">Starter ($49/mes - Hasta 150 socios)</SelectItem>
                          <SelectItem value="PRO">Pro Performance ($99/mes - Hasta 500 socios)</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise Multi-Branch ($199/mes - Ilimitado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-4">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-primary">
                      Administrador Principal del Gimnasio
                    </h4>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-semibold text-muted-foreground">
                        Nombre Completo del Administrador *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          value={createForm.adminName}
                          onChange={(e) =>
                            setCreateForm((p) => ({ ...p, adminName: e.target.value }))
                          }
                          placeholder="Ej. Juan Pérez (Gerente)"
                          className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-semibold text-muted-foreground">
                          Email del Administrador *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            type="email"
                            value={createForm.adminEmail}
                            onChange={(e) =>
                              setCreateForm((p) => ({ ...p, adminEmail: e.target.value }))
                            }
                            placeholder="admin@bodyfit.com"
                            className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-semibold text-muted-foreground">
                          Contraseña Inicial (Opcional)
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            type="password"
                            value={createForm.adminPassword}
                            onChange={(e) =>
                              setCreateForm((p) => ({ ...p, adminPassword: e.target.value }))
                            }
                            placeholder="Auto-generada si se omite"
                            className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="h-11 px-5 rounded-xl border-white/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingCreate}
                    className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold"
                  >
                    {submittingCreate ? (
                      <Loader2 className="size-4 animate-spin gap-2" />
                    ) : (
                      "Crear Gimnasio & Administrador"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-white/5 space-y-2 relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Gimnasios Totales
            </p>
            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Building2 className="size-5 text-primary" />
            </div>
          </div>
          <h3 className="text-3xl font-serif font-bold text-foreground">
            {stats.totalOrganizations}
          </h3>
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 pt-1">
            <CheckCircle2 className="size-3.5" />
            {stats.activeOrganizations} cuentas activas en producción
          </p>
        </div>

        <div className="glass-card p-6 border-white/5 space-y-2 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Ingreso Recurrente (MRR)
            </p>
            <div className="size-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="size-5 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-3xl font-serif font-bold text-foreground">
            ${stats.estimatedMRR.toLocaleString("en-US")}
          </h3>
          <p className="text-xs text-muted-foreground font-sans pt-1">
            Suma mensual de suscripciones SaaS
          </p>
        </div>

        <div className="glass-card p-6 border-white/5 space-y-2 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Socios en la Red
            </p>
            <div className="size-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users className="size-5 text-blue-400" />
            </div>
          </div>
          <h3 className="text-3xl font-serif font-bold text-foreground">
            {stats.totalMembers.toLocaleString("es-PE")}
          </h3>
          <p className="text-xs text-blue-400 font-medium pt-1">
            Atletas procesados en el sistema
          </p>
        </div>

        <div className="glass-card p-6 border-white/5 space-y-2 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Facturación Procesada
            </p>
            <div className="size-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <TrendingUp className="size-5 text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-serif font-bold text-foreground">
            S/ {stats.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-muted-foreground font-sans pt-1">
            Procesado por pasarelas del SaaS
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button type="button"
            onClick={() => setActiveTab("directory")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "directory"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            <Building2 className="size-4" />
            Directorio de Gimnasios ({filteredOrgs.length})
          </button>

          <button type="button"
            onClick={() => setActiveTab("plans")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "plans"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            <Layers className="size-4" />
            Planes SaaS & Tiers de Suscripción
          </button>
        </div>

        {activeTab === "directory" ? (
          <section className="glass-card p-8 border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-2xl font-serif">Gimnasios Clientes Registrados</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  Gestión completa (Crear, Editar, Activar/Suspender, Eliminar)
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar gimnasio o admin..."
                  className="pl-10 bg-white/5 border-white/10 h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {filteredOrgs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-3">
                <Building2 className="size-12 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-medium">No se encontraron gimnasios registrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground uppercase tracking-wider font-semibold">
                      <th className="py-4 px-4">Gimnasio / Tenant</th>
                      <th className="py-4 px-4">Admin Principal</th>
                      <th className="py-4 px-4 text-center">Plan SaaS Contratado</th>
                      <th className="py-4 px-4 text-center">Socios</th>
                      <th className="py-4 px-4 text-center">Estado</th>
                      <th className="py-4 px-4 text-right">Acciones CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrgs.map((org) => {
                      const adminEmail = org.users?.[0]?.email || "Sin asignar";
                      const adminName = org.users?.[0]?.name || "Admin";
                      const currentTier = org.planTier || "PRO";

                      return (
                        <tr key={org.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm uppercase">
                                {org.name.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-foreground text-sm">{org.name}</p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                  {org.slug}.gymos.com
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-foreground">{adminName}</p>
                              <p className="text-[11px] text-muted-foreground">{adminEmail}</p>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <Select
                              value={currentTier}
                              disabled={updatingPlanId === org.id}
                              onValueChange={(val) =>
                                handleChangePlanTier(org.id, val as any)
                              }
                            >
                              <SelectTrigger className="h-9 w-36 bg-white/5 border-white/10 text-xs font-bold rounded-xl">
                                <SelectValue placeholder="Plan..." />
                              </SelectTrigger>
                              <SelectContent className="glass-card bg-zinc-950/95 border-white/10 text-foreground rounded-xl">
                                <SelectItem value="STARTER">Starter ($49/mo)</SelectItem>
                                <SelectItem value="PRO">Pro ($99/mo)</SelectItem>
                                <SelectItem value="ENTERPRISE">Enterprise ($199/mo)</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span className="font-bold font-mono text-sm text-foreground">
                              {org._count?.members || 0}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center">
                            {org.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="size-3" />
                                Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold uppercase tracking-wider">
                                <XCircle className="size-3" />
                                Suspendido
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Button */}
                              <Button
                                onClick={() => openEditModal(org)}
                                variant="outline"
                                className="size-9 p-0 rounded-xl bg-white/5 border-white/10 text-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                                title="Editar Datos del Gimnasio"
                              >
                                <Edit className="size-4" />
                              </Button>

                              {/* Toggle Status Button */}
                              <Button
                                onClick={() => handleToggleStatus(org.id, org.isActive)}
                                disabled={togglingId === org.id}
                                variant="outline"
                                className={`size-9 p-0 rounded-xl transition-colors ${
                                  org.isActive
                                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                }`}
                                title={org.isActive ? "Suspender Acceso" : "Reactivar Gimnasio"}
                              >
                                {togglingId === org.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Power className="size-4" />
                                )}
                              </Button>

                              {/* Delete Button */}
                              <Button
                                onClick={() => setDeletingOrg(org)}
                                variant="outline"
                                className="size-9 p-0 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 transition-colors"
                                title="Eliminar Gimnasio"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          /* SaaS Plan Tiers Showcase */
          <section className="glass-card p-8 border-white/5 space-y-8 animate-enter-fast">
            <div>
              <h2 className="text-2xl font-serif">Planes SaaS & Paquetes de Suscripción</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Definición de límites, características y tarifas de los gimnasios en GymOS
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {SAAS_PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.tier}
                    className={`p-8 rounded-3xl bg-linear-to-b ${plan.color} border space-y-6 flex flex-col justify-between relative shadow-xl backdrop-blur-md hover:scale-105 transition-colors transition-transform`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-lg">
                        Más Vendido
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-serif font-bold text-foreground">
                            {plan.name}
                          </h3>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${plan.badgeColor}`}
                          >
                            Tier {plan.tier}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-4xl font-serif font-bold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-xs text-muted-foreground font-sans">
                          {" "}
                          / mes por gimnasio
                        </span>
                      </div>

                      <ul className="space-y-3 pt-4 border-t border-white/10">
                        {plan.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-center gap-2.5 text-xs text-foreground/90 font-sans"
                          >
                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <Button
                        onClick={() => setIsCreateOpen(true)}
                        variant="outline"
                        className="w-full h-11 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground font-bold text-xs uppercase tracking-wider border-white/10 transition-colors"
                      >
                        Asignar a Nuevo Gimnasio
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Edit Organization Modal */}
      {editingOrg && (
        <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
          <DialogContent className="max-w-xl bg-card/95 border-white/10 backdrop-blur-2xl text-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">
                Editar Datos del Gimnasio
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Actualiza los datos del cliente, slug, subdominio o plan contratado.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateOrg} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">
                    Nombre del Gimnasio *
                  </Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-semibold text-muted-foreground">
                      Slug / Identificador *
                    </Label>
                    <Input
                      value={editForm.slug}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, slug: e.target.value }))
                      }
                      className="bg-white/5 border-white/10 h-11 rounded-xl font-mono text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-semibold text-muted-foreground">
                      Subdominio
                    </Label>
                    <Input
                      value={editForm.subdomain}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, subdomain: e.target.value }))
                      }
                      className="bg-white/5 border-white/10 h-11 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-semibold text-muted-foreground">
                      Email Institucional
                    </Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="bg-white/5 border-white/10 h-11 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-semibold text-muted-foreground">
                      Teléfono
                    </Label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="bg-white/5 border-white/10 h-11 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">
                    Plan SaaS Contratado
                  </Label>
                  <Select
                    value={editForm.planTier}
                    onValueChange={(val) =>
                      setEditForm((p) => ({
                        ...p,
                        planTier: val as any,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 h-11 rounded-xl text-xs font-bold">
                      <SelectValue placeholder="Seleccionar plan..." />
                    </SelectTrigger>
                    <SelectContent className="glass-card bg-zinc-950/95 border-white/10 text-foreground rounded-2xl">
                      <SelectItem value="STARTER">Starter ($49/mes)</SelectItem>
                      <SelectItem value="PRO">Pro Performance ($99/mes)</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise Multi-Branch ($199/mes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingOrg(null)}
                  className="h-11 px-5 rounded-xl border-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingEdit}
                  className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold"
                >
                  {submittingEdit ? (
                    <Loader2 className="size-4 animate-spin gap-2" />
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
        isOpen={!!deletingOrg}
        onOpenChange={(open) => !open && setDeletingOrg(null)}
        onConfirm={handleDeleteOrg}
        title={`¿Eliminar ${deletingOrg?.name}?`}
        description="Esta acción eliminará de forma permanente el gimnasio cliente y todos sus datos vinculados. Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar Gimnasio"
        cancelText="Cancelar"
        variant="danger"
        isLoading={submittingDelete}
      />
    </div>
  );
}
