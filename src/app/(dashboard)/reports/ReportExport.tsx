"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportPDF } from "./ReportPDF";
import { Button } from "@/components/ui/button";
import { FileChartColumn } from "lucide-react";

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
  fileNameDate
}: ReportExportProps) {
  return (
    <PDFDownloadLink
      document={
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
        />
      }
      fileName={`reporte-gymos-${fileNameDate}.pdf`}
    >
      {({ loading }) => (
        <Button 
          variant="outline" 
          disabled={loading}
          className="glass-card bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest transition-all"
        >
          <FileChartColumn className="mr-2 size-3" />
          {loading ? "Generando…" : "PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
