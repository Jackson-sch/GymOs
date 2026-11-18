import React from "react";
import {
  renderToBuffer,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Rect,
  Circle,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import { getConfigMap } from "./config";
import { formatPaymentMethod } from "./formats";

export interface PDFPaymentData {
  invoiceNumber: string;
  memberName: string;
  memberDni?: string;
  memberEmail?: string;
  memberPhone?: string;
  planName: string;
  durationDays?: number;
  membershipStart?: Date;
  membershipEnd?: Date;
  reference?: string;
  status?: string;
  amount: number;
  method: string;
  paidAt: Date;
}

// ─── Design Tokens ──────────────────────────────────────────────────
const colors = {
  emerald: "#10B981",
  emeraldDark: "#047857",
  emeraldLight: "#D1FAE5",
  emeraldMuted: "#ECFDF5",
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

// ─── Helpers ────────────────────────────────────────────────────────
function formatDateLong(date: Date): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const d = date.getDate().toString().padStart(2, "0");
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} de ${m}, ${y}`;
}

function formatShortDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function numberToWordsEs(num: number): string {
  const units = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const teens = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const tens = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const hundreds = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  const convertGroup = (n: number): string => {
    if (n === 0) return "";
    if (n === 100) return "CIEN";
    let out = "";
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) out += hundreds[h] + (rem > 0 ? " " : "");
    if (rem >= 10 && rem <= 19) {
      out += teens[rem - 10];
    } else if (rem >= 21 && rem <= 29) {
      out += "VEINTI" + units[rem - 20];
    } else {
      const t = Math.floor(rem / 10);
      const u = rem % 10;
      if (t > 0) out += tens[t] + (u > 0 ? " Y " : "");
      if (u > 0) out += units[u];
    }
    return out;
  };

  const integerPart = Math.floor(Math.max(0, num));
  const cents = Math.round((Math.max(0, num) - integerPart) * 100)
    .toString()
    .padStart(2, "0");

  if (integerPart === 0) return `SON: CERO CON ${cents}/100 SOLES`;

  const thousands = Math.floor(integerPart / 1000);
  const rest = integerPart % 1000;
  let words = "";
  if (thousands === 1) {
    words += "MIL" + (rest > 0 ? " " : "");
  } else if (thousands > 1) {
    words += convertGroup(thousands) + " MIL" + (rest > 0 ? " " : "");
  }
  if (rest > 0) words += convertGroup(rest);

  return `SON: ${words.trim()} CON ${cents}/100 SOLES`;
}

// ─── Stylesheet (A4) ────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: fonts.body,
    fontSize: 9.5,
    color: colors.charcoal,
    lineHeight: 1.45,
    paddingBottom: 92,
  },
  accentBar: {
    height: 6,
    backgroundColor: colors.emerald,
  },
  headerContainer: {
    paddingHorizontal: 44,
    paddingTop: 26,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    maxWidth: 310,
  },
  brandLogoImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    objectFit: "cover",
  },
  brandName: {
    fontFamily: fonts.heading,
    fontSize: 19,
    color: colors.black,
    letterSpacing: -0.4,
  },
  brandSlogan: {
    fontSize: 7.5,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    marginTop: 2,
  },
  receiptBox: {
    borderWidth: 1.5,
    borderColor: colors.emerald,
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 170,
  },
  receiptBoxRuc: {
    fontSize: 7.5,
    color: colors.gray,
    fontFamily: fonts.heading,
    letterSpacing: 0.8,
  },
  receiptBoxTitle: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.emeraldDark,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 3,
  },
  receiptBoxNum: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: "bold",
    color: colors.black,
    marginTop: 3,
  },
  statusPill: {
    marginTop: 5,
    backgroundColor: colors.emeraldMuted,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusPillText: {
    fontSize: 7,
    fontFamily: fonts.heading,
    color: colors.emeraldDark,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // ── Metadata Strip ───────────────────────────────────────────────
  metaStrip: {
    marginHorizontal: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  metaCell: {
    flex: 1,
    paddingRight: 8,
  },
  metaCellBorder: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  metaLabel: {
    fontSize: 7,
    color: colors.grayLight,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: fonts.heading,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9.5,
    color: colors.black,
    fontFamily: fonts.heading,
  },

  // ── Two-Column Parties ───────────────────────────────────────────
  partiesRow: {
    flexDirection: "row",
    marginHorizontal: 44,
    marginTop: 16,
    gap: 14,
  },
  partyCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
  },
  partyLabel: {
    fontSize: 7,
    color: colors.emeraldDark,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontFamily: fonts.heading,
    marginBottom: 6,
  },
  partyName: {
    fontSize: 11,
    color: colors.black,
    fontFamily: fonts.heading,
    marginBottom: 3,
  },
  partyDetail: {
    fontSize: 8.5,
    color: colors.gray,
    marginTop: 1.5,
  },

  // ── Table ────────────────────────────────────────────────────────
  tableContainer: {
    marginHorizontal: 44,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.charcoal,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  tableHeaderText: {
    fontSize: 7.5,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontFamily: fonts.heading,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  tableColDesc: { flex: 3.4, paddingRight: 8 },
  tableColQty: { flex: 0.8, alignItems: "center" as const },
  tableColPrice: { flex: 1.3, alignItems: "flex-end" as const },
  tableColTotal: { flex: 1.3, alignItems: "flex-end" as const },
  tableCellBold: {
    fontSize: 10,
    color: colors.black,
    fontFamily: fonts.heading,
  },
  tableCellSub: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 3,
  },
  tableCellText: {
    fontSize: 9.5,
    color: colors.charcoal,
  },

  // ── Bottom Split: QR + Words | Totals ────────────────────────────
  bottomSplit: {
    marginHorizontal: 44,
    marginTop: 18,
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-start",
  },
  leftVerification: {
    flex: 1.25,
    gap: 10,
  },
  wordsBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  wordsText: {
    fontSize: 8,
    fontFamily: fonts.heading,
    color: colors.charcoal,
    letterSpacing: 0.4,
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  qrImage: {
    width: 62,
    height: 62,
  },
  qrInfo: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 8,
    fontFamily: fonts.heading,
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  qrSub: {
    fontSize: 7.5,
    color: colors.gray,
    marginTop: 2,
    lineHeight: 1.35,
  },
  totalsBox: {
    flex: 0.95,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  totalsLabel: {
    fontSize: 8.5,
    color: colors.gray,
  },
  totalsValue: {
    fontSize: 8.5,
    color: colors.charcoal,
    fontFamily: fonts.heading,
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: colors.emeraldMuted,
  },
  totalsFinalLabel: {
    fontSize: 10,
    color: colors.emeraldDark,
    fontFamily: fonts.heading,
    letterSpacing: 0.6,
  },
  totalsFinalValue: {
    fontSize: 14,
    color: colors.emeraldDark,
    fontFamily: fonts.heading,
  },

  // ── Notes & Signatures ───────────────────────────────────────────
  notesSection: {
    marginHorizontal: 44,
    marginTop: 18,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  notesTitle: {
    fontSize: 7.5,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: fonts.heading,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8.5,
    color: colors.gray,
    lineHeight: 1.45,
  },
  signatureArea: {
    marginHorizontal: 44,
    marginTop: 34,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: 175,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.grayMuted,
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 7.5,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Footer ───────────────────────────────────────────────────────
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
    paddingHorizontal: 44,
    paddingVertical: 14,
    backgroundColor: colors.charcoal,
  },
  footerText: {
    fontSize: 7.5,
    color: colors.grayLight,
  },
  footerTextBold: {
    fontSize: 7.5,
    color: colors.white,
    fontFamily: fonts.heading,
  },
  footerAccent: {
    height: 3,
    backgroundColor: colors.emerald,
  },
  watermark: {
    position: "absolute",
    top: 340,
    left: 0,
    right: 0,
    alignItems: "center",
    opacity: 0.028,
  },
  watermarkText: {
    fontSize: 78,
    fontFamily: fonts.heading,
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 14,
  },
});

const BrandLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 36 36">
    <Rect x="0" y="0" width="36" height="36" rx="8" fill={colors.emerald} />
    <Circle cx="18" cy="14" r="5" fill={colors.white} opacity="0.95" />
    <Rect x="10" y="22" width="16" height="3" rx="1.5" fill={colors.white} opacity="0.8" />
    <Rect x="13" y="27" width="10" height="2" rx="1" fill={colors.white} opacity="0.55" />
  </Svg>
);

interface InvoiceProps {
  payment: PDFPaymentData;
  gymName: string;
  gymAddress: string;
  gymRuc: string;
  gymPhone: string;
  gymSlogan: string;
  gymLogo: string;
  qrDataUrl: string;
}

const createInvoiceDocument = ({
  payment,
  gymName,
  gymAddress,
  gymRuc,
  gymPhone,
  gymSlogan,
  gymLogo,
  qrDataUrl,
}: InvoiceProps) => {
  const now = new Date();
  const hasValidity = Boolean(payment.membershipStart && payment.membershipEnd);
  const validityText = hasValidity
    ? `Vigencia: ${formatShortDate(payment.membershipStart!)} al ${formatShortDate(payment.membershipEnd!)}${
        payment.durationDays ? ` (${payment.durationDays} días)` : ""
      }`
    : "Servicio / Cobro directo en caja";

  return (
    <Document
      title={`Comprobante ${payment.invoiceNumber}`}
      author={gymName}
      subject="Comprobante Electrónico de Pago"
    >
      <Page size="A4" style={s.page}>
        <View style={s.watermark} fixed>
          <Text style={s.watermarkText}>PAGADO</Text>
        </View>

        <View style={s.accentBar} />

        {/* Header */}
        <View style={s.headerContainer}>
          <View style={s.brandBlock}>
            {gymLogo && /^(https?:\/\/|data:image\/)/.test(gymLogo) ? (
              <Image src={gymLogo} style={s.brandLogoImg} />
            ) : (
              <BrandLogo />
            )}
            <View>
              <Text style={s.brandName}>{gymName}</Text>
              <Text style={s.brandSlogan}>{gymSlogan}</Text>
            </View>
          </View>

          <View style={s.receiptBox}>
            <Text style={s.receiptBoxRuc}>RUC {gymRuc}</Text>
            <Text style={s.receiptBoxTitle}>Comprobante de Pago</Text>
            <Text style={s.receiptBoxNum}>N° {payment.invoiceNumber}</Text>
            <View style={s.statusPill}>
              <Text style={s.statusPillText}>
                {payment.status === "COMPLETED" ? "PAGADO" : payment.status || "PAGADO"}
              </Text>
            </View>
          </View>
        </View>

        {/* Metadata Strip */}
        <View style={s.metaStrip}>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>Fecha de Emisión</Text>
            <Text style={s.metaValue}>{formatDateLong(payment.paidAt)}</Text>
          </View>
          <View style={s.metaCellBorder}>
            <Text style={s.metaLabel}>Hora</Text>
            <Text style={s.metaValue}>{formatTime(payment.paidAt)}</Text>
          </View>
          <View style={s.metaCellBorder}>
            <Text style={s.metaLabel}>Método de Pago</Text>
            <Text style={s.metaValue}>{formatPaymentMethod(payment.method)}</Text>
          </View>
          <View style={s.metaCellBorder}>
            <Text style={s.metaLabel}>N° Operación</Text>
            <Text style={s.metaValue}>{payment.reference || "Caja Directa"}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={s.partiesRow}>
          <View style={s.partyCard}>
            <Text style={s.partyLabel}>Cliente / Socio</Text>
            <Text style={s.partyName}>{payment.memberName}</Text>
            {payment.memberDni ? (
              <Text style={s.partyDetail}>DNI / Doc: {payment.memberDni}</Text>
            ) : null}
            {payment.memberEmail ? (
              <Text style={s.partyDetail}>Correo: {payment.memberEmail}</Text>
            ) : null}
            {payment.memberPhone ? (
              <Text style={s.partyDetail}>Teléfono: {payment.memberPhone}</Text>
            ) : null}
          </View>

          <View style={s.partyCard}>
            <Text style={s.partyLabel}>Establecimiento Emisor</Text>
            <Text style={s.partyName}>{gymName}</Text>
            <Text style={s.partyDetail}>{gymAddress}</Text>
            <Text style={s.partyDetail}>RUC: {gymRuc}</Text>
            {gymPhone ? <Text style={s.partyDetail}>Tel: {gymPhone}</Text> : null}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={s.tableContainer}>
          <View style={s.tableHeader}>
            <View style={s.tableColDesc}>
              <Text style={s.tableHeaderText}>Descripción del Servicio</Text>
            </View>
            <View style={s.tableColQty}>
              <Text style={s.tableHeaderText}>Cant.</Text>
            </View>
            <View style={s.tableColPrice}>
              <Text style={s.tableHeaderText}>P. Unitario</Text>
            </View>
            <View style={s.tableColTotal}>
              <Text style={s.tableHeaderText}>Importe</Text>
            </View>
          </View>

          <View style={s.tableRow}>
            <View style={s.tableColDesc}>
              <Text style={s.tableCellBold}>{payment.planName}</Text>
              <Text style={s.tableCellSub}>{validityText}</Text>
            </View>
            <View style={s.tableColQty}>
              <Text style={s.tableCellText}>1</Text>
            </View>
            <View style={s.tableColPrice}>
              <Text style={s.tableCellText}>S/ {payment.amount.toFixed(2)}</Text>
            </View>
            <View style={s.tableColTotal}>
              <Text style={s.tableCellBold}>S/ {payment.amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Split: Amount in Words + QR | Totals */}
        <View style={s.bottomSplit}>
          <View style={s.leftVerification}>
            <View style={s.wordsBox}>
              <Text style={s.wordsText}>{numberToWordsEs(payment.amount)}</Text>
            </View>
            <View style={s.qrRow}>
              <Image src={qrDataUrl} style={s.qrImage} />
              <View style={s.qrInfo}>
                <Text style={s.qrTitle}>Validación Electrónica GymOS</Text>
                <Text style={s.qrSub}>
                  Comprobante N° {payment.invoiceNumber} verificado en sistema. Escanee el código QR para validar la autenticidad de la transacción.
                </Text>
              </View>
            </View>
          </View>

          <View style={s.totalsBox}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Op. Exonerada / Subtotal</Text>
              <Text style={s.totalsValue}>S/ {payment.amount.toFixed(2)}</Text>
            </View>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>IGV (0%)</Text>
              <Text style={s.totalsValue}>S/ 0.00</Text>
            </View>
            <View style={s.totalsFinalRow}>
              <Text style={s.totalsFinalLabel}>TOTAL PAGADO</Text>
              <Text style={s.totalsFinalValue}>S/ {payment.amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={s.notesSection}>
          <Text style={s.notesTitle}>Condiciones & Respaldo</Text>
          <Text style={s.notesText}>
            Este comprobante acredita el pago registrado en {gymName}. Las membresías son personales e intransferibles. Conserve este documento ante cualquier consulta administrativa.
          </Text>
        </View>

        {/* Signatures */}
        <View style={s.signatureArea}>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>Caja / Administración</Text>
          </View>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>Recibí Conforme (Socio)</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <View style={s.footerContent}>
            <View>
              <Text style={s.footerTextBold}>{gymName}</Text>
              <Text style={s.footerText}>{gymAddress}</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={s.footerTextBold}>Atención al Socio</Text>
              <Text style={s.footerText}>{gymPhone || "Recepción Principal"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.footerText}>Emitido el {formatDateLong(now)}</Text>
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
const TICKET_WIDTH = 226;

const tk = StyleSheet.create({
  page: {
    width: TICKET_WIDTH,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: fonts.body,
    fontSize: 8,
    color: colors.charcoal,
  },
  accentBar: {
    height: 3,
    backgroundColor: colors.emerald,
    marginBottom: 10,
    marginHorizontal: -12,
  },
  headerCenter: {
    alignItems: "center",
    marginBottom: 6,
  },
  brandName: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.black,
    textAlign: "center",
  },
  brandSlogan: {
    fontSize: 6,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    textAlign: "center",
    marginTop: 1,
  },
  gymDetail: {
    fontSize: 6.5,
    color: colors.gray,
    textAlign: "center",
    marginTop: 1.5,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayMuted,
    borderBottomStyle: "dashed",
    marginVertical: 7,
  },
  solidLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 6,
  },
  receiptTitle: {
    textAlign: "center",
    fontFamily: fonts.heading,
    fontSize: 9.5,
    color: colors.black,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  receiptNumber: {
    textAlign: "center",
    fontFamily: fonts.mono,
    fontSize: 7.5,
    color: colors.emeraldDark,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3.5,
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
    maxWidth: 125,
  },
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
    paddingVertical: 3,
  },
  itemName: {
    fontSize: 8,
    color: colors.black,
    fontFamily: fonts.heading,
  },
  itemSub: {
    fontSize: 6.5,
    color: colors.gray,
    marginTop: 1.5,
  },
  itemQty: {
    fontSize: 7.5,
    color: colors.charcoal,
    width: 26,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 8,
    color: colors.charcoal,
    fontFamily: fonts.heading,
    width: 58,
    textAlign: "right",
  },
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
    paddingVertical: 7,
    paddingHorizontal: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: fonts.heading,
    fontSize: 9.5,
    color: colors.emeraldDark,
  },
  totalValue: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.emeraldDark,
  },
  wordsText: {
    fontSize: 6.5,
    color: colors.gray,
    fontFamily: fonts.heading,
    textAlign: "center",
    marginTop: 6,
  },
  methodBadge: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  methodBadgeText: {
    fontSize: 7,
    color: colors.charcoal,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: fonts.heading,
    textAlign: "center",
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  qrImg: {
    width: 68,
    height: 68,
  },
  thankYou: {
    fontSize: 7.5,
    color: colors.charcoal,
    textAlign: "center",
    fontFamily: fonts.heading,
    marginTop: 6,
  },
  footerText: {
    fontSize: 6,
    color: colors.grayLight,
    textAlign: "center",
    marginTop: 2,
  },
  accentBarBottom: {
    height: 3,
    backgroundColor: colors.emerald,
    marginTop: 10,
    marginHorizontal: -12,
  },
});

const createTicketDocument = ({
  payment,
  gymName,
  gymAddress,
  gymRuc,
  gymPhone,
  gymSlogan,
  qrDataUrl,
}: InvoiceProps) => {
  const shortDate = formatShortDate(payment.paidAt);
  const shortTime = payment.paidAt.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const hasValidity = Boolean(payment.membershipStart && payment.membershipEnd);

  return (
    <Document title={`Ticket ${payment.invoiceNumber}`} author={gymName}>
      <Page size={{ width: TICKET_WIDTH, height: "auto" }} style={tk.page}>
        <View style={tk.accentBar} />

        <View style={tk.headerCenter}>
          <Text style={tk.brandName}>{gymName}</Text>
          <Text style={tk.brandSlogan}>{gymSlogan}</Text>
          <Text style={tk.gymDetail}>{gymAddress}</Text>
          {gymPhone ? <Text style={tk.gymDetail}>Tel: {gymPhone}</Text> : null}
          <Text style={tk.gymDetail}>RUC: {gymRuc}</Text>
        </View>

        <View style={tk.dashedLine} />

        <Text style={tk.receiptTitle}>Comprobante de Pago</Text>
        <Text style={tk.receiptNumber}>N° {payment.invoiceNumber}</Text>

        <View style={tk.dashedLine} />

        <View style={tk.detailRow}>
          <Text style={tk.detailLabel}>Fecha:</Text>
          <Text style={tk.detailValue}>
            {shortDate} {shortTime}
          </Text>
        </View>
        <View style={tk.detailRow}>
          <Text style={tk.detailLabel}>Cliente:</Text>
          <Text style={tk.detailValue}>{payment.memberName}</Text>
        </View>
        {payment.memberDni ? (
          <View style={tk.detailRow}>
            <Text style={tk.detailLabel}>DNI:</Text>
            <Text style={tk.detailValue}>{payment.memberDni}</Text>
          </View>
        ) : null}
        {payment.reference ? (
          <View style={tk.detailRow}>
            <Text style={tk.detailLabel}>Operación:</Text>
            <Text style={tk.detailValue}>{payment.reference}</Text>
          </View>
        ) : null}

        <View style={tk.solidLine} />

        <View style={tk.itemHeader}>
          <Text style={[tk.itemHeaderText, { flex: 1 }]}>Descripción</Text>
          <Text style={[tk.itemHeaderText, { width: 26, textAlign: "center" }]}>Cant</Text>
          <Text style={[tk.itemHeaderText, { width: 58, textAlign: "right" }]}>Importe</Text>
        </View>
        <View style={tk.itemRow}>
          <View style={{ flex: 1 }}>
            <Text style={tk.itemName}>{payment.planName}</Text>
            {hasValidity ? (
              <Text style={tk.itemSub}>
                {formatShortDate(payment.membershipStart!)} - {formatShortDate(payment.membershipEnd!)}
              </Text>
            ) : null}
          </View>
          <Text style={tk.itemQty}>1</Text>
          <Text style={tk.itemPrice}>S/ {payment.amount.toFixed(2)}</Text>
        </View>

        <View style={tk.dashedLine} />

        <View style={tk.subtotalRow}>
          <Text style={tk.subtotalLabel}>Subtotal</Text>
          <Text style={tk.subtotalValue}>S/ {payment.amount.toFixed(2)}</Text>
        </View>
        <View style={tk.subtotalRow}>
          <Text style={tk.subtotalLabel}>IGV (0%)</Text>
          <Text style={tk.subtotalValue}>S/ 0.00</Text>
        </View>

        <View style={tk.totalBox}>
          <Text style={tk.totalLabel}>TOTAL</Text>
          <Text style={tk.totalValue}>S/ {payment.amount.toFixed(2)}</Text>
        </View>

        <Text style={tk.wordsText}>{numberToWordsEs(payment.amount)}</Text>

        <View style={tk.methodBadge}>
          <Text style={tk.methodBadgeText}>MÉTODO: {formatPaymentMethod(payment.method)}</Text>
        </View>

        <View style={tk.qrContainer}>
          <Image src={qrDataUrl} style={tk.qrImg} />
        </View>

        <View style={tk.dashedLine} />

        <Text style={tk.thankYou}>¡Gracias por entrenar con nosotros!</Text>
        <Text style={tk.footerText}>Comprobante electrónico verificado · GymOS</Text>

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
    "GYM_LOGO",
    "RECEIPT_FORMAT",
  ]);
  return {
    gymName: config["GYM_NAME"] || "GymOS Elite",
    gymAddress: config["GYM_ADDRESS"] || "Av. Principal 123, Lima",
    gymRuc: config["GYM_RUC"] || "20123456789",
    gymPhone: config["GYM_PHONE"] || "",
    gymSlogan: config["GYM_SLOGAN"] || "Elite Fitness Management",
    gymLogo: config["GYM_LOGO"] || "",
    receiptFormat: config["RECEIPT_FORMAT"] || "A4",
  };
}

async function buildReceiptQr(payment: PDFPaymentData): Promise<string> {
  const payload = `GYMOS|${payment.invoiceNumber}|${payment.amount.toFixed(2)}|${formatShortDate(payment.paidAt)}|${payment.memberName}`;
  return QRCode.toDataURL(payload, {
    width: 160,
    margin: 1,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });
}

export async function getDefaultReceiptFormat(): Promise<string> {
  const config = await getConfigMap(["RECEIPT_FORMAT"]);
  return config["RECEIPT_FORMAT"] || "A4";
}

export async function generateInvoicePDF(payment: PDFPaymentData): Promise<Buffer> {
  const [cfg, qrDataUrl] = await Promise.all([getGymConfig(), buildReceiptQr(payment)]);
  const buffer = await renderToBuffer(
    createInvoiceDocument({ payment, ...cfg, qrDataUrl }),
  );
  return Buffer.from(buffer);
}

export async function generateTicketPDF(payment: PDFPaymentData): Promise<Buffer> {
  const [cfg, qrDataUrl] = await Promise.all([getGymConfig(), buildReceiptQr(payment)]);
  const buffer = await renderToBuffer(
    createTicketDocument({ payment, ...cfg, qrDataUrl }),
  );
  return Buffer.from(buffer);
}
