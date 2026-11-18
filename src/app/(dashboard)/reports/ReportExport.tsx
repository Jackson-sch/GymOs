"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileChartColumn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReportPDF } from "./_ReportPDFDocument";

interface ReportExportProps {
  kpis: any;
  revenueByMonth: any[];
  attendanceByDay: any[];
  membershipsByPlan: any[];
  membersByStatus: any[];
  topMembers: any[];
  startDate?: Date;
  endDate?: Date;
  generatedDate: string;
  fileNameDate: string;
}

export default function ReportExport({
  kpis,
  revenueByMonth,
  attendanceByDay,
  membershipsByPlan,
  membersByStatus,
  topMembers,
  startDate,
  endDate,
  generatedDate,
  fileNameDate,
}: ReportExportProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <ReportPDF
          kpis={kpis}
          revenueByMonth={revenueByMonth}
          attendanceByDay={attendanceByDay}
          membershipsByPlan={membershipsByPlan}
          membersByStatus={membersByStatus}
          topMembers={topMembers}
          startDate={startDate}
          endDate={endDate}
          generatedDate={generatedDate}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-gymos-${fileNameDate || "actual"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al generar el PDF del reporte:", err);
      toast.error("No se pudo generar el PDF del reporte");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={generating}
      onClick={handleDownloadPdf}
      className="glass-card bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest transition-colors"
    >
      {generating ? (
        <Loader2 className="mr-2 size-3.5 animate-spin" />
      ) : (
        <FileChartColumn className="mr-2 size-3.5" />
      )}
      {generating ? "Generando…" : "PDF"}
    </Button>
  );
}
