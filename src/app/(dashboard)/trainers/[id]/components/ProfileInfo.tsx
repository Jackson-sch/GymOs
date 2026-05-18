"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, X, Activity, Mail, Phone, CreditCard, DollarSign, Percent, Briefcase, User as UserIcon, Sparkles, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileInfoProps {
  isEditing: boolean;
  formData: any;
  newSpecialty: string;
  trainer: any;
  dispatch: React.Dispatch<any>;
  isSaving?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

// ─── Reusable Field Component ───────────────────────────────────────────────
function FormField({ 
  label, icon: Icon, children, className 
}: { 
  label: string; 
  icon?: React.ElementType; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1 flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

export function ProfileInfo({ isEditing, formData, newSpecialty, trainer, dispatch, isSaving, onSave, onCancel }: ProfileInfoProps) {
  if (isEditing) {
    return (
      <div className="flex-1 w-full space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 pr-16">
        {/* ─── Section: Identity ──────────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1 flex items-center gap-2">
            <UserIcon className="size-3" />
            Identidad
          </div>
          <div className="p-5 rounded-2xl border border-border/10 bg-background/5 backdrop-blur-sm space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Nombre completo">
                <Input
                  value={formData.fullName}
                  onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { fullName: e.target.value } })}
                  className="bg-background/20 border-border/10 focus:border-primary/30 h-11 rounded-xl transition-all placeholder:text-muted-foreground/30"
                  placeholder="Nombre y apellidos"
                />
              </FormField>
              <FormField label="DNI / Documento" icon={CreditCard}>
                <Input
                  value={formData.dni}
                  onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { dni: e.target.value } })}
                  className="bg-background/20 border-border/10 focus:border-primary/30 h-11 rounded-xl transition-all font-mono placeholder:text-muted-foreground/30"
                  placeholder="12345678"
                />
              </FormField>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Email corporativo" icon={Mail}>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { email: e.target.value } })}
                  className="bg-background/20 border-border/10 focus:border-primary/30 h-11 rounded-xl transition-all placeholder:text-muted-foreground/30"
                  placeholder="nombre@gymos.com"
                />
              </FormField>
              <FormField label="Teléfono" icon={Phone}>
                <Input
                  value={formData.phone}
                  onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { phone: e.target.value } })}
                  className="bg-background/20 border-border/10 focus:border-primary/30 h-11 rounded-xl transition-all placeholder:text-muted-foreground/30"
                  placeholder="+51 999 999 999"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* ─── Section: Financials ────────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1 flex items-center gap-2">
            <DollarSign className="size-3" />
            Compensación
          </div>
          <div className="p-5 rounded-2xl border border-primary/10 bg-primary/2 backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-4">
              <FormField label="Salario base" icon={Briefcase}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 font-mono">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.baseSalary ?? ""}
                    onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { baseSalary: e.target.value ? Number(e.target.value) : null } })}
                    className="bg-background/20 border-border/10 focus:border-primary/30 h-11 rounded-xl pl-8 font-mono transition-all placeholder:text-muted-foreground/30"
                    placeholder="0.00"
                  />
                </div>
              </FormField>
              <FormField label="Pago por clase" icon={Star}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 font-mono">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.perClassRate ?? ""}
                    onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { perClassRate: e.target.value ? Number(e.target.value) : null } })}
                    className="bg-background/20 border-border/10 focus:border-primary/30 h-11 rounded-xl pl-8 font-mono transition-all placeholder:text-muted-foreground/30"
                    placeholder="0.00"
                  />
                </div>
              </FormField>
              <FormField label="Comisión" icon={Percent}>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.commissionPct ?? ""}
                    onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { commissionPct: e.target.value ? Number(e.target.value) : null } })}
                    className="bg-background/20 border-border/10 focus:border-primary/30 h-11 rounded-xl pr-10 font-mono transition-all placeholder:text-muted-foreground/30"
                    placeholder="10"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 font-mono">%</span>
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* ─── Section: Specialties ───────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1 flex items-center gap-2">
            <Sparkles className="size-3" />
            Especialidades
          </div>
          <div className="p-5 rounded-2xl border border-border/10 bg-background/5 backdrop-blur-sm space-y-3">
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((spec: string, i: number) => (
                  <Badge
                    key={spec}
                    className="bg-primary/10 text-primary border-primary/15 px-3 py-1.5 gap-2 transition-all hover:bg-primary/20 hover:scale-105 cursor-default group/badge"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">{spec}</span>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "REMOVE_SPECIALTY", payload: i })}
                      className="opacity-30 group-hover/badge:opacity-100 transition-opacity hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Añadir especialidad…"
                value={newSpecialty}
                onChange={(e) => dispatch({ type: "SET_NEW_SPECIALTY", payload: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), dispatch({ type: "ADD_SPECIALTY" }))}
                className="bg-background/20 border-border/10 focus:border-primary/30 h-10 rounded-xl transition-all text-sm placeholder:text-muted-foreground/30"
              />
              <button
                type="button"
                onClick={() => dispatch({ type: "ADD_SPECIALTY" })}
                className="size-10 shrink-0 flex items-center justify-center border border-border/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Action Buttons ────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/10">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-destructive/5 text-destructive/80 border border-destructive/10 hover:bg-destructive/10 hover:text-destructive transition-all text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]"
          >
            <X className="size-3.5" />
            Cancelar
          </button>
          
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Activity className="size-3.5 animate-spin" />
                Guardando
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── View Mode ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full space-y-6 text-center md:text-left">
      {/* Name + Status */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground drop-shadow-sm">
          {trainer.fullName}
        </h1>
        <div className="flex items-center justify-center md:justify-start gap-3">
          <div className="flex items-center gap-2 text-primary/80 font-medium tracking-wide">
            <Activity className="size-4" />
            <span className="text-sm uppercase tracking-[0.2em]">Entrenador Certificado</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em] rounded-full px-3 py-0.5",
              trainer.isActive
                ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                : "border-zinc-500/20 text-zinc-500 bg-zinc-500/5"
            )}
          >
            {trainer.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      {/* Contact Details */}
      <div className="flex flex-wrap justify-center md:justify-start gap-6 opacity-70">
        <div className="flex items-center gap-2.5 group transition-opacity hover:opacity-100">
          <div className="size-7 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
            <Mail className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-light">{trainer.email}</span>
        </div>
        <div className="flex items-center gap-2.5 group transition-opacity hover:opacity-100">
          <div className="size-7 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
            <Phone className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-light">{trainer.phone}</span>
        </div>
        <div className="flex items-center gap-2.5 group transition-opacity hover:opacity-100">
          <div className="size-7 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
            <CreditCard className="size-3.5 text-primary" />
          </div>
          <span className={cn("text-sm font-light font-mono", !trainer.dni && "text-muted-foreground/40 italic")}>
            {trainer.dni || "Sin DNI"}
          </span>
        </div>
      </div>

      {/* Financial Summary Chips */}
      {(trainer.baseSalary || trainer.perClassRate || trainer.commissionPct) && (
        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
          {trainer.baseSalary ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/30 border border-border/10 text-xs">
              <DollarSign className="size-3 text-primary/60" />
              <span className="font-light text-muted-foreground">Base</span>
              <span className="font-mono font-medium text-foreground/80">${Number(trainer.baseSalary).toLocaleString()}</span>
            </div>
          ) : null}
          {trainer.perClassRate ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/30 border border-border/10 text-xs">
              <Star className="size-3 text-primary/60" />
              <span className="font-light text-muted-foreground">Clase</span>
              <span className="font-mono font-medium text-foreground/80">${Number(trainer.perClassRate)}</span>
            </div>
          ) : null}
          {trainer.commissionPct ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/30 border border-border/10 text-xs">
              <Percent className="size-3 text-primary/60" />
              <span className="font-light text-muted-foreground">Comisión</span>
              <span className="font-mono font-medium text-foreground/80">{Number(trainer.commissionPct)}%</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Specialties */}
      {trainer.specialties && trainer.specialties.length > 0 && (
        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
          {trainer.specialties.map((spec: string) => (
            <Badge key={spec} variant="outline" className="border-primary/10 text-primary/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors hover:bg-primary/5 hover:border-primary/20">
              {spec}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
