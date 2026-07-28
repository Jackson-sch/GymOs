"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface JoinPlanSelectorProps {
  plans: any[];
  branches: any[];
  selectedPlan: any;
  setSelectedPlan: (plan: any) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  onContinue: () => void;
}

export function JoinPlanSelector({
  plans,
  branches,
  selectedPlan,
  setSelectedPlan,
  selectedBranchId,
  setSelectedBranchId,
  onContinue,
}: JoinPlanSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold">Selecciona tu Plan de Entrenamiento</h2>
        <p className="text-xs text-muted-foreground">Únete hoy y obtén acceso instantáneo con código QR</p>
      </div>

      {branches.length > 0 && (
        <div className="max-w-md mx-auto space-y-2">
          <Label className="text-xs uppercase font-semibold text-muted-foreground">
            Selecciona tu Sede Principal
          </Label>
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 h-11 rounded-xl text-xs font-bold">
              <SelectValue placeholder="Todas las Sedes / Acceso Libre" />
            </SelectTrigger>
            <SelectContent className="glass-card bg-zinc-950/95 border-white/10 text-foreground rounded-2xl">
              <SelectItem value="ALL">Todas las Sedes / Acceso Libre</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name} {b.address ? `(${b.address})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          return (
            <div
              key={plan.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }}
              onClick={() => setSelectedPlan(plan)}
              className={`p-6 rounded-3xl border cursor-pointer transition-colors flex flex-col justify-between space-y-6 shadow-xl ${
                isSelected
                  ? "bg-primary/10 border-primary shadow-primary/20 scale-105"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-primary tracking-widest">
                    {plan.durationDays >= 360
                      ? "Anual"
                      : plan.durationDays >= 90
                      ? "Trimestral"
                      : "Mensual"}
                  </span>
                  {isSelected && <CheckCircle2 className="size-5 text-primary" />}
                </div>

                <h3 className="text-xl font-serif font-bold text-foreground">{plan.name}</h3>

                <div>
                  <span className="text-4xl font-serif font-bold text-foreground">
                    S/ {Number(plan.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground"> / {plan.durationDays} días</span>
                </div>

                {plan.description && (
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                )}
              </div>

              <Button
                onClick={() => {
                  setSelectedPlan(plan);
                  onContinue();
                }}
                className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 text-foreground hover:bg-white/20"
                }`}
              >
                Inscribirme Ahora
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
