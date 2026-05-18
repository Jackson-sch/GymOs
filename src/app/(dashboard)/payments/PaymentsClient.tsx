"use client";

import React from "react";
import {
  Plus,
  Download,
  Wallet,
  FileText,
  Receipt
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentForm } from "@/components/shared/forms/PaymentForm";
import { RosenChart } from "@/components/shared/RosenChart";
import { DataTable } from "@/components/shared/DataTable";
import { formatCurrency } from "@/lib/formats";
import { getColumns } from "./columns";

export function PaymentsClient({ 
  payments: initialPayments, 
  chartData, 
  members, 
  plans,
  trainers,
  defaultReceiptFormat = "A4" 
}: { 
  payments: any[], 
  chartData: any[],
  members: any[],
  plans: any[],
  trainers: any[],
  defaultReceiptFormat?: string
}) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const payments = initialPayments;

  const handlePaymentSuccess = React.useCallback(async () => {
    setIsCreateOpen(false);
    window.location.reload();
  }, []);

  const columns = React.useMemo(() => getColumns(defaultReceiptFormat), [defaultReceiptFormat]);

  return (
    <div className="space-y-12">
      <div className="flex justify-end gap-4">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2">
              <Plus className="size-5" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl">
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
                trainers={trainers}
                onSuccess={handlePaymentSuccess} 
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
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Total Histórico</p>
            <p className="text-4xl font-serif">{formatCurrency(chartData.reduce((acc, curr) => acc + curr.value, 0))}</p>
          </div>
          <div className="glass-card p-6 border-white/5">
             <Wallet className="size-8 text-primary/40 mb-4" />
             <p className="text-xs text-muted-foreground">GymOS Financial Core operando al 100%.</p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-serif">Historial de Transacciones</h2>
        <DataTable 
          columns={columns} 
          data={payments} 
          filterColumn="member_fullName"
          placeholder="Buscar transacción..."
        />
      </div>
    </div>
  );
}
