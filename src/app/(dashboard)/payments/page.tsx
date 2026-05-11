import React from "react";
import { getRecentPaymentsAction, getFinancialStatsAction } from "@/lib/actions/payments-actions";
import { getMembersAction } from "@/lib/actions/members-actions";
import { getPlansAction } from "@/lib/actions/plans-actions";
import { Wallet } from "lucide-react";
import { PaymentsClient } from "./PaymentsClient";
import { getConfigMap } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaymentsPage() {
  const [paymentsRes, statsRes, membersRes, plansRes, configMap] = await Promise.all([
    getRecentPaymentsAction(),
    getFinancialStatsAction(),
    getMembersAction(),
    getPlansAction(),
    getConfigMap(["RECEIPT_FORMAT"])
  ]);

  const payments = paymentsRes.success ? (paymentsRes.data as any[]) : [];
  const chartData = statsRes.success ? (statsRes.data as any[]) : [];
  const members = membersRes.success ? (membersRes.data as any[]) : [];
  const plans = plansRes.success ? (plansRes.data as any[]) : [];
  const defaultReceiptFormat = configMap["RECEIPT_FORMAT"] || "A4";

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Gestión de Tesorería</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Pagos & Facturas</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Controlando la <span className="text-foreground font-medium">salud financiera</span> de GymOS con transparencia y rigor.
          </p>
        </div>
      </div>

      {/* Main Client Component */}
      <PaymentsClient 
        payments={payments} 
        chartData={chartData} 
        members={members}
        plans={plans}
        defaultReceiptFormat={defaultReceiptFormat}
      />
    </div>
  );
}
