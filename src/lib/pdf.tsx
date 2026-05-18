import React from "react";
import { renderToBuffer, Document, Page, View, Text, StyleSheet, Svg, Rect, Circle } from "@react-pdf/renderer";
import { getConfig, getConfigMap } from "./config";
import { formatCurrency, formatPaymentMethod } from "./formats";

export interface PDFPaymentData {
  invoiceNumber: string;
  memberName: string;
  planName: string;
  amount: number;
  method: string;
  paidAt: Date;
}

// ─── Design Tokens ──────────────────────────────────────────────────
// Premium receipt palette — emerald-tinted dark neutrals on white
const colors = {
  // Brand
  emerald: "#10B981",
  emeraldDark: "#059669",
  emeraldLight: "#D1FAE5",
  emeraldMuted: "#ECFDF5",
  // Neutrals
  black: "#0F172A",
  charcoal: "#1E293B",
  slate: "#334155",
  gray: "#64748B",
  grayLight: "#94A3B8",
  grayMuted: "#CBD5E1",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  white: "#FFFFFF",
  surface: "#F8FAFC",
};

const fonts = {
  heading: "Helvetica-Bold",
  body: "Helvetica",
  mono: "Courier",
};

// ─── Stylesheet ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.charcoal,
    lineHeight: 1.5,
    paddingBottom: 100, // space for absolute footer
  },

  // ── Top Accent Bar ──────────────────────────────────────────────
  accentBar: {
    height: 6,
    backgroundColor: colors.emerald,
  },

  // ── Header ──────────────────────────────────────────────────────
  headerContainer: {
    paddingHorizontal: 48,
    paddingTop: 32,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  brandTextBlock: {},
  brandName: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.black,
    letterSpacing: -0.5,
  },
  brandSlogan: {
    fontSize: 8,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 2,
  },
  receiptBadge: {
    backgroundColor: colors.emeraldMuted,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  receiptBadgeLabel: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.emeraldDark,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  receiptBadgeNumber: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.gray,
    marginTop: 2,
  },

  // ── Divider ─────────────────────────────────────────────────────
  divider: {
    marginHorizontal: 48,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerThick: {
    marginHorizontal: 48,
    height: 2,
    backgroundColor: colors.emerald,
    opacity: 0.3,
  },

  // ── Meta Row (date / invoice / method) ──────────────────────────
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 48,
    paddingVertical: 18,
  },
  metaItem: {
    flex: 1,
  },
  metaItemCenter: {
    flex: 1,
    alignItems: "center",
  },
  metaItemRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  metaLabel: {
    fontSize: 7.5,
    color: colors.grayLight,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: fonts.heading,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    color: colors.charcoal,
    fontFamily: fonts.heading,
  },

  // ── Client & Plan Section ───────────────────────────────────────
  billSection: {
    flexDirection: "row",
    paddingHorizontal: 48,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 40,
  },
  billBlock: {
    flex: 1,
  },
  billBlockLabel: {
    fontSize: 7.5,
    color: colors.grayLight,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: fonts.heading,
    marginBottom: 8,
  },
  billBlockValue: {
    fontSize: 12,
    color: colors.black,
    fontFamily: fonts.heading,
  },
  billBlockSub: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 3,
  },

  // ── Line Items Table ────────────────────────────────────────────
  tableContainer: {
    marginHorizontal: 48,
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.charcoal,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 7.5,
    color: colors.grayMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: fonts.heading,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableColDesc: { flex: 3 },
  tableColQty: { flex: 1, alignItems: "center" as const },
  tableColPrice: { flex: 1.5, alignItems: "flex-end" as const },
  tableColTotal: { flex: 1.5, alignItems: "flex-end" as const },
  tableCellText: {
    fontSize: 10,
    color: colors.charcoal,
  },
  tableCellTextBold: {
    fontSize: 10,
    color: colors.black,
    fontFamily: fonts.heading,
  },

  // ── Totals Section ──────────────────────────────────────────────
  totalsContainer: {
    marginHorizontal: 48,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsBox: {
    width: 240,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  totalsLabel: {
    fontSize: 9,
    color: colors.gray,
  },
  totalsValue: {
    fontSize: 9,
    color: colors.charcoal,
    fontFamily: fonts.heading,
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.emeraldMuted,
    borderRadius: 4,
    marginTop: 4,
  },
  totalsFinalLabel: {
    fontSize: 12,
    color: colors.emeraldDark,
    fontFamily: fonts.heading,
    letterSpacing: 0.5,
  },
  totalsFinalValue: {
    fontSize: 16,
    color: colors.emeraldDark,
    fontFamily: fonts.heading,
  },

  // ── Notes Section ───────────────────────────────────────────────
  notesSection: {
    marginHorizontal: 48,
    marginTop: 28,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  notesTitle: {
    fontSize: 8,
    color: colors.grayLight,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: fonts.heading,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.6,
  },

  // ── Signature Area ──────────────────────────────────────────────
  signatureArea: {
    marginHorizontal: 48,
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: 180,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.grayMuted,
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 8,
    color: colors.grayLight,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: colors.charcoal,
  },
  footerLeft: {},
  footerCenter: {
    alignItems: "center",
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: 7.5,
    color: colors.grayLight,
  },
  footerTextBold: {
    fontSize: 7.5,
    color: colors.grayMuted,
    fontFamily: fonts.heading,
  },
  footerAccent: {
    height: 3,
    backgroundColor: colors.emerald,
  },

  // ── Watermark ───────────────────────────────────────────────────
  watermark: {
    position: "absolute",
    top: 350,
    left: 0,
    right: 0,
    alignItems: "center",
    opacity: 0.03,
  },
  watermarkText: {
    fontSize: 80,
    fontFamily: fonts.heading,
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 15,
  },
});

// ─── Helper ─────────────────────────────────────────────────────────
function formatDate(date: Date): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const d = date.getDate().toString().padStart(2, "0");
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} de ${m}, ${y}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}


