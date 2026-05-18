"use client";

import React from "react";
import { Page, Text, View, Document, StyleSheet, Font, Image } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Font registration if needed
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottom: 2,
    borderBottomColor: "#111111",
    paddingBottom: 20,
  },
  logoSection: {
    flexDirection: "column",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#666666",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  receiptInfo: {
    textAlign: "right",
  },
  receiptNumber: {
    fontSize: 12,
    fontWeight: "bold",
  },
  date: {
    fontSize: 9,
    color: "#666666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    backgroundColor: "#f4f4f4",
    padding: 6,
    marginBottom: 10,
    marginTop: 20,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoBlock: {
    flexDirection: "column",
    width: "48%",
  },
  label: {
    fontSize: 8,
    color: "#999999",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottom: 0.5,
    borderBottomColor: "#f9f9f9",
  },
  col1: { width: "15%", fontSize: 9 },
  col2: { width: "65%", fontSize: 9 },
  col3: { width: "20%", fontSize: 9, textAlign: "right" },
  
  summarySection: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: "#eeeeee",
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
    width: "250pt",
  },
  summaryLabel: {
    fontSize: 10,
    width: "150pt",
    textAlign: "right",
    marginRight: 20,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 10,
    width: "80pt",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: "#111111",
    width: "250pt",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    width: "150pt",
    textAlign: "right",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    width: "80pt",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTop: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 8,
    color: "#999999",
    lineHeight: 1.5,
  }
});

interface PayrollReceiptPDFProps {
  trainer: any;
  payrollData: any;
  periodStart: Date;
  periodEnd: Date;
}

export function PayrollReceiptPDF({ trainer, payrollData, periodStart, periodEnd }: PayrollReceiptPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.title}>GYMOS</Text>
            <Text style={styles.subtitle}>Premium Fitness Management</Text>
          </View>
          <View style={styles.receiptInfo}>
            <Text style={styles.receiptNumber}>RECIBO DE HONORARIOS</Text>
            <Text style={styles.date}>Fecha: {format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Beneficiario</Text>
            <Text style={styles.value}>{trainer.fullName}</Text>
            <Text style={[styles.value, { fontWeight: 'normal', fontSize: 9, marginTop: 2 }]}>{trainer.email}</Text>
            <Text style={[styles.value, { fontWeight: 'normal', fontSize: 9 }]}>DNI: {trainer.dni}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Periodo de Liquidación</Text>
            <Text style={styles.value}>
              {format(periodStart, "dd/MM/yyyy")} - {format(periodEnd, "dd/MM/yyyy")}
            </Text>
          </View>
        </View>

        {/* Detail: Classes */}
        <Text style={styles.sectionTitle}>Resumen de Sesiones Dictadas</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Fecha</Text>
            <Text style={styles.col2}>Descripción de Clase / Ubicación</Text>
            <Text style={styles.col3}>Monto</Text>
          </View>
          {payrollData.classes.map((c: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{format(new Date(c.startTime), "dd/MM")}</Text>
              <Text style={styles.col2}>{c.name} - {c.location || "Sala Principal"}</Text>
              <Text style={styles.col3}>S/. {payrollData.perClassRate.toFixed(2)}</Text>
            </View>
          ))}
          {payrollData.classes.length === 0 && (
            <Text style={{ fontSize: 9, color: '#999', marginTop: 10, textAlign: 'center' }}>No hay clases registradas en este periodo</Text>
          )}
        </View>

        {/* Detail: Sales */}
        <Text style={styles.sectionTitle}>Comisiones por Ventas (Referidos)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Fecha</Text>
            <Text style={styles.col2}>Socio / Plan Adquirido</Text>
            <Text style={styles.col3}>Comisión</Text>
          </View>
          {payrollData.referrals.map((r: any, index: number) => {
            const commission = (Number(r.price) * (payrollData.commissionPct / 100));
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{format(new Date(r.createdAt), "dd/MM")}</Text>
                <Text style={styles.col2}>{r.member.fullName} - {r.plan.name} (S/. {Number(r.price).toFixed(2)})</Text>
                <Text style={styles.col3}>S/. {commission.toFixed(2)}</Text>
              </View>
            );
          })}
          {payrollData.referrals.length === 0 && (
            <Text style={{ fontSize: 9, color: '#999', marginTop: 10, textAlign: 'center' }}>No hay ventas registradas en este periodo</Text>
          )}
        </View>

        {/* Totals Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Salario Base:</Text>
            <Text style={styles.summaryValue}>S/. {payrollData.baseAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total por Clases ({payrollData.classesCount}):</Text>
            <Text style={styles.summaryValue}>S/. {payrollData.perClassTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Comisiones por Ventas ({payrollData.salesCount}):</Text>
            <Text style={styles.summaryValue}>S/. {payrollData.commissionsTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL NETO A PAGAR:</Text>
            <Text style={styles.totalValue}>S/. {payrollData.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este documento es un resumen informativo de la liquidación de honorarios correspondiente al periodo indicado.
          </Text>
          <Text style={[styles.footerText, { marginTop: 4, fontWeight: 'bold' }]}>
            GymOS Platform &bull; {new Date().getFullYear()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
