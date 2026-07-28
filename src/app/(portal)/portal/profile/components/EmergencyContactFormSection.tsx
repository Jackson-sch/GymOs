"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeartHandshake } from "lucide-react";

interface EmergencyContactFormSectionProps {
  isEditing: boolean;
  member: any;
  emergencyContact: string;
  setEmergencyContact: (val: string) => void;
  emergencyPhone: string;
  setEmergencyPhone: (val: string) => void;
}

export function EmergencyContactFormSection({
  isEditing,
  member,
  emergencyContact,
  setEmergencyContact,
  emergencyPhone,
  setEmergencyPhone,
}: EmergencyContactFormSectionProps) {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-serif">Contacto de Emergencia</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Emergency Contact Name */}
        <div className="space-y-2">
          <Label htmlFor="emergencyContact" className="text-xs uppercase tracking-wider text-muted-foreground ml-1">
            Nombre del Contacto
          </Label>
          {isEditing ? (
            <Input
              id="emergencyContact"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Nombre del familiar o contacto"
              className="h-11 bg-white/5 border-white/10 rounded-xl transition-colors font-sans"
            />
          ) : (
            <p className="text-sm font-medium h-11 flex items-center bg-white/2 border border-transparent rounded-xl px-3 text-muted-foreground/80 font-sans">
              {member?.emergencyContact || "No especificado"}
            </p>
          )}
        </div>

        {/* Emergency Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone" className="text-xs uppercase tracking-wider text-muted-foreground ml-1">
            Teléfono de Emergencia
          </Label>
          {isEditing ? (
            <Input
              id="emergencyPhone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="Teléfono del contacto"
              className="h-11 bg-white/5 border-white/10 rounded-xl transition-colors font-sans"
            />
          ) : (
            <p className="text-sm font-medium h-11 flex items-center bg-white/2 border border-transparent rounded-xl px-3 text-muted-foreground/80 font-sans">
              {member?.emergencyPhone || "No especificado"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
