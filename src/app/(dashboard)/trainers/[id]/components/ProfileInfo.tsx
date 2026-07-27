"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Plus,
  X,
  Activity,
  Mail,
  Phone,
  CreditCard,
  DollarSign,
  Percent,
  Briefcase,
  User as UserIcon,
  Save,
  ShieldCheck,
} from "lucide-react";
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

function FormField({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-bold uppercase tracking-wider text-foreground/90 ml-1 flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-primary" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

export function ProfileInfo({
  isEditing,
  formData,
  newSpecialty,
  trainer,
  dispatch,
  isSaving,
  onSave,
  onCancel,
}: ProfileInfoProps) {
  if (isEditing) {
    return (
      <div className="flex-1 w-full space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Identity Section */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <UserIcon className="size-4" />
            Datos de Identidad & Contacto
          </div>
          <div className="p-6 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md space-y-4 shadow-xl">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Nombre completo">
                <Input
                  value={formData.fullName}
                  onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { fullName: e.target.value } })}
                  className="bg-white/5 border-white/15 h-11 rounded-2xl text-foreground font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
                  placeholder="Nombre y apellidos"
                />
              </FormField>
              <FormField label="DNI / Documento" icon={CreditCard}>
                <Input
                  value={formData.dni}
                  onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { dni: e.target.value } })}
                  className="bg-white/5 border-white/15 h-11 rounded-2xl font-mono text-foreground font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
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
                  className="bg-white/5 border-white/15 h-11 rounded-2xl text-foreground font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
                  placeholder="nombre@gymos.com"
                />
              </FormField>
              <FormField label="Teléfono" icon={Phone}>
                <Input
                  value={formData.phone}
                  onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { phone: e.target.value } })}
                  className="bg-white/5 border-white/15 h-11 rounded-2xl text-foreground font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
                  placeholder="+51 999 999 999"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Financial Compensation Section */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <DollarSign className="size-4" />
            Esquema de Compensación Financiera
          </div>
          <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-md shadow-xl">
            <div className="grid md:grid-cols-3 gap-4">
              <FormField label="Salario base mensual" icon={Briefcase}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-primary font-bold font-mono">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.baseSalary ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FORM",
                        payload: { baseSalary: e.target.value ? Number(e.target.value) : null },
                      })
                    }
                    className="bg-white/5 border-white/15 h-11 rounded-2xl pl-10 font-mono text-foreground font-semibold focus-visible:ring-primary/30"
                    placeholder="0.00"
                  />
                </div>
              </FormField>
              <FormField label="Pago por clase dictada" icon={Star}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-primary font-bold font-mono">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.perClassRate ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FORM",
                        payload: { perClassRate: e.target.value ? Number(e.target.value) : null },
                      })
                    }
                    className="bg-white/5 border-white/15 h-11 rounded-2xl pl-10 font-mono text-foreground font-semibold focus-visible:ring-primary/30"
                    placeholder="0.00"
                  />
                </div>
              </FormField>
              <FormField label="% Comisión por venta" icon={Percent}>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-primary font-bold font-mono">%</span>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.commissionPct ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FORM",
                        payload: { commissionPct: e.target.value ? Number(e.target.value) : null },
                      })
                    }
                    className="bg-white/5 border-white/15 h-11 rounded-2xl pr-8 font-mono text-foreground font-semibold focus-visible:ring-primary/30"
                    placeholder="10.0"
                  />
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* Specialties Management Section */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Activity className="size-4" />
            Especialidades Técnicas
          </div>
          <div className="p-6 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md space-y-4 shadow-xl">
            {formData.specialties && formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((spec: string, i: number) => (
                  <Badge
                    key={spec}
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "REMOVE_SPECIALTY", payload: i })}
                      className="hover:text-rose-400 transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Añadir nueva especialidad..."
                value={newSpecialty}
                onChange={(e) => dispatch({ type: "SET_NEW_SPECIALTY", payload: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), dispatch({ type: "ADD_SPECIALTY" }))}
                className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => dispatch({ type: "ADD_SPECIALTY" })}
                className="size-11 shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-bold text-xs uppercase tracking-wider transition-all"
          >
            <X className="size-4" />
            Cancelar
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Activity className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── View Mode (High-Contrast Header) ──────────────────────────────────
  return (
    <div className="flex-1 w-full space-y-6 text-center md:text-left">
      {/* Name + Status */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground">
          {trainer.fullName}
        </h1>
        <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="size-4" />
            <span>Instructor Certificado GymOS</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider rounded-xl px-3 py-1 border",
              trainer.isActive
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                : "border-zinc-500/40 text-zinc-400 bg-zinc-500/10",
            )}
          >
            {trainer.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      {/* High Contrast Contact Cards */}
      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-foreground">
          <Mail className="size-4 text-primary shrink-0" />
          <span>{trainer.email || "Sin email registrado"}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-foreground">
          <Phone className="size-4 text-primary shrink-0" />
          <span>{trainer.phone || "Sin teléfono registrado"}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono font-semibold text-foreground">
          <CreditCard className="size-4 text-primary shrink-0" />
          <span>DNI: {trainer.dni || "N/A"}</span>
        </div>
      </div>

      {/* Financial Compensation Summary Chips */}
      {(trainer.baseSalary || trainer.perClassRate || trainer.commissionPct) && (
        <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-1">
          {trainer.baseSalary ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-white/10 text-xs">
              <DollarSign className="size-3.5 text-emerald-400" />
              <span className="text-muted-foreground font-bold uppercase text-[10px]">Salario Base:</span>
              <span className="font-mono font-bold text-foreground">S/ {Number(trainer.baseSalary).toFixed(2)}</span>
            </div>
          ) : null}
          {trainer.perClassRate ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-white/10 text-xs">
              <Star className="size-3.5 text-amber-400" />
              <span className="text-muted-foreground font-bold uppercase text-[10px]">Por Clase:</span>
              <span className="font-mono font-bold text-foreground">S/ {Number(trainer.perClassRate).toFixed(2)}</span>
            </div>
          ) : null}
          {trainer.commissionPct ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-white/10 text-xs">
              <Percent className="size-3.5 text-purple-400" />
              <span className="text-muted-foreground font-bold uppercase text-[10px]">Comisión:</span>
              <span className="font-mono font-bold text-primary">{Number(trainer.commissionPct)}%</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Specialties Badges */}
      {trainer.specialties && trainer.specialties.length > 0 && (
        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
          {trainer.specialties.map((spec: string) => (
            <Badge
              key={spec}
              variant="outline"
              className="bg-primary/10 border-primary/30 text-primary px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl"
            >
              {spec}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