// ─── Brand Logo (SVG) ───────────────────────────────────────────────
const BrandLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 36 36">
    <Rect x="0" y="0" width="36" height="36" rx="8" fill={colors.emerald} />
    <Circle cx="18" cy="14" r="5" fill={colors.white} opacity="0.9" />
    <Rect x="10" y="22" width="16" height="3" rx="1.5" fill={colors.white} opacity="0.7" />
    <Rect x="13" y="27" width="10" height="2" rx="1" fill={colors.white} opacity="0.5" />
  </Svg>
);

// ─── Document Component ─────────────────────────────────────────────
interface InvoiceProps {
  payment: PDFPaymentData;
  gymName: string;
  gymAddress: string;
  gymRuc: string;
  gymPhone: string;
  gymSlogan: string;
}

const InvoiceDocument = ({
  payment,
  gymName,
  gymAddress,
  gymRuc,
  gymPhone,
  gymSlogan,
}: InvoiceProps) => {
  const now = new Date();

  return (
    <Document
      title={`Recibo ${payment.invoiceNumber}`}
      author={gymName}
      subject="Comprobante de Pago"
    >
      <Page size="A4" style={s.page}>
        {/* ── Watermark ──────────────────────────────── */}
        <View style={s.watermark} fixed>
          <Text style={s.watermarkText}>PAGADO</Text>
        </View>

        {/* ── Top Accent Bar ─────────────────────────── */}
        <View style={s.accentBar} />

        {/* ── Header ─────────────────────────────────── */}
        <View style={s.headerContainer}>
          <View style={s.brandBlock}>
            <BrandLogo />
            <View style={s.brandTextBlock}>
              <Text style={s.brandName}>{gymName}</Text>
              <Text style={s.brandSlogan}>{gymSlogan}</Text>
            </View>
          </View>
          <View style={s.receiptBadge}>
            <Text style={s.receiptBadgeLabel}>Comprobante</Text>
            <Text style={s.receiptBadgeNumber}>#{payment.invoiceNumber}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Meta Row ───────────────────────────────── */}
        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Fecha de Emisión</Text>
            <Text style={s.metaValue}>{formatDate(payment.paidAt)}</Text>
          </View>
          <View style={s.metaItemCenter}>
            <Text style={s.metaLabel}>Hora</Text>
            <Text style={s.metaValue}>{formatTime(payment.paidAt)}</Text>
          </View>
          <View style={s.metaItemRight}>
            <Text style={s.metaLabel}>Método de Pago</Text>
            <Text style={s.metaValue}>{formatPaymentMethod(payment.method)}</Text>
          </View>
        </View>

        <View style={s.dividerThick} />

        {/* ── Bill To / Plan ─────────────────────────── */}
        <View style={s.billSection}>
          <View style={s.billBlock}>
            <Text style={s.billBlockLabel}>Cliente</Text>
            <Text style={s.billBlockValue}>{payment.memberName}</Text>
            <Text style={s.billBlockSub}>Socio registrado</Text>
          </View>
          <View style={s.billBlock}>
            <Text style={s.billBlockLabel}>Emitido por</Text>
            <Text style={s.billBlockValue}>{gymName}</Text>
            <Text style={s.billBlockSub}>{gymAddress}</Text>
            <Text style={s.billBlockSub}>RUC: {gymRuc}</Text>
          </View>
        </View>

        {/* ── Line Items ─────────────────────────────── */}
        <View style={s.tableContainer}>
          <View style={s.tableHeader}>
            <View style={s.tableColDesc}>
              <Text style={s.tableHeaderText}>Descripción</Text>
            </View>
            <View style={s.tableColQty}>
              <Text style={s.tableHeaderText}>Cant.</Text>
            </View>
            <View style={s.tableColPrice}>
              <Text style={s.tableHeaderText}>P. Unitario</Text>
            </View>
            <View style={s.tableColTotal}>
              <Text style={s.tableHeaderText}>Total</Text>
            </View>
          </View>

          <View style={s.tableRow}>
            <View style={s.tableColDesc}>
              <Text style={s.tableCellTextBold}>{payment.planName}</Text>
              <Text style={[s.tableCellText, { fontSize: 8, color: colors.gray, marginTop: 2 }]}>
                Membresía / Servicio
              </Text>
            </View>
            <View style={s.tableColQty}>
              <Text style={s.tableCellText}>1</Text>
            </View>
            <View style={s.tableColPrice}>
              <Text style={s.tableCellText}>S/. {payment.amount.toFixed(2)}</Text>
            </View>
            <View style={s.tableColTotal}>
              <Text style={s.tableCellTextBold}>S/. {payment.amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* ── Totals ─────────────────────────────────── */}
        <View style={s.totalsContainer}>
          <View style={s.totalsBox}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Subtotal</Text>
              <Text style={s.totalsValue}>S/. {payment.amount.toFixed(2)}</Text>
            </View>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>IGV (0%)</Text>
              <Text style={s.totalsValue}>S/. 0.00</Text>
            </View>
            <View style={s.totalsFinalRow}>
              <Text style={s.totalsFinalLabel}>TOTAL</Text>
              <Text style={s.totalsFinalValue}>S/. {payment.amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* ── Notes ──────────────────────────────────── */}
        <View style={s.notesSection}>
          <Text style={s.notesTitle}>Observaciones</Text>
          <Text style={s.notesText}>
            Este comprobante electrónico acredita el pago registrado en el sistema GymOS.{"\n"}
            Conserve este documento como respaldo de su transacción.
          </Text>
        </View>

        {/* ── Signatures ─────────────────────────────── */}
        <View style={s.signatureArea}>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>Firma Autorizada</Text>
          </View>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>Firma del Cliente</Text>
          </View>
        </View>

        {/* ── Footer ─────────────────────────────────── */}
        <View style={s.footer} fixed>
          <View style={s.footerContent}>
            <View style={s.footerLeft}>
              <Text style={s.footerTextBold}>{gymName}</Text>
              <Text style={s.footerText}>{gymAddress}</Text>
            </View>
            <View style={s.footerCenter}>
              <Text style={s.footerTextBold}>Contacto</Text>
              <Text style={s.footerText}>{gymPhone || "—"}</Text>
            </View>
            <View style={s.footerRight}>
              <Text style={s.footerText}>Generado el {formatDate(now)}</Text>
              <Text style={s.footerText}>RUC: {gymRuc}</Text>
            </View>
          </View>
          <View style={s.footerAccent} />
        </View>
      </Page>
    </Document>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// TICKET 80mm — Thermal Printer Format
// ═══════════════════════════════════════════════════════════════════════

// 80mm = ~226pt at 72dpi
const TICKET_WIDTH = 226;

const tk = StyleSheet.create({
  page: {
    width: TICKET_WIDTH,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
    fontFamily: fonts.body,
    fontSize: 8,
    color: colors.charcoal,
  },

  // ── Header ────────────────────────────────────────
  accentBar: {
    height: 3,
    backgroundColor: colors.emerald,
    marginBottom: 12,
    marginHorizontal: -12,
  },
  headerCenter: {
    alignItems: "center",
    marginBottom: 8,
  },
  brandName: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.black,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  brandSlogan: {
    fontSize: 6,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 1,
  },
  gymDetail: {
    fontSize: 6.5,
    color: colors.gray,
    textAlign: "center",
    marginTop: 1,
  },

  // ── Dashed separators ─────────────────────────────
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayMuted,
    borderBottomStyle: "dashed",
    marginVertical: 8,
  },
  solidLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 6,
  },

  // ── Receipt title ─────────────────────────────────
  receiptTitle: {
    textAlign: "center",
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.black,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  receiptNumber: {
    textAlign: "center",
    fontFamily: fonts.mono,
    fontSize: 7,
    color: colors.gray,
    marginTop: 2,
  },

  // ── Detail rows ───────────────────────────────────
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 7,
    color: colors.gray,
  },
  detailValue: {
    fontSize: 7.5,
    color: colors.charcoal,
    fontFamily: fonts.heading,
    textAlign: "right",
    maxWidth: 120,
  },

  // ── Item table ────────────────────────────────────
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemHeaderText: {
    fontSize: 6,
    color: colors.grayLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: fonts.heading,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 8,
    color: colors.black,
    fontFamily: fonts.heading,
    flex: 1,
  },
  itemQty: {
    fontSize: 7.5,
    color: colors.charcoal,
    width: 30,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 8,
    color: colors.charcoal,
    fontFamily: fonts.heading,
    width: 60,
    textAlign: "right",
  },

  // ── Totals ────────────────────────────────────────
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  subtotalLabel: {
    fontSize: 7,
    color: colors.gray,
  },
  subtotalValue: {
    fontSize: 7.5,
    color: colors.charcoal,
  },
  totalBox: {
    backgroundColor: colors.emeraldMuted,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.emeraldDark,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.emeraldDark,
  },

  // ── Method badge ──────────────────────────────────
  methodBadge: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  methodBadgeText: {
    fontSize: 7,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: fonts.heading,
    textAlign: "center",
  },

  // ── Footer ────────────────────────────────────────
  footerText: {
    fontSize: 6,
    color: colors.grayLight,
    textAlign: "center",
    marginTop: 2,
  },
  footerBold: {
    fontSize: 6.5,
    color: colors.gray,
    textAlign: "center",
    fontFamily: fonts.heading,
    marginTop: 2,
  },
  thankYou: {
    fontSize: 7.5,
    color: colors.charcoal,
    textAlign: "center",
    fontFamily: fonts.heading,
    marginTop: 8,
  },
  accentBarBottom: {
    height: 3,
    backgroundColor: colors.emerald,
    marginTop: 12,
    marginHorizontal: -12,
  },
});

