"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createMember } from "@/actions/members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MemberForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState("MALE");
  const [birthDate, setBirthDate] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      dni: formData.get("dni") as string,
      birthDate: formData.get("birthDate") as string,
      gender: formData.get("gender") as any,
      emergencyContact: formData.get("emergencyContact") as string,
      emergencyPhone: formData.get("emergencyPhone") as string,
      notes: formData.get("notes") as string,
    };

    const result = await createMember(data);

    if (result.success) {
      router.push("/members");
      router.refresh();
    } else {
      setError(result.error || "Ocurrió un error inesperado");
      setIsPending(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-zinc-200">
      <CardHeader>
        <CardTitle>Información del Socio</CardTitle>
        <CardDescription>
          Completa los datos para registrar un nuevo miembro en el gimnasio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input id="fullName" name="fullName" placeholder="Ej. Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI / Documento *</Label>
              <Input id="dni" name="dni" placeholder="8 dígitos" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input id="phone" name="phone" placeholder="999 999 999" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <input type="hidden" name="birthDate" value={birthDate} />
              <DatePicker
                value={birthDate}
                onChange={(date) => setBirthDate(date ? date.toISOString().split("T")[0] : "")}
                placeholder="Seleccionar fecha de nacimiento..."
                className="h-10 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <input type="hidden" name="gender" value={gender} />
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-full bg-background border-input h-10">
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent className="glass-card bg-black/90 text-white">
                  <SelectItem value="MALE">Masculino</SelectItem>
                  <SelectItem value="FEMALE">Femenino</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Nombre de Contacto</Label>
                <Input id="emergencyContact" name="emergencyContact" placeholder="Nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                <Input id="emergencyPhone" name="emergencyPhone" placeholder="999 999 999" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="notes">Notas / Observaciones</Label>
            <textarea
              id="notes"
              name="notes"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Alergias, condiciones médicas, etc."
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Miembro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
