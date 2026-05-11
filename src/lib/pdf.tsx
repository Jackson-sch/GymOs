import React from "react";
import { renderToBuffer, Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { theme } from "./pdfx-theme";
import { getConfig } from "./config";

export interface PDFPaymentData {
  invoiceNumber: string;
  memberName: string;
  planName: string;
  amount: number;
  method: string;
  paidAt: Date;
}

// Use theme tokens directly — no hooks, no context.
// react-pdf's reconciler does not support React hooks (useContext, useMemo, etc).
const t = theme;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: t.colors.background,
    fontFamily: t.typography.body.fontFamily,
    fontSize: t.typography.body.fontSize,
    lineHeight: t.typography.body.lineHeight,
    color: t.colors.foreground,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gymInfo: {
    flex: 1,
  },
  invoiceDetails: {
    textAlign: "right",
  },
  gymName: {
    fontFamily: t.typography.heading.fontFamily,
    fontSize: t.typography.heading.fontSize.h2,
    fontWeight: t.primitives.fontWeights.bold,
    lineHeight: t.typography.heading.lineHeight,
    color: t.colors.primary,
    marginBottom: 4,
  },
  subtextXs: {
    fontSize: t.primitives.typography.xs,
    color: t.colors.mutedForeground,
  },
  receiptTitle: {
    fontWeight: t.primitives.fontWeights.bold,
    fontSize: t.primitives.typography.lg,
  },
  invoiceNumber: {
    fontSize: t.primitives.typography.sm,
    color: t.colors.mutedForeground,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: t.colors.border,
    borderStyle: "solid",
    borderRadius: t.primitives.borderRadius.sm,
    backgroundColor: t.colors.background,
    padding: t.primitives.spacing[4],
    marginTop: 20,
  },
  cardTitle: {
    fontFamily: t.typography.heading.fontFamily,
    fontSize: t.primitives.typography.base,
    fontWeight: t.primitives.fontWeights.semibold,
    color: t.colors.foreground,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: t.primitives.fontWeights.semibold,
  },
  uppercase: {
    textTransform: "uppercase",
  },
  totalCard: {
    borderWidth: 1,
    borderColor: t.colors.border,
    borderStyle: "solid",
    borderRadius: t.primitives.borderRadius.sm,
    backgroundColor: t.colors.muted,
    padding: t.primitives.spacing[3],
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontWeight: t.primitives.fontWeights.bold,
  },
  totalAmount: {
    fontWeight: t.primitives.fontWeights.bold,
    fontSize: t.primitives.typography.lg,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    paddingTop: 20,
    textAlign: "center",
  },
  signatureLine: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
    marginTop: 40,
    alignSelf: "flex-start",
  },
  footerText: {
    fontSize: t.primitives.typography.xs,
    color: t.colors.mutedForeground,
  },
});

const InvoiceDocument = ({ 
  payment, 
  gymName, 
  gymAddress, 
  gymRuc 
}: { 
  payment: PDFPaymentData; 
  gymName: string; 
  gymAddress: string; 
  gymRuc: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.gymInfo}>
          <Text style={styles.gymName}>{gymName}</Text>
          <Text style={styles.subtextXs}>{gymAddress}</Text>
          <Text style={styles.subtextXs}>RUC: {gymRuc}</Text>
        </View>
        <View style={styles.invoiceDetails}>
          <Text style={styles.receiptTitle}>RECIBO DE PAGO</Text>
          <Text style={styles.invoiceNumber}>#{payment.invoiceNumber}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalles de la Transacción</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Cliente:</Text>
          <Text>{payment.memberName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Plan / Concepto:</Text>
          <Text>{payment.planName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Método de Pago:</Text>
          <Text style={styles.uppercase}>{payment.method}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text>{payment.paidAt.toLocaleDateString("es-PE")}</Text>
        </View>
      </View>

      {/* Amount Section */}
      <View style={{ marginTop: 20, alignItems: "flex-end" }}>
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalAmount}>S/. {payment.amount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.signatureLine} />
        <Text style={styles.footerText}>Firma Autorizada</Text>
        <Text style={[styles.footerText, { marginTop: 20 }]}>
          Gracias por su preferencia. Este documento es un comprobante de pago electrónico.
        </Text>
      </View>
    </Page>
  </Document>
);

export async function generateInvoicePDF(payment: PDFPaymentData): Promise<Buffer> {
  const gymName = (await getConfig("GYM_NAME")) || "GymOS Elite";
  const gymAddress = (await getConfig("GYM_ADDRESS")) || "Av. Principal 123, Lima";
  const gymRuc = (await getConfig("GYM_RUC")) || "20123456789";

  const buffer = await renderToBuffer(
    <InvoiceDocument 
      payment={payment} 
      gymName={gymName} 
      gymAddress={gymAddress} 
      gymRuc={gymRuc} 
    />
  );

  return Buffer.from(buffer);
}
