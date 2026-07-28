"use client";

import React, { type FormEvent } from "react";
import {
  Search,
  Plus,
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CreateForm {
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
}

interface BranchControlBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  isCreateOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  createForm: CreateForm;
  onCreateFormChange: (form: CreateForm) => void;
  submittingCreate: boolean;
  onCreateSubmit: (e: FormEvent) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FILTER_OPTIONS = [
  { id: "ALL", label: "Todas las Sedes" },
  { id: "ACTIVE", label: "Activas" },
  { id: "INACTIVE", label: "Inactivas" },
] as const;

export function BranchControlBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isCreateOpen,
  onCreateOpenChange,
  createForm,
  onCreateFormChange,
  submittingCreate,
  onCreateSubmit,
  onNameChange,
}: BranchControlBarProps) {

  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
      <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
        {/* Search Input */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por nombre de sede, slug o dirección física..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-colors"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar w-full md:w-auto">
          {FILTER_OPTIONS.map((s) => (
            <button type="button"
              key={s.id}
              onClick={() => onStatusFilterChange(s.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
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
        <Dialog open={isCreateOpen} onOpenChange={onCreateOpenChange}>
          <DialogTrigger asChild>
            <Button className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
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

            <form onSubmit={onCreateSubmit} className="space-y-5 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Nombre de la Sede *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                    <Input
                      value={createForm.name}
                      onChange={onNameChange}
                      placeholder="Ej. Sede Miraflores - Av. Larco"
                      className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Slug / Identificador *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                    <Input
                      value={createForm.slug}
                      onChange={(e) => onCreateFormChange({ ...createForm, slug: e.target.value })}
                      placeholder="miraflores-larco"
                      className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl font-mono text-xs font-semibold focus-visible:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Dirección Física</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                    <Input
                      value={createForm.address}
                      onChange={(e) => onCreateFormChange({ ...createForm, address: e.target.value })}
                      placeholder="Av. José Larco 1234, Miraflores"
                      className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                      <Input
                        value={createForm.phone}
                        onChange={(e) => onCreateFormChange({ ...createForm, phone: e.target.value })}
                        placeholder="+51 987 654 321"
                        className="pl-10 bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Email Corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary" />
                      <Input
                        type="email"
                        value={createForm.email}
                        onChange={(e) => onCreateFormChange({ ...createForm, email: e.target.value })}
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
                  onClick={() => onCreateOpenChange(false)}
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
                    <><Loader2 className="size-4 animate-spin mr-2" /> Guardando...</>
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
  );
}
