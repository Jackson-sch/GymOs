"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Weight, CreditCard } from "lucide-react";
import { format } from "date-fns";

export function MemberPlanDetails({ member, currentMembership }: { member: any, currentMembership: any }) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <Card className="border-border shadow-sm bg-card/85 backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Weight className="size-4 text-primary" /> Última Métrica
          </CardTitle>
        </CardHeader>
        <CardContent>
          {member.bodyMetrics?.[0] ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/50 border border-border">
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Peso</div>
                <div className="text-2xl font-light text-foreground">{member.bodyMetrics[0].weight}kg</div>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/50 border border-border">
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Grasa</div>
                <div className="text-2xl font-light text-foreground">{member.bodyMetrics[0].bodyFat}%</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground/60 text-xs uppercase tracking-widest font-medium">Sin mediciones</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm bg-card/85 backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <CreditCard className="size-4 text-primary" /> Membresía Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMembership ? (() => {
            const totalPaid = currentMembership.payments?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;
            const price = Number(currentMembership.price) || 0;
            const balance = price - totalPaid;

            return (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xl font-medium text-primary">{currentMembership.plan?.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Vence el {format(new Date(currentMembership.endDate), "dd/MM/yyyy")}</div>
                  </div>
                  {balance > 0 ? (
                    <div className="text-right">
                      <Badge className="bg-rose-500/20 text-rose-500 border-none mb-1">DEUDA</Badge>
                      <div className="text-xs font-bold text-rose-500 font-mono">Saldo: S/. {balance.toFixed(2)}</div>
                    </div>
                  ) : (
                    <Badge className="bg-primary/20 text-primary border-none">AL DÍA</Badge>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="text-center py-8 opacity-30 text-xs uppercase tracking-widest">Sin membresía activa</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
