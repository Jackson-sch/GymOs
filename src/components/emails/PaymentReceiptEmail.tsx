import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PaymentReceiptEmailProps {
  memberName: string;
  planName: string;
  amount: string;
  method: string;
  paidAt: string;
  invoiceNumber?: string;
  gymName?: string;
  gymLogo?: string;
}

export const PaymentReceiptEmail = ({
  memberName,
  planName,
  amount,
  method,
  paidAt,
  invoiceNumber,
  gymName = "GymOS",
  gymLogo,
}: PaymentReceiptEmailProps) => (
  <Html>
    <Head />
    <Preview>Comprobante de Pago - {gymName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <table width="100%">
            <tr>
              <td>
                {gymLogo ? (
                  <Img src={gymLogo} width="auto" height="32" alt={gymName} style={logo} />
                ) : (
                  <Heading style={logoText}>{gymName}</Heading>
                )}
              </td>
              <td style={receiptBadgeContainer}>
                <span style={receiptBadge}>PAGADO</span>
              </td>
            </tr>
          </table>
        </Section>
        
        <Section style={content}>
          <Heading style={h1}>Gracias por tu pago, {memberName}</Heading>
          <Text style={text}>
            Hemos procesado exitosamente tu pago. A continuación encontrarás el detalle de tu transacción.
          </Text>
          
          <Section style={receiptContainer}>
            <Text style={receiptHeader}>Detalle de la Transacción</Text>
            <Hr style={hr} />
            <table width="100%">
              <tr>
                <td style={label}>Nº de Comprobante</td>
                <td style={value}>{invoiceNumber || "S/N"}</td>
              </tr>
              <tr>
                <td style={label}>Fecha de Pago</td>
                <td style={value}>{paidAt}</td>
              </tr>
              <tr>
                <td style={label}>Método de Pago</td>
                <td style={value}>{method}</td>
              </tr>
            </table>
            
            <Hr style={hr} />
            
            <table width="100%" style={itemTable}>
              <thead>
                <tr>
                  <th style={tableHeadLeft}>Descripción</th>
                  <th style={tableHeadRight}>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tableCellLeft}>Membresía: {planName}</td>
                  <td style={tableCellRight}>{amount}</td>
                </tr>
              </tbody>
            </table>

            <Hr style={hr} />
            
            <table width="100%">
              <tr>
                <td style={totalLabel}>TOTAL</td>
                <td style={totalValue}>{amount}</td>
              </tr>
            </table>
          </Section>

          <Text style={textSmall}>
            Este correo sirve como comprobante oficial de tu pago. Si necesitas una factura con detalles fiscales adicionales, por favor solicítala en la recepción del gimnasio.
          </Text>
        </Section>

        <Hr style={footerHr} />
        
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} {gymName} · Todos los derechos reservados.
          </Text>
          <Text style={footerText}>
            Sistema de Gestión de Pagos GymOS
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PaymentReceiptEmail;

const main = {
  backgroundColor: "#f9fafb",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "40px auto",
  padding: "20px",
  width: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
};

const header = {
  padding: "32px 32px 24px 32px",
};

const logo = {
  marginBottom: "0",
};

const logoText = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#111827",
  margin: "0",
  letterSpacing: "-0.025em",
};

const receiptBadgeContainer = {
  textAlign: "right" as const,
};

const receiptBadge = {
  backgroundColor: "#dcfce7",
  color: "#15803d",
  fontSize: "12px",
  fontWeight: "700",
  padding: "4px 12px",
  borderRadius: "9999px",
  textTransform: "uppercase" as const,
};

const content = {
  padding: "0 32px 32px 32px",
};

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 16px 0",
  lineHeight: "1.2",
};

const text = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const textSmall = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "24px 0 0 0",
  textAlign: "center" as const,
};

const receiptContainer = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #e2e8f0",
};

const receiptHeader = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#475569",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 16px 0",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "16px 0",
};

const label = {
  fontSize: "13px",
  color: "#64748b",
  padding: "4px 0",
};

const value = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#1e293b",
  textAlign: "right" as const,
  padding: "4px 0",
};

const itemTable = {
  margin: "8px 0",
};

const tableHeadLeft = {
  textAlign: "left" as const,
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "600",
  paddingBottom: "8px",
};

const tableHeadRight = {
  textAlign: "right" as const,
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "600",
  paddingBottom: "8px",
};

const tableCellLeft = {
  textAlign: "left" as const,
  fontSize: "14px",
  color: "#1e293b",
  padding: "8px 0",
};

const tableCellRight = {
  textAlign: "right" as const,
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e293b",
  padding: "8px 0",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#1e293b",
};

const totalValue = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#18181b",
  textAlign: "right" as const,
};

const footerHr = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const footer = {
  padding: "32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "4px 0",
};
