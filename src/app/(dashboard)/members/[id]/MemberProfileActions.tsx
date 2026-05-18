"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Edit2, Loader2, Globe } from "lucide-react";

interface MemberProfileActionsProps {
  isEditing: boolean;
  isSaving: boolean;
  isLinking: boolean;
  member: any;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onEnablePortal: () => void;
}

export function MemberProfileActions({
  isEditing,
  isSaving,
  isLinking,
  member,
  onEdit,
  onCancel,
  onSave,
  onEnablePortal
}: MemberProfileActionsProps) {
  if (isEditing) {
    return (
      <div className="flex flex-row md:flex-col gap-2 shrink-0 self-center md:self-start">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Check className="size-4 mr-2" />}
          {isSaving ? "Guardando" : "Guardar"}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-xl h-12 px-6 glass-card border-white/10 hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest transition-all"
        >
          <X className="size-4 mr-2" />
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-row md:flex-col gap-2 shrink-0 self-center md:self-start">
      <Button
        onClick={onEdit}
        className="rounded-xl h-12 px-6 glass-card bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest transition-all group"
      >
        <Edit2 className="size-3.5 mr-2 group-hover:rotate-12 transition-transform" />
        Editar Perfil
      </Button>
      {!member.portalLink && (
        <Button
          variant="outline"
          onClick={onEnablePortal}
          disabled={isLinking}
          className="rounded-xl h-12 px-6 glass-card border-white/10 hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest transition-all"
        >
          {isLinking ? (
            <Loader2 className="size-3.5 animate-spin mr-2" />
          ) : (
            <Globe className="size-3.5 mr-2" />
          )}
          Activar Portal
        </Button>
      )}
    </div>
  );
}
