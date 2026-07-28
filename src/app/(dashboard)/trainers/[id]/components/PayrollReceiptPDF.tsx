"use client";

import dynamic from "next/dynamic";

export const PayrollReceiptPDF = dynamic(
  () => import("./_PayrollReceiptPDFDocument").then((mod) => mod.PayrollReceiptPDF),
  { ssr: false }
);
