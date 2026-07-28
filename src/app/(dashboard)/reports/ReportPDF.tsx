"use client";

import dynamic from "next/dynamic";

export const ReportPDF = dynamic(
  () => import("./_ReportPDFDocument").then((mod) => mod.ReportPDF),
  { ssr: false }
);
