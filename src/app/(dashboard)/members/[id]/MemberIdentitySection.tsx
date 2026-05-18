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
import { Mail, Phone, User as UserIcon, Target, ShieldCheck, AlertCircle, KeyRound } from "lucide-react";

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
      <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
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
            <Input 
              type="date"
              value={formData.birthDate} 
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))} 
              className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Estado</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
              <SelectTrigger className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/10 backdrop-blur-xl">
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

  return (
    <div className="space-y-6 text-center md:text-left">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground drop-shadow-sm">{member.fullName}</h1>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 font-medium tracking-wide">
          <div className={`flex items-center gap-1.5 ${member.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>
            <Target className="size-4" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">
              {member.status === 'ACTIVE' ? 'Socio Activo' : member.status === 'INACTIVE' ? 'Socio Inactivo' : 'Socio Suspendido'}
            </span>
          </div>
          {member.pin && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold shadow-sm">
              <KeyRound className="size-3.5" /> PIN Kiosco Asignado
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-center md:justify-start gap-8 opacity-70">
        <div className="flex items-center gap-3"><Mail className="size-4 text-primary" /><span className="text-sm font-light">{member.email}</span></div>
        <div className="flex items-center gap-3"><Phone className="size-4 text-primary" /><span className="text-sm font-light">{member.phone}</span></div>
        <div className="flex items-center gap-3"><UserIcon className="size-4 text-primary" /><span className="text-sm font-light">DNI: {member.dni}</span></div>
      </div>
    </div>
  );
}
