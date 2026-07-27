"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Check, Eye } from "lucide-react";

interface BrandingTabProps {
  formState: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

// Preset theme colors matching Tailwind & GymOS aesthetics
const COLOR_PRESETS = [
  { name: "Emerald Neón", hex: "#10b981", label: "Salud & Vitalidad" },
  { name: "Gold Luxury", hex: "#eab308", label: "VIP & Exclusivo" },
  { name: "Electric Violet", hex: "#8b5cf6", label: "Fitness Moderno" },
  { name: "Crimson Power", hex: "#f43f5e", label: "Crossfit & Fuerza" },
  { name: "Cyan Tech", hex: "#06b6d4", label: "High Performance" },
  { name: "Amber Bronze", hex: "#f59e0b", label: "Musculación" },
];

export function BrandingTab({ formState, handleChange }: BrandingTabProps) {
  const currentColor = formState["PRIMARY_COLOR"] || "#10b981";

  return (
    <section className="glass-card p-6 sm:p-8 md:p-10 border-white/10 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-serif mb-1">Identidad Visual & Marca (White-Label)</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Personalización de la apariencia corporativa para el Dashboard, Portal de Socios y comprobantes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Eslogan Editorial del Gimnasio
            </Label>
            <Input
              value={formState["GYM_SLOGAN"] || ""}
              onChange={(e) => handleChange("GYM_SLOGAN", e.target.value)}
              placeholder="Ej: La excelencia es un hábito diario"
              className="bg-white/5 border-white/10 h-11 rounded-xl text-xs"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Color Primario de Marca
              </Label>
              <span className="font-mono text-[11px] font-bold text-primary">{currentColor}</span>
            </div>

            {/* Tailwind Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleChange("PRIMARY_COLOR", preset.hex)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-white/10 border-primary shadow-md"
                        : "bg-white/2 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <span
                      className="size-5 rounded-lg border border-white/20 shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="size-3 text-black font-bold" />}
                    </span>
                    <div className="truncate">
                      <p className="text-[11px] font-bold text-foreground truncate">{preset.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{preset.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-3 pt-2">
              <div className="relative size-11 rounded-xl border border-white/10 overflow-hidden shrink-0">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleChange("PRIMARY_COLOR", e.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0 z-10"
                />
                <div
                  className="size-full rounded-xl"
                  style={{ backgroundColor: currentColor }}
                />
              </div>
              <Input
                value={formState["PRIMARY_COLOR"] || "#10b981"}
                onChange={(e) => handleChange("PRIMARY_COLOR", e.target.value)}
                placeholder="#10b981"
                className="bg-white/5 border-white/10 h-11 rounded-xl font-mono text-xs max-w-[150px]"
              />
              <p className="text-[10px] text-muted-foreground leading-tight">
                Seleccione un valor Hexadecimal o elija entre los tonos predeterminados recomendados.
              </p>
            </div>
          </div>

          {/* Logos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Logo Principal del Gimnasio
              </Label>
              <ImageUpload
                value={formState["GYM_LOGO"] || ""}
                onChange={(url) => handleChange("GYM_LOGO", url)}
                onRemove={() => handleChange("GYM_LOGO", "")}
                className="w-full max-w-[200px]"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Favicon (32x32)
              </Label>
              <ImageUpload
                value={formState["GYM_FAVICON"] || ""}
                onChange={(url) => handleChange("GYM_FAVICON", url)}
                onRemove={() => handleChange("GYM_FAVICON", "")}
                className="w-full max-w-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Live UI Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white/2 border border-white/10 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 text-primary">
              <Eye className="size-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Vista Previa en Vivo (Live Theme)
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Previsualización en tiempo real de la marca para el <strong>Portal de Socios</strong>, correos de notificación y comprobantes:
            </p>

            {/* Mock Client Portal Card */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 shadow-2xl relative overflow-hidden">
              <div
                className="absolute -top-12 -right-12 size-32 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ backgroundColor: currentColor }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {formState["GYM_LOGO"] ? (
                    <img
                      src={formState["GYM_LOGO"]}
                      alt="Logo"
                      className="h-7 w-auto object-contain"
                    />
                  ) : (
                    <div
                      className="size-7 rounded-lg flex items-center justify-center font-bold text-black text-xs"
                      style={{ backgroundColor: currentColor }}
                    >
                      G
                    </div>
                  )}
                  <span className="font-serif font-bold text-sm text-white">
                    {formState["GYM_NAME"] || "GymOS Platform"}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: `${currentColor}15`,
                    borderColor: `${currentColor}40`,
                    color: currentColor,
                  }}
                  className="text-[9px] font-bold"
                >
                  ● ACTIVO
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  Membresía VIP Anual
                </p>
                <p className="text-xs italic text-slate-300">
                  "{formState["GYM_SLOGAN"] || "La excelencia es un hábito diario"}"
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  style={{ backgroundColor: currentColor, color: "#000" }}
                  className="w-full h-9 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.01]"
                >
                  Acceder al Portal de Socio
                </Button>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground space-y-1.5 pt-2 border-t border-white/5">
              <p className="font-semibold text-foreground">¿Dónde se utiliza esta configuración?</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Acentos y botones primarios del <strong>Portal web de socios</strong>.</li>
                <li>Logos y cabeceras de <strong>Facturas y Recibos PDF</strong>.</li>
                <li>Notificaciones y correos transaccionales (Resend/Email).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
