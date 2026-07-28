"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KeyRound, Activity } from "lucide-react";

interface MemberPinDialogProps {
  member: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPin: string;
  onPinChange: (pin: string) => void;
  onAssignPin: () => void;
  isAssigningPin: boolean;
}

export function MemberPinDialog({
  member,
  open,
  onOpenChange,
  newPin,
  onPinChange,
  onAssignPin,
  isAssigningPin,
}: MemberPinDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-white/10 hover:bg-white/5 h-12 px-6 rounded-xl font-bold transition-colors duration-300 shadow-sm"
        >
          <KeyRound className="size-4 mr-2 text-primary" />
          {member.pin ? "Cambiar PIN Kiosco" : "Asignar PIN Kiosco"}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card bg-zinc-950/95 backdrop-blur-2xl border-white/10 max-w-sm p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2 text-foreground">
            <KeyRound className="size-5 text-primary" />
            PIN de Kiosco
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-xs text-white/70 leading-relaxed">
            Asigna un código de 4 a 6 dígitos para que{" "}
            <strong className="text-white">{member.fullName}</strong> pueda hacer check-in
            rápidamente desde el Kiosco.
          </p>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">
              Código PIN Numérico
            </Label>
            <Input
              type="password"
              maxLength={6}
              placeholder="Ej: 12345"
              value={newPin}
              onChange={(e) => onPinChange(e.target.value.replace(/\D/g, ""))}
              className="bg-white/5 border-white/10 h-12 rounded-xl text-center font-mono tracking-[0.5em] text-xl placeholder:tracking-normal placeholder:text-xs"
            />
          </div>
          <Button
            onClick={onAssignPin}
            disabled={isAssigningPin || newPin.length < 4}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-colors duration-300"
          >
            {isAssigningPin ? <Activity className="size-4 mr-2 animate-spin" /> : null}
            {isAssigningPin ? "Guardando..." : "Guardar PIN"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
