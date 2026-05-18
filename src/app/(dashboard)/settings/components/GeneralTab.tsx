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

interface GeneralTabProps {
  formState: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export function GeneralTab({ formState, handleChange }: GeneralTabProps) {
  return (
    <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-serif mb-1">General</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Información básica del gimnasio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Nombre del Gimnasio
          </Label>
          <Input
            value={formState["GYM_NAME"] || ""}
            onChange={(e) => handleChange("GYM_NAME", e.target.value)}
            placeholder="GymOS Elite"
            className="bg-white/5 border-white/10 h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            RUC / ID Fiscal
          </Label>
          <Input
            value={formState["GYM_RUC"] || ""}
            onChange={(e) => handleChange("GYM_RUC", e.target.value)}
            placeholder="20123456789"
            className="bg-white/5 border-white/10 h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Dirección Principal
          </Label>
          <Input
            value={formState["GYM_ADDRESS"] || ""}
            onChange={(e) => handleChange("GYM_ADDRESS", e.target.value)}
            placeholder="Av. Las Camelias 123"
            className="bg-white/5 border-white/10 h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Teléfono Contacto
          </Label>
          <Input
            value={formState["GYM_PHONE"] || ""}
            onChange={(e) => handleChange("GYM_PHONE", e.target.value)}
            placeholder="+51 987 654 321"
            className="bg-white/5 border-white/10 h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Formato de Comprobante
          </Label>
          <Select
            value={formState["RECEIPT_FORMAT"] || "A4"}
            onValueChange={(value) => handleChange("RECEIPT_FORMAT", value)}
          >
            <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
              <SelectValue placeholder="Seleccionar formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">Documento A4 (Estándar)</SelectItem>
              <SelectItem value="TICKET">Ticket 80mm (Térmico)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
