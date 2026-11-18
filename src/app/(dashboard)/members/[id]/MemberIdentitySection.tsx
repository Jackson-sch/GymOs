"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, User as UserIcon, Target, KeyRound, Copy } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

export interface MemberFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  photo: string;
  photoPosition: number;
  status: string;
  dni: string;
  birthDate: string;
}

interface MemberIdentitySectionProps {
  isEditing: boolean;
  member: any;
  formData: MemberFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>;
}

export function MemberIdentitySection({ isEditing, member, formData, setFormData }: MemberIdentitySectionProps) {
  if (isEditing) {
    return (
      <div className="grid gap-6 animate-slide-down">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Nombre Completo</Label>
            <Input 
              value={formData.fullName} 
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} 
              className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">DNI / Documento</Label>
            <Input 
              value={formData.dni} 
              onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))} 
              className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" 
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Email</Label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
              className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Teléfono</Label>
            <Input 
              value={formData.phone} 
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
              className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" 
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Fecha de Nac.</Label>
            <DatePicker
              value={formData.birthDate}
              onChange={(date) => setFormData((prev) => ({ ...prev, birthDate: date ? date.toISOString().split("T")[0] : "" }))}
              placeholder="Seleccionar fecha..."
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Estado</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
              <SelectTrigger className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border backdrop-blur-xl">
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                <SelectItem value="SUSPENDED">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  const copyField = (label: string, value?: string | null) => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    toast.success(`${label} copiado`);
  };

  return (
    <div className="space-y-4 text-center md:text-left">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight text-foreground leading-tight">
          {member.fullName}
        </h1>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 font-medium tracking-wide">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] uppercase tracking-wider font-bold ${
              member.status === "ACTIVE"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400"
            }`}
          >
            <Target className="size-3.5" />
            <span>
              {member.status === "ACTIVE"
                ? "Socio Activo"
                : member.status === "INACTIVE"
                  ? "Socio Inactivo"
                  : "Socio Suspendido"}
            </span>
          </div>
          {member.pin && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] font-bold">
              <KeyRound className="size-3" /> PIN Kiosco Asignado
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center md:justify-start gap-2">
        {member.email && (
          <button
            type="button"
            onClick={() => copyField("Correo", member.email)}
            title="Copiar correo"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted border border-border text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Mail className="size-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[220px]">{member.email}</span>
            <Copy className="size-3 opacity-0 group-hover:opacity-70 transition-opacity" />
          </button>
        )}
        {member.phone && (
          <button
            type="button"
            onClick={() => copyField("Teléfono", member.phone)}
            title="Copiar teléfono"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted border border-border text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Phone className="size-3.5 text-primary shrink-0" />
            <span>{member.phone}</span>
            <Copy className="size-3 opacity-0 group-hover:opacity-70 transition-opacity" />
          </button>
        )}
        {member.dni && (
          <button
            type="button"
            onClick={() => copyField("DNI", member.dni)}
            title="Copiar DNI"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted border border-border text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            <UserIcon className="size-3.5 text-primary shrink-0" />
            <span>DNI: {member.dni}</span>
            <Copy className="size-3 opacity-0 group-hover:opacity-70 transition-opacity" />
          </button>
        )}
      </div>
    </div>
  );
}
