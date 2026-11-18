import React from "react";
import { getRecentPaymentsAction, getFinancialStatsAction } from "@/lib/actions/payments-actions";
import { getMembersAction } from "@/lib/actions/members-actions";
import { getPlansAction } from "@/lib/actions/plans-actions";
import { getTrainersAction } from "@/lib/actions/trainers-actions";
import { Wallet } from "lucide-react";
import { PaymentsClient } from "./PaymentsClient";
import { getConfigMap } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaymentsPage() {
  const [paymentsRes, statsRes, membersRes, plansRes, trainersRes, configMap] = await Promise.all([
    getRecentPaymentsAction(),
    getFinancialStatsAction(),
    getMembersAction(),
    getPlansAction(),
    getTrainersAction(),
    getConfigMap(["RECEIPT_FORMAT"])
  ]);

  const payments = paymentsRes.success ? (paymentsRes.data as any[]) : [];
  const chartData = statsRes.success ? (statsRes.data as any[]) : [];
  const members = membersRes.success ? (membersRes.data as any[]) : [];
  const plans = plansRes.success ? (plansRes.data as any[]) : [];
  const trainers = trainersRes.success ? (trainersRes.data as any[]) : [];
  const defaultReceiptFormat = configMap["RECEIPT_FORMAT"] || "A4";

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Editorial */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Wallet className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Gestión de Tesorería</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight text-foreground">Pagos & Facturas</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Controlando la <span className="text-foreground font-medium">salud financiera</span> de GymOS con transparencia, trazabilidad y emisión inmediata de comprobantes.
        </p>
      </div>

      {/* Main Client Component */}
      <PaymentsClient 
        payments={payments} 
        chartData={chartData} 
        members={members}
        plans={plans}
        trainers={trainers}
        defaultReceiptFormat={defaultReceiptFormat}
      />
    </div>
  );
}
