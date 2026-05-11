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
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/formats";
import { getRecentPaymentsAction } from "@/lib/actions/payments-actions";

export function PaymentsClient({ 
  payments: initialPayments, 
  chartData, 
  members, 
  plans,
  defaultReceiptFormat = "A4" 
}: { 
  payments: any[], 
  chartData: any[],
  members: any[],
  plans: any[],
  defaultReceiptFormat?: string
}) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [payments, setPayments] = React.useState(initialPayments);

  // Keep in sync if server re-renders with new props
  React.useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  const handlePaymentSuccess = React.useCallback(async () => {
    setIsCreateOpen(false);
    // Immediately re-fetch payments from DB
    const result = await getRecentPaymentsAction();
    if (result.success && result.data) {
      setPayments(result.data as any[]);
    }
  }, []);

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "member.fullName",
      header: "Socio",
      id: "member_fullName",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.member.fullName}</span>
      )
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <span className="text-sm font-sans font-semibold">{formatCurrency(row.original.amount)}</span>
      )
    },
    {
      accessorKey: "method",
      header: "Método",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[8px] uppercase px-2">{row.original.method}</Badge>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, "d MMM, HH:mm")}</span>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-white/10 bg-black/80 backdrop-blur-xl">
              <DropdownMenuItem
                onClick={() => window.open(`/api/payments/${row.original.id}/receipt?format=a4`, "_blank")}
                className="flex items-center justify-between gap-2 rounded-lg cursor-pointer focus:bg-primary/20 focus:text-primary transition-all duration-200 p-2"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium">Recibo A4</span>
                </div>
                {defaultReceiptFormat === "A4" && (
                  <Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary uppercase font-bold px-1.5 bg-primary/5">Por defecto</Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`/api/payments/${row.original.id}/receipt?format=ticket`, "_blank")}
                className="flex items-center justify-between gap-2 rounded-lg cursor-pointer focus:bg-primary/20 focus:text-primary transition-all duration-200 p-2"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  <span className="text-xs font-medium">Ticket 80mm</span>
                </div>
                {defaultReceiptFormat === "TICKET" && (
                  <Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary uppercase font-bold px-1.5 bg-primary/5">Por defecto</Badge>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], []);

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
