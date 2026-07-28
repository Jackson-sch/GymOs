"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  ShieldCheck,
  Gift,
  Clock,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

interface MembershipPlanCardProps {
  plan: any;
  baseMonthlyPrice: number;
  onEdit: (plan: any) => void;
  onDelete: (id: string) => void;
  onViewMembers: (plan: any) => void;
}

export function MembershipPlanCard({
  plan,
  baseMonthlyPrice,
  onEdit,
  onDelete,
  onViewMembers,
}: MembershipPlanCardProps) {
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
      className={cn(
        "glass-card group relative flex flex-col p-8 rounded-3xl border transition-colors duration-300 shadow-xl overflow-hidden backdrop-blur-md",
        isBestValue
          ? "border-primary/50 bg-linear-to-b from-primary/10 via-zinc-950/90 to-zinc-950 shadow-primary/10"
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
          <DropdownMenuContent
            align="start"
            className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-2xl"
          >
            <DropdownMenuItem
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
              onClick={() => onEdit(plan)}
            >
              <Edit2 className="size-3 text-primary" /> Editar Plan
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-rose-500/20 text-rose-400 cursor-pointer"
              onClick={() => onDelete(plan.id)}
            >
              <Trash2 className="size-3" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category & Badge Header */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <Badge
          variant="outline"
          className="bg-white/5 border-white/15 px-3 py-1 text-[10px] tracking-widest uppercase font-bold text-primary"
        >
          {plan.category || "GENERAL"}
        </Badge>
        {discountPct > 0 && (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-bold uppercase"
          >
            Ahorro del {discountPct}%
          </Badge>
        )}
      </div>

      {/* Name & Short Description */}
      <div className="space-y-2 mb-6">
        <h3 className="text-3xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
          {plan.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-9">
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
          <span
            className={cn(
              plan.allowedClasses
                ? "text-foreground font-bold"
                : "text-muted-foreground line-through opacity-60",
            )}
          >
            {plan.allowedClasses
              ? "Clases Grupales Incluidas (Spinning, HIIT, Yoga)"
              : "Clases Grupales no incluidas"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-foreground/90">
          {plan.maxFreezeDays > 0 ? (
            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldCheck className="size-4 text-zinc-600 shrink-0" />
          )}
          <span
            className={cn(
              plan.maxFreezeDays > 0
                ? "text-foreground"
                : "text-muted-foreground line-through opacity-60",
            )}
          >
            {plan.maxFreezeDays > 0
              ? `Congelación: ${plan.maxFreezeDays} días permitidos`
              : "Sin días de congelación"}
          </span>
        </div>

        {plan.name?.toLowerCase().includes("premium") ||
        plan.name?.toLowerCase().includes("vip") ? (
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
            <p className="text-xs font-bold text-foreground">
              {plan._count?.memberships || 0}
            </p>
            <p className="text-[9px] uppercase font-mono text-muted-foreground">Socios Activos</p>
          </div>
        </div>

        <Button
          onClick={() => onViewMembers(plan)}
          variant="ghost"
          size="sm"
          className="rounded-xl border border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-primary"
        >
          Ver Lista
        </Button>
      </div>
    </div>
  );
}