const TicketDocument = ({
  payment,
  gymName,
  gymAddress,
  gymRuc,
  gymPhone,
  gymSlogan,
}: InvoiceProps) => {
  const shortDate = `${payment.paidAt.getDate().toString().padStart(2, "0")}/${(payment.paidAt.getMonth() + 1).toString().padStart(2, "0")}/${payment.paidAt.getFullYear()}`;
  const shortTime = payment.paidAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <Document title={`Ticket ${payment.invoiceNumber}`} author={gymName}>
      <Page size={{ width: TICKET_WIDTH, height: "auto" }} style={tk.page}>
        {/* ── Top accent ─────────────────────────── */}
        <View style={tk.accentBar} />

        {/* ── Brand header ───────────────────────── */}
        <View style={tk.headerCenter}>
          <Text style={tk.brandName}>{gymName}</Text>
          <Text style={tk.brandSlogan}>{gymSlogan}</Text>
          <Text style={tk.gymDetail}>{gymAddress}</Text>
          {gymPhone ? <Text style={tk.gymDetail}>Tel: {gymPhone}</Text> : null}
          <Text style={tk.gymDetail}>RUC: {gymRuc}</Text>
        </View>

        <View style={tk.dashedLine} />

        {/* ── Receipt title ──────────────────────── */}
        <Text style={tk.receiptTitle}>Comprobante de Pago</Text>
        <Text style={tk.receiptNumber}>#{payment.invoiceNumber}</Text>

        <View style={tk.dashedLine} />

        {/* ── Details ────────────────────────────── */}
        <View style={tk.detailRow}>
          <Text style={tk.detailLabel}>Fecha:</Text>
          <Text style={tk.detailValue}>{shortDate}  {shortTime}</Text>
        </View>
        <View style={tk.detailRow}>
          <Text style={tk.detailLabel}>Cliente:</Text>
          <Text style={tk.detailValue}>{payment.memberName}</Text>
        </View>

        <View style={tk.solidLine} />

        {/* ── Item line ──────────────────────────── */}
        <View style={tk.itemHeader}>
          <Text style={[tk.itemHeaderText, { flex: 1 }]}>Descripción</Text>
          <Text style={[tk.itemHeaderText, { width: 30, textAlign: "center" }]}>Cant</Text>
          <Text style={[tk.itemHeaderText, { width: 60, textAlign: "right" }]}>Importe</Text>
        </View>
        <View style={tk.itemRow}>
          <Text style={tk.itemName}>{payment.planName}</Text>
          <Text style={tk.itemQty}>1</Text>
          <Text style={tk.itemPrice}>S/. {payment.amount.toFixed(2)}</Text>
        </View>

        <View style={tk.dashedLine} />

        {/* ── Totals ─────────────────────────────── */}
        <View style={tk.subtotalRow}>
          <Text style={tk.subtotalLabel}>Subtotal</Text>
          <Text style={tk.subtotalValue}>S/. {payment.amount.toFixed(2)}</Text>
        </View>
        <View style={tk.subtotalRow}>
          <Text style={tk.subtotalLabel}>IGV (0%)</Text>
          <Text style={tk.subtotalValue}>S/. 0.00</Text>
        </View>

        <View style={tk.totalBox}>
          <Text style={tk.totalLabel}>TOTAL</Text>
          <Text style={tk.totalValue}>S/. {payment.amount.toFixed(2)}</Text>
        </View>

        {/* ── Method badge ────────────────────────── */}
        <View style={tk.methodBadge}>
          <Text style={tk.methodBadgeText}>MÉTODO: {formatPaymentMethod(payment.method)}</Text>
        </View>

        <View style={tk.dashedLine} />

        {/* ── Footer ─────────────────────────────── */}
        <Text style={tk.thankYou}>¡Gracias por su preferencia!</Text>
        <Text style={tk.footerText}>
          Comprobante electrónico generado por GymOS
        </Text>
        <Text style={tk.footerBold}>{gymName}</Text>

        <View style={tk.accentBarBottom} />
      </Page>
    </Document>
  );
};

