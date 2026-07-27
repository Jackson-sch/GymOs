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
import { Building2, FileText, MapPin, Phone, DollarSign, Clock, ShieldAlert, Receipt } from "lucide-react";

interface GeneralTabProps {
  formState: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export function GeneralTab({ formState, handleChange }: GeneralTabProps) {
  const currentFormat = formState["RECEIPT_FORMAT"] || "A4";

  return (
    <section className="glass-card p-6 sm:p-8 md:p-10 border-white/10 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-serif mb-1">General & Operación</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Información institucional, parámetros fiscales y políticas operativas del gimnasio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Datos de Identidad & Fiscales */}
        <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-primary border-b border-white/5 pb-3">
            <Building2 className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              1. Identidad Corporativa & Fiscal
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Building2 className="size-3.5 text-muted-foreground" /> Nombre Comercial del Gimnasio
              </Label>
              <Input
                value={formState["GYM_NAME"] || ""}
                onChange={(e) => handleChange("GYM_NAME", e.target.value)}
                placeholder="Ej: GymOS Elite Fitness"
                className="bg-white/5 border-white/10 h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <FileText className="size-3.5 text-muted-foreground" /> RUC / Identificación Fiscal
              </Label>
              <Input
                value={formState["GYM_RUC"] || ""}
                onChange={(e) => handleChange("GYM_RUC", e.target.value)}
                placeholder="20123456789"
                className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <MapPin className="size-3.5 text-muted-foreground" /> Dirección Fiscal Principal
              </Label>
              <Input
                value={formState["GYM_ADDRESS"] || ""}
                onChange={(e) => handleChange("GYM_ADDRESS", e.target.value)}
                placeholder="Av. Las Camelias 123, San Isidro, Lima"
                className="bg-white/5 border-white/10 h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Phone className="size-3.5 text-muted-foreground" /> Teléfono de Atención a Clientes
              </Label>
              <Input
                value={formState["GYM_PHONE"] || ""}
                onChange={(e) => handleChange("GYM_PHONE", e.target.value)}
                placeholder="+51 987 654 321"
                className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Parámetros Operativos & Moneda */}
        <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-primary border-b border-white/5 pb-3">
            <DollarSign className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              2. Configuración Operativa & Moneda
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <DollarSign className="size-3.5 text-muted-foreground" /> Moneda Principal
              </Label>
              <Select
                value={formState["CURRENCY"] || "PEN"}
                onValueChange={(value) => handleChange("CURRENCY", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-xs">
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEN">Soles Peruanos (PEN - S/)</SelectItem>
                  <SelectItem value="USD">Dólares Americanos (USD - $)</SelectItem>
                  <SelectItem value="EUR">Euros (EUR - €)</SelectItem>
                  <SelectItem value="MXN">Pesos Mexicanos (MXN - $)</SelectItem>
                  <SelectItem value="CLP">Pesos Chilenos (CLP - $)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Clock className="size-3.5 text-muted-foreground" /> Zona Horaria del Sistema
              </Label>
              <Select
                value={formState["TIMEZONE"] || "America/Lima"}
                onValueChange={(value) => handleChange("TIMEZONE", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-xs">
                  <SelectValue placeholder="Seleccionar zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Lima">Lima, Perú (UTC-5)</SelectItem>
                  <SelectItem value="America/Bogota">Bogotá, Colombia (UTC-5)</SelectItem>
                  <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
                  <SelectItem value="America/Santiago">Santiago, Chile (UTC-3)</SelectItem>
                  <SelectItem value="America/Buenos_Aires">Buenos Aires, Argentina (UTC-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ShieldAlert className="size-3.5 text-muted-foreground" /> Días de Gracia para Vencimientos
              </Label>
              <Input
                type="number"
                min="0"
                max="15"
                value={formState["GRACE_DAYS"] || "3"}
                onChange={(e) => handleChange("GRACE_DAYS", e.target.value)}
                placeholder="3"
                className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Días de acceso permitidos en torniquete tras la fecha de vencimiento antes de bloquear.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprobantes Selection */}
      <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-primary border-b border-white/5 pb-2">
          <Receipt className="size-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            3. Formato de Impresión de Comprobantes
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleChange("RECEIPT_FORMAT", "A4")}
            className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
              currentFormat === "A4"
                ? "bg-white/10 border-primary shadow-lg"
                : "bg-white/2 border-white/5 hover:border-white/20"
            }`}
          >
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Documento A4 Estándar (PDF)
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                Facturas impresas o enviadas por correo con cabecera corporativa, detalle de impuestos y código QR.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange("RECEIPT_FORMAT", "TICKET")}
            className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
              currentFormat === "TICKET"
                ? "bg-white/10 border-primary shadow-lg"
                : "bg-white/2 border-white/5 hover:border-white/20"
            }`}
          >
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
              <Receipt className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Ticket Térmico 80mm
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                Formato continuo optimizado para impresoras térmicas POS en recepción de gimnasio.
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
