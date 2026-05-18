"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface BrandingTabProps {
  formState: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export function BrandingTab({ formState, handleChange }: BrandingTabProps) {
  return (
    <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-serif mb-1">Identidad Visual</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Configuración de marca y apariencia global
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Eslogan Editorial
          </Label>
          <Input
            value={formState["GYM_SLOGAN"] || ""}
            onChange={(e) => handleChange("GYM_SLOGAN", e.target.value)}
            placeholder="La excelencia es un hábito"
            className="bg-white/5 border-white/10 h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Color Primario (Hex)
          </Label>
          <div className="flex gap-2">
            <Input
              value={formState["PRIMARY_COLOR"] || "#000000"}
              onChange={(e) => handleChange("PRIMARY_COLOR", e.target.value)}
              placeholder="#000000"
              className="bg-white/5 border-white/10 h-12 rounded-xl"
            />
            <div
              className="size-12 rounded-xl border border-white/10"
              style={{
                backgroundColor: formState["PRIMARY_COLOR"] || "#000000",
              }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Logo del Gimnasio
          </Label>
          <div className="flex flex-col items-center md:items-start">
            <ImageUpload
              value={formState["GYM_LOGO"] || ""}
              onChange={(url) => handleChange("GYM_LOGO", url)}
              onRemove={() => handleChange("GYM_LOGO", "")}
              className="w-full max-w-[200px]"
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Favicon (32x32)
          </Label>
          <div className="flex flex-col items-center md:items-start">
            <ImageUpload
              value={formState["GYM_FAVICON"] || ""}
              onChange={(url) => handleChange("GYM_FAVICON", url)}
              onRemove={() => handleChange("GYM_FAVICON", "")}
              className="w-full max-w-[100px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
