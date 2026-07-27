"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";
import { formatDate } from "@/lib/formats";
import { DatePicker } from "@/components/ui/date-picker";

interface PersonalInfoFormSectionProps {
  isEditing: boolean;
  member: any;
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
}

export function PersonalInfoFormSection({
  isEditing,
  member,
  fullName,
  setFullName,
  phone,
  setPhone,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  address,
  setAddress,
}: PersonalInfoFormSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <User className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-serif">Información Personal</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-xs uppercase tracking-wider text-muted-foreground ml-1">
            Nombre Completo
          </Label>
          {isEditing ? (
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Ingresa tu nombre"
              className="h-11 bg-white/5 border-white/10 rounded-xl transition-all font-sans"
            />
          ) : (
            <p className="text-sm font-medium h-11 flex items-center bg-white/2 border border-transparent rounded-xl px-3 text-muted-foreground/80 font-sans">
              {member?.fullName || "No especificado"}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground ml-1">
            Teléfono Móvil
          </Label>
          {isEditing ? (
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="Ej. +51 987 654 321"
              className="h-11 bg-white/5 border-white/10 rounded-xl transition-all font-sans"
            />
          ) : (
            <p className="text-sm font-medium h-11 flex items-center bg-white/2 border border-transparent rounded-xl px-3 text-muted-foreground/80 font-sans">
              {member?.phone || "No especificado"}
            </p>
          )}
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="text-xs uppercase tracking-wider text-muted-foreground ml-1">
            Fecha de Nacimiento
          </Label>
          {isEditing ? (
            <DatePicker
              value={birthDate}
              onChange={(date) => setBirthDate(date ? date.toISOString().split("T")[0] : "")}
              placeholder="Seleccionar fecha..."
              className="h-11"
            />
          ) : (
            <p className="text-sm font-medium h-11 flex items-center bg-white/2 border border-transparent rounded-xl px-3 text-muted-foreground/80 font-sans">
              {formatDate(member?.birthDate)}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-xs uppercase tracking-wider text-muted-foreground ml-1">
            Género
          </Label>
          {isEditing ? (
            <Select value={gender} onValueChange={(value: any) => setGender(value)}>
              <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl transition-all font-sans">
                <SelectValue placeholder="Selecciona género" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900/90 border-white/10 backdrop-blur-xl">
                <SelectItem value="MALE">Masculino</SelectItem>
                <SelectItem value="FEMALE">Femenino</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-medium h-11 flex items-center bg-white/2 border border-transparent rounded-xl px-3 text-muted-foreground/80 font-sans">
              {member?.gender === "MALE" ? "Masculino" : member?.gender === "FEMALE" ? "Femenino" : "Otro / No especificado"}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="address" className="text-xs uppercase tracking-wider text-muted-foreground ml-1">
            Dirección de Residencia
          </Label>
          {isEditing ? (
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ingresa tu dirección"
              className="h-11 bg-white/5 border-white/10 rounded-xl transition-all font-sans"
            />
          ) : (
            <p className="text-sm font-medium h-11 flex items-center bg-white/2 border border-transparent rounded-xl px-3 text-muted-foreground/80 font-sans">
              {member?.address || "No especificada"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
