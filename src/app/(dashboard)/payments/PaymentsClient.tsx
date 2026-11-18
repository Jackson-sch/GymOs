"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { formatCurrency } from "@/lib/formats";
import { getColumns } from "./columns";
import { PaymentStatsGrid } from "./components/PaymentStatsGrid";
import { RevenueTrendChart } from "./components/RevenueTrendChart";
import { PaymentChannelBreakdown } from "./components/PaymentChannelBreakdown";
import { PaymentActionBar } from "./components/PaymentActionBar";
import { PaymentFilterBar } from "./components/PaymentFilterBar";
import {
  computeFinancialMetrics,
  filterPayments,
  summarizeByChannel,
  exportPaymentsCsv,
  type PeriodPreset,
} from "./utils/payment-helpers";

export function PaymentsClient({
  payments: initialPayments,
  members,
  plans,
  trainers,
  defaultReceiptFormat = "A4",
}: {
  payments: any[];
  chartData?: any[];
  members: any[];
  plans: any[];
  trainers: any[];
  defaultReceiptFormat?: string;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("MONTH");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  const handlePaymentSuccess = useCallback(() => {
    setIsCreateOpen(false);
    window.location.reload();
  }, []);

  const columns = useMemo(
    () => getColumns(defaultReceiptFormat),
    [defaultReceiptFormat],
  );

  const financialMetrics = useMemo(
    () => computeFinancialMetrics(initialPayments),
    [initialPayments],
  );

  const filteredPayments = useMemo(
    () =>
      filterPayments(initialPayments, {
        search,
        selectedMethod,
        periodPreset,
        dateFrom,
        dateTo,
      }),
    [initialPayments, search, selectedMethod, periodPreset, dateFrom, dateTo],
  );

  const filteredSummary = useMemo(
    () => summarizeByChannel(filteredPayments),
    [filteredPayments],
  );

  const hasActiveFilters = Boolean(
    search.trim() ||
      selectedMethod !== "ALL" ||
      dateFrom ||
      dateTo ||
      periodPreset !== "MONTH",
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedMethod("ALL");
    setPeriodPreset("MONTH");
    setDateFrom(null);
    setDateTo(null);
  };

  return (
    <div className="space-y-6 w-full">
      <PaymentActionBar
        periodPreset={periodPreset}
        hasDateRange={Boolean(dateFrom || dateTo)}
        onSelectPeriod={(preset) => {
          setPeriodPreset(preset);
          setDateFrom(null);
          setDateTo(null);
        }}
        filteredCount={filteredPayments.length}
        grandTotal={filteredSummary.grandTotal}
        onExportCsv={() => exportPaymentsCsv(filteredPayments)}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        members={members}
        plans={plans}
        trainers={trainers}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <PaymentStatsGrid metrics={financialMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 glass-card p-6 border-border rounded-3xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Evolución de Recaudación
              </h2>
              <p className="text-xs text-muted-foreground">
                Tendencia de ingresos según los filtros activos
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 text-xs font-mono font-bold px-3 py-1 self-start sm:self-auto"
            >
              Total: {formatCurrency(filteredSummary.grandTotal)}
            </Badge>
          </div>
          <RevenueTrendChart payments={filteredPayments} />
        </div>

        <PaymentChannelBreakdown
          totals={filteredSummary.totals}
          grandTotal={filteredSummary.grandTotal}
        />
      </div>

      <div className="space-y-4">
        <PaymentFilterBar
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateRangeChange={({ from, to }) => {
            setDateFrom(from);
            setDateTo(to);
          }}
          selectedMethod={selectedMethod}
          onMethodChange={setSelectedMethod}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />

        <div className="glass-card border-border rounded-3xl overflow-x-auto backdrop-blur-md">
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
