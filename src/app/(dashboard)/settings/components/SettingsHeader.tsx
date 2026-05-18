"use client";

import React from "react";
import { Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  loading: boolean;
  onSave: () => void;
}

export function SettingsHeader({ loading, onSave }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Globe className="size-4" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">
            Núcleo del Sistema
          </span>
        </div>
        <h1 className="text-6xl font-serif leading-tight">Configuración</h1>
        <p className="text-muted-foreground font-sans max-w-md">
          Personalizando el motor de{" "}
          <span className="text-foreground font-medium">GymOS</span> para
          adaptarse a tu marca y necesidades.
        </p>
      </div>

      <Button
        onClick={onSave}
        disabled={loading}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Save className="size-5" />
        )}
        Guardar Cambios
      </Button>
    </div>
  );
}
