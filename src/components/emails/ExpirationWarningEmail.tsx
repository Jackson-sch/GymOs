import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ExpirationWarningEmailProps {
  memberName: string;
  planName: string;
  endDate: string;
  daysLeft: number;
  gymName?: string;
  gymLogo?: string;
}

export const ExpirationWarningEmail = ({
  memberName,
  planName,
  endDate,
  daysLeft,
  gymName = "GymOS",
  gymLogo,
}: ExpirationWarningEmailProps) => {
  const isUrgent = daysLeft <= 1;

  return (
    <Html>
      <Head />
      <Preview>{`Tu membresía vence en ${daysLeft} día(s)`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            {gymLogo ? (
              <Img src={gymLogo} width="auto" height="40" alt={gymName} style={logo} />
            ) : (
              <Heading style={logoText}>{gymName}</Heading>
            )}
          </Section>
          
          <Section style={content}>
            <Heading style={isUrgent ? h1Urgent : h1}>¡No pierdas tu ritmo!</Heading>
            <Text style={text}>
              Hola <strong>{memberName}</strong>, queremos recordarte que tu membresía está por vencer para que no interrumpas tu entrenamiento.
            </Text>
            
            <Section style={isUrgent ? cardUrgent : card}>
              <Text style={cardTitle}>Estado de Renovación</Text>
              <Hr style={hr} />
              <table width="100%">
                <tr>
                  <td style={label}>Plan Actual</td>
                  <td style={value}>{planName}</td>
                </tr>
                <tr>
                  <td style={label}>Vencimiento</td>
                  <td style={value}>{endDate}</td>
                </tr>
                <tr>
                  <td style={label}>Tiempo restante</td>
                  <td style={isUrgent ? valueUrgent : valueHighlight}>{daysLeft} día(s)</td>
                </tr>
              </table>
            </Section>

            <Text style={text}>
              Renovar es muy sencillo. Puedes hacerlo desde nuestra web o directamente en la recepción del gimnasio. ¡Te esperamos para seguir cumpliendo tus metas!
            </Text>
            
            <Section style={buttonContainer}>
              <Link href="#" style={button}>Renovar Ahora</Link>
            </Section>
          </Section>

          <Hr style={footerHr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {gymName} · Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              Enviado automáticamente por el sistema de gestión GymOS
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ExpirationWarningEmail;

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
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const header = {
  padding: "32px 32px 0 32px",
};

const logo = {
  marginBottom: "24px",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#111827",
  margin: "0 0 24px 0",
  letterSpacing: "-0.025em",
  textTransform: "uppercase" as const,
};

const content = {
  padding: "0 32px 32px 32px",
};

const h1 = {
  color: "#111827",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 20px 0",
  lineHeight: "1.2",
};

const h1Urgent = {
  color: "#dc2626",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 20px 0",
  lineHeight: "1.2",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const card = {
  backgroundColor: "#fffbeb",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
  border: "1px solid #fde68a",
};

const cardUrgent = {
  backgroundColor: "#fef2f2",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
  border: "1px solid #fecaca",
};

const cardTitle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#374151",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 12px 0",
};

const hr = {
  borderColor: "#fde68a",
  margin: "12px 0",
};

const label = {
  fontSize: "13px",
  color: "#6b7280",
  padding: "4px 0",
};

const value = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#111827",
  textAlign: "right" as const,
  padding: "4px 0",
};

const valueHighlight = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#d97706",
  textAlign: "right" as const,
  padding: "4px 0",
};

const valueUrgent = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#dc2626",
  textAlign: "right" as const,
  padding: "4px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0 0 0",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
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
