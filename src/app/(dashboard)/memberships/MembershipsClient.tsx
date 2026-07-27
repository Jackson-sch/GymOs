"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  CreditCard,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Edit2,
  Trash2,
  MoreVertical,
  Users,
  Search,
  Check,
  Award,
  TrendingDown,
  Gift,
  Dumbbell,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlanForm } from "@/components/shared/forms/PlanForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deletePlanAction, getPlanMembersAction } from "@/lib/actions/plans-actions";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

export function MembershipsClient({ data }: { data: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [membersPlan, setMembersPlan] = useState<any>(null);
  const [planMembers, setPlanMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleteLoading(true);
    try {
      const result = await deletePlanAction(deletingId);
      if (result.success) {
        toast.success("Plan eliminado con éxito");
        setDeletingId(null);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al intentar eliminar el plan");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleViewMembers = async (plan: any) => {
    setMembersPlan(plan);
    setLoadingMembers(true);
    const result = await getPlanMembersAction(plan.id);
    if (result.success) {
      setPlanMembers(result.data as any[]);
    } else {
      toast.error(result.error);
    }
    setLoadingMembers(false);
  };

  // Compute base monthly rate across plans to show relative discount %
  const baseMonthlyPrice = useMemo(() => {
    const monthPlans = data.filter((p) => Number(p.durationDays) >= 28 && Number(p.durationDays) <= 31);
    if (monthPlans.length > 0) {
      return Math.min(...monthPlans.map((p) => Number(p.price)));
    }
    return 150; // Fallback baseline
  }, [data]);

  // Filtered plans dataset
  const filteredPlans = useMemo(() => {
    return data.filter((plan) => {
      const query = search.trim().toLowerCase();
      const nameMatch = plan.name?.toLowerCase().includes(query);
      const descMatch = plan.description?.toLowerCase().includes(query);
      const catMatch = plan.category?.toLowerCase().includes(query);
      const matchesSearch = !query || nameMatch || descMatch || catMatch;

      let matchesCategory = true;
      if (categoryFilter === "CLASSES") matchesCategory = !!plan.allowedClasses;
      else if (categoryFilter === "GYM_ONLY") matchesCategory = !plan.allowedClasses;
      else if (categoryFilter === "LONG_TERM") matchesCategory = Number(plan.durationDays) >= 90;

      return matchesSearch && matchesCategory;
    });
  }, [data, search, categoryFilter]);

  return (
    <div className="space-y-8 w-full">
      {/* Control Bar: Search + Category Pills + Create Button */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
        <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
          {/* SINGLE UNIFIED SEARCH INPUT */}
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar plan por nombre o beneficios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar w-full md:w-auto">
            {[
              { id: "ALL", label: "Todos los Planes" },
              { id: "CLASSES", label: "Con Clases Grupales" },
              { id: "GYM_ONLY", label: "Solo Musculación" },
              { id: "LONG_TERM", label: "Larga Duración (90+ Días)" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  categoryFilter === c.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end shrink-0">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus className="size-4 mr-2" /> Crear Nuevo Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Definir Plan Maestro</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Crea una nueva oferta comercial diferenciada para los socios de GymOS.
                </DialogDescription>
              </DialogHeader>
              <PlanForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan: any) => {
            const days = Number(plan.durationDays) || 30;
            const price = Number(plan.price) || 0;
            const monthlyEquivalent = Math.round((price / days) * 30);
            const isBestValue = days >= 180 || plan.allowedClasses;
            const discountPct =
              monthlyEquivalent < baseMonthlyPrice
                ? Math.round(((baseMonthlyPrice - monthlyEquivalent) / baseMonthlyPrice) * 100)
                : 0;

            return (
              <div
                key={plan.id}
                className={cn(
                  "glass-card group relative flex flex-col p-8 rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-md",
                  isBestValue
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 via-zinc-950/90 to-zinc-950 shadow-primary/10"
                    : "border-white/15 bg-zinc-950/80 hover:border-primary/30",
                )}
              >
                {/* Ribbon Tag for Best Value */}
                {isBestValue && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-2xl shadow-md flex items-center gap-1">
                    <Sparkles className="size-3" /> Plan Destacado
                  </div>
                )}

                {/* Dropdown Menu Actions */}
                <div className="absolute top-3 left-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-xl hover:bg-white/10 text-muted-foreground"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-2xl">
                      <DropdownMenuItem
                        className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Edit2 className="size-3 text-primary" /> Editar Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-rose-500/20 text-rose-400 cursor-pointer"
                        onClick={() => setDeletingId(plan.id)}
                      >
                        <Trash2 className="size-3" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Category & Badge Header */}
                <div className="flex items-center justify-between mt-4 mb-4">
                  <Badge variant="outline" className="bg-white/5 border-white/15 px-3 py-1 text-[10px] tracking-widest uppercase font-bold text-primary">
                    {plan.category || "GENERAL"}
                  </Badge>
                  {discountPct > 0 && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-bold uppercase">
                      Ahorro del {discountPct}%
                    </Badge>
                  )}
                </div>

                {/* Name & Short Description */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-3xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[36px]">
                    {plan.description || "Acceso completo a las instalaciones de entrenamiento de GymOS."}
                  </p>
                </div>

                {/* Pricing & Monthly Equivalence Breakdown */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mb-6">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-serif font-bold text-foreground">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase font-mono font-semibold">
                        / {days} días
                      </span>
                    </div>
                  </div>
                  {days > 31 && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-muted-foreground font-medium">Equivalente mensual:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(monthlyEquivalent)} / mes
                      </span>
                    </div>
                  )}
                </div>

                {/* Explicit Tier Feature Checklist */}
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-xs font-semibold text-foreground/90">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Acceso a Zona de Pesas & Cardio</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-foreground/90">
                    {plan.allowedClasses ? (
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="size-4 text-zinc-600 shrink-0" />
                    )}
                    <span className={cn(plan.allowedClasses ? "text-foreground font-bold" : "text-muted-foreground line-through opacity-60")}>
                      {plan.allowedClasses ? "Clases Grupales Incluidas (Spinning, HIIT, Yoga)" : "Clases Grupales no incluidas"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-foreground/90">
                    {plan.maxFreezeDays > 0 ? (
                      <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldCheck className="size-4 text-zinc-600 shrink-0" />
                    )}
                    <span className={cn(plan.maxFreezeDays > 0 ? "text-foreground" : "text-muted-foreground line-through opacity-60")}>
                      {plan.maxFreezeDays > 0 ? `Congelación: ${plan.maxFreezeDays} días permitidos` : "Sin días de congelación"}
                    </span>
                  </div>

                  {plan.name?.toLowerCase().includes("premium") || plan.name?.toLowerCase().includes("vip") ? (
                    <div className="flex items-center gap-3 text-xs font-semibold text-amber-400">
                      <Sparkles className="size-4 shrink-0" />
                      <span>2 Pases Mensuales de Invitado Gratis</span>
                    </div>
                  ) : null}

                  {plan.durationDays >= 365 ? (
                    <div className="flex items-center gap-3 text-xs font-semibold text-purple-400">
                      <Gift className="size-4 shrink-0" />
                      <span>Locker Personal Exclusivo Incluido</span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground pt-1">
                    <Clock className="size-3.5 text-primary shrink-0" />
                    <span>Duración: {days} días calendario</span>
                  </div>
                </div>

                {/* Card Footer: Active Members Count & View List Button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{plan._count?.memberships || 0}</p>
                      <p className="text-[9px] uppercase font-mono text-muted-foreground">Socios Activos</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewMembers(plan)}
                    variant="ghost"
                    size="sm"
                    className="rounded-xl border border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-primary"
                  >
                    Ver Lista
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10 rounded-3xl space-y-3">
            <CreditCard className="size-12 mx-auto text-primary/40" />
            <p className="font-serif font-bold text-lg text-foreground">No hay planes coincidentes</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Intente ajustar el término de búsqueda o seleccione otro filtro de categoría.
            </p>
          </div>
        )}
      </div>

      {/* Edit Plan Dialog */}
      {editingPlan && (
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">Editar Plan Maestro</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Ajusta las condiciones comerciales de {editingPlan?.name}.
              </DialogDescription>
            </DialogHeader>
            <PlanForm initialData={editingPlan} onSuccess={() => setEditingPlan(null)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Active Members Modal for Selected Plan */}
      {membersPlan && (
        <Dialog open={!!membersPlan} onOpenChange={() => setMembersPlan(null)}>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-foreground">
                Socios Inscritos en {membersPlan.name}
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Listado de socios con membresía activa bajo este plan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pt-2">
              {loadingMembers ? (
                <div className="py-8 text-center text-xs font-semibold text-muted-foreground">
                  Cargando socios activos...
                </div>
              ) : planMembers.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-muted-foreground">
                  No hay socios activos registrados en este plan actualmente.
                </div>
              ) : (
                planMembers.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary">
                        {m.fullName?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{m.fullName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{m.email || m.phone || "Sin contacto"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-mono font-bold">
                      ACTIVO
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Plan Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Plan de Membresía"
        description="¿Estás seguro de eliminar este plan? Los socios con este plan activo mantendrán sus condiciones hasta su fecha de vencimiento."
        confirmText="Eliminar Plan"
        cancelText="Volver"
        variant="danger"
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
