"use client";

import React, { type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EditForm {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

interface EditBranchDialogProps {
  editingBranch: boolean;
  editForm: EditForm;
  submittingEdit: boolean;
  onEditFormChange: (form: EditForm) => void;
  onUpdateSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function EditBranchDialog({
  editingBranch,
  editForm,
  submittingEdit,
  onEditFormChange,
  onUpdateSubmit,
  onCancel,
}: EditBranchDialogProps) {
  return (
    <Dialog open={editingBranch} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif text-foreground">
            Editar Datos de la Sede
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
            Modifica el nombre, dirección o datos de contacto de esta sucursal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onUpdateSubmit} className="space-y-5 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Nombre de la Sede *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Slug / Identificador *</Label>
              <Input
                value={editForm.slug}
                onChange={(e) => onEditFormChange({ ...editForm, slug: e.target.value })}
                className="bg-white/5 border-white/15 h-11 rounded-2xl font-mono text-xs font-semibold focus-visible:ring-primary/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Dirección Física</Label>
              <Input
                value={editForm.address}
                onChange={(e) => onEditFormChange({ ...editForm, address: e.target.value })}
                className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Teléfono</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => onEditFormChange({ ...editForm, phone: e.target.value })}
                  className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => onEditFormChange({ ...editForm, email: e.target.value })}
                  className="bg-white/5 border-white/15 h-11 rounded-2xl text-xs font-semibold focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
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
                <><Loader2 className="size-4 animate-spin mr-2" /> Guardando...</>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