// ─── PDF Generators ─────────────────────────────────────────────────

async function getGymConfig() {
  const config = await getConfigMap([
    "GYM_NAME",
    "GYM_ADDRESS",
    "GYM_RUC",
    "GYM_PHONE",
    "GYM_SLOGAN",
    "RECEIPT_FORMAT",
  ]);
  return {
    gymName: config["GYM_NAME"] || "GymOS Elite",
    gymAddress: config["GYM_ADDRESS"] || "Av. Principal 123, Lima",
    gymRuc: config["GYM_RUC"] || "20123456789",
    gymPhone: config["GYM_PHONE"] || "",
    gymSlogan: config["GYM_SLOGAN"] || "Elite Fitness Management",
    receiptFormat: config["RECEIPT_FORMAT"] || "A4",
  };
}

/** Get system default receipt format (A4 or TICKET) */
export async function getDefaultReceiptFormat(): Promise<string> {
  const config = await getConfigMap(["RECEIPT_FORMAT"]);
  return config["RECEIPT_FORMAT"] || "A4";
}

/** Full A4 invoice receipt */
export async function generateInvoicePDF(payment: PDFPaymentData): Promise<Buffer> {
  const cfg = await getGymConfig();
  const buffer = await renderToBuffer(
    <InvoiceDocument payment={payment} {...cfg} />
  );
  return Buffer.from(buffer);
}

/** 80mm thermal ticket receipt */
export async function generateTicketPDF(payment: PDFPaymentData): Promise<Buffer> {
  const cfg = await getGymConfig();
  const buffer = await renderToBuffer(
    <TicketDocument payment={payment} {...cfg} />
  );
  return Buffer.from(buffer);
}
