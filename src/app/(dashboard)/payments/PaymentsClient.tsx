"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Wallet,
  Receipt,
  Search,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  TrendingUp,
  Calendar,
  DollarSign,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { DataTable } from "@/components/shared/DataTable";
import { formatCurrency } from "@/lib/formats";
import { getColumns } from "./columns";
import { PaymentStatsGrid } from "./components/PaymentStatsGrid";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/shared/DateRangePicker";

export function PaymentsClient({
  payments: initialPayments,
  chartData,
  members,
  plans,
  trainers,
  defaultReceiptFormat = "A4",
}: {
  payments: any[];
  chartData: any[];
  members: any[];
  plans: any[];
  trainers: any[];
  defaultReceiptFormat?: string;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  const payments = initialPayments;

  const handlePaymentSuccess = useCallback(async () => {
    setIsCreateOpen(false);
    window.location.reload();
  }, []);

  const columns = useMemo(() => getColumns(defaultReceiptFormat), [defaultReceiptFormat]);

  // Compute key financial metrics
  const financialMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let todayTotal = 0;
    let todayCount = 0;
    let monthTotal = 0;

    const methodTotals: Record<string, number> = {};

    payments.forEach((p) => {
      const amount = Number(p.amount || 0);
      const paidDate = new Date(p.createdAt);

      if (paidDate >= today) {
        todayTotal += amount;
        todayCount++;
      }

      if (paidDate >= firstDayOfMonth) {
        monthTotal += amount;
      }

      const m = (p.method || "EFECTIVO").toUpperCase();
      methodTotals[m] = (methodTotals[m] || 0) + amount;
    });

    const topMethodEntry = Object.entries(methodTotals).sort((a, b) => b[1] - a[1])[0];
    const topMethod = topMethodEntry ? topMethodEntry[0] : "EFECTIVO";
    const avgTicket = payments.length > 0 ? monthTotal / (payments.length || 1) : 0;

    return {
      todayTotal,
      todayCount,
      monthTotal,
      topMethod,
      avgTicket,
      totalCount: payments.length,
    };
  }, [payments]);

  // Filtered dataset
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const query = search.trim().toLowerCase();
      const memberName = p.member?.fullName?.toLowerCase() || "";
      const planName = p.membership?.plan?.name?.toLowerCase() || "";
      const invoiceNumber = p.invoiceNumber?.toLowerCase() || "";
      const reference = p.reference?.toLowerCase() || "";
      const amountStr = String(p.amount || "");
      const methodStr = (p.method || "").toLowerCase();

      const matchesSearch =
        !query ||
        memberName.includes(query) ||
        planName.includes(query) ||
        invoiceNumber.includes(query) ||
        reference.includes(query) ||
        amountStr.includes(query) ||
        methodStr.includes(query);

      let matchesMethod = true;
      const m = (p.method || "").toUpperCase();

      if (selectedMethod === "CASH") {
        matchesMethod = m === "CASH" || m.includes("EFECTIVO");
      } else if (selectedMethod === "YAPE_PLIN") {
        matchesMethod = m === "YAPE" || m === "PLIN" || m.includes("YAPE") || m.includes("PLIN");
      } else if (selectedMethod === "CARD") {
        matchesMethod = m === "CARD" || m.includes("TARJETA") || m.includes("POS");
      } else if (selectedMethod === "TRANSFER") {
        matchesMethod = m === "TRANSFER" || m.includes("TRANSFERENCIA") || m.includes("BANCO");
      }

      let matchesDate = true;
      if (p.createdAt) {
        const paidDate = new Date(p.createdAt);
        if (dateFrom) {
          const fromD = new Date(`${dateFrom}T00:00:00`);
          if (paidDate < fromD) matchesDate = false;
        }
        if (dateTo) {
          const toD = new Date(`${dateTo}T23:59:59`);
          if (paidDate > toD) matchesDate = false;
        }
      }

      return matchesSearch && matchesMethod && matchesDate;
    });
  }, [payments, search, selectedMethod, dateFrom, dateTo]);

  return (
    <div className="space-y-8 w-full">
      {/* Executive Financial KPI Cards */}
      <PaymentStatsGrid metrics={financialMetrics} />

      {/* Main Income Chart & Transaction Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 glass-card p-6 md:p-8 border-white/10 rounded-3xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Distribución de Ingresos por Método</h2>
              <p className="text-xs text-muted-foreground">Volumen de recaudación desglosado por canal de cobro</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-mono font-bold px-3 py-1 self-start sm:self-auto">
              Total: {formatCurrency(chartData.reduce((acc, curr) => acc + curr.value, 0))}
            </Badge>
          </div>
          <RosenChart data={chartData} />
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between glass-card p-6 md:p-8 border-white/10 rounded-3xl bg-white/2 backdrop-blur-md space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl w-fit text-primary">
              <Wallet className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-foreground">Caja & Cobros</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Módulo de procesamiento financiero de GymOS. Registre cobros directos, renueve membresías y emita recibos oficiales en formato A4 o Ticket 80mm.
              </p>
            </div>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                <Plus className="size-4" />
                Registrar Cobro en Caja
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Procesar Cobro en Caja</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Vincula un socio a un plan y registra la transacción financiera.
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
      </div>

      {/* Transaction Control Bar: Single Search + Method Pills */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
          {/* SINGLE UNIFIED SEARCH INPUT & DATE RANGE */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Buscar por socio, plan o número de comprobante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-colors"
              />
            </div>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onSelectRange={({ from, to }) => {
                setDateFrom(from);
                setDateTo(to);
              }}
              placeholder="Filtrar por fechas"
              showPresets={false}
              align="start"
            />
          </div>

          {/* Payment Method Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar">
            {[
              { id: "ALL", label: "Todos", icon: null },
              { id: "CASH", label: "Efectivo", icon: Banknote },
              { id: "YAPE_PLIN", label: "Yape / Plin", icon: Smartphone },
              { id: "CARD", label: "Tarjeta POS", icon: CreditCard },
              { id: "TRANSFER", label: "Transferencia", icon: Building2 },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button type="button"
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5",
                    selectedMethod === m.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  )}
                >
                  {Icon && <Icon className="size-3" />}
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transactions Data Table without Duplicate Inner Search */}
        <div className="glass-card border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
          <DataTable
            columns={columns}
            data={filteredPayments}
            showSearchInput={false}
          />
        </div>
      </div>
    </div>
  );
}
