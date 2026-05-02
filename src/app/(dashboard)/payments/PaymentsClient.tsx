"use client";

import React from "react";
import {
  Plus,
  Download,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentForm } from "@/components/shared/forms/PaymentForm";
import { RosenChart } from "@/components/shared/RosenChart";
import { formatCurrency, formatDate } from "@/lib/formats";

export function PaymentsClient({ payments, chartData, members, plans }: { 
  payments: any[], 
  chartData: any[],
  members: any[],
  plans: any[]
}) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-12">
      <div className="flex justify-end gap-4">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2">
              <Plus className="w-5 h-5" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Procesar Cobro</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Vincula un socio a un plan y registra la transacción.
              </DialogDescription>
            </DialogHeader>
            {isCreateOpen && (
              <PaymentForm 
                members={members} 
                plans={plans} 
                onSuccess={() => setIsCreateOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-card p-8 border-white/5 overflow-hidden">
          <div className="mb-8">
            <h2 className="text-2xl font-serif mb-1">Distribución de Ingresos</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Métodos de Pago</p>
          </div>
          <RosenChart data={chartData} />
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          <div className="glass-card p-6 border-white/5 bg-linear-to-br from-emerald-500/5 to-transparent">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Histórico</p>
            <p className="text-4xl font-serif">{formatCurrency(chartData.reduce((acc, curr) => acc + curr.value, 0))}</p>
          </div>
          <div className="glass-card p-6 border-white/5">
             <Wallet className="w-8 h-8 text-primary/40 mb-4" />
             <p className="text-xs text-muted-foreground">GymOS Financial Core operando al 100%.</p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-serif">Últimas Transacciones</h2>
        <div className="glass-card border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Socio</th>
                <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Monto</th>
                <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Método</th>
                <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Fecha</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p: any) => (
                <tr key={p.id} className="group hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{p.member.fullName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-sans font-semibold">{formatCurrency(p.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-[8px] uppercase px-2">{p.method}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {formatDate(p.createdAt, "d MMM, HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
