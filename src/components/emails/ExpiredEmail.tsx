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

interface ExpiredEmailProps {
  memberName: string;
  planName: string;
  gymName?: string;
  gymLogo?: string;
}

export const ExpiredEmail = ({
  memberName,
  planName,
  gymName = "GymOS",
  gymLogo,
}: ExpiredEmailProps) => (
  <Html>
    <Head />
    <Preview>Tu membresía ha vencido</Preview>
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
          <Heading style={h1}>¡Te extrañamos!</Heading>
          <Text style={text}>
            Hola <strong>{memberName}</strong>, tu membresía <strong>{planName}</strong> ha vencido y hoy es un gran día para volver.
          </Text>
          
          <Section style={card}>
            <Text style={textMuted}>
              Sabemos que la constancia es la clave del éxito. No permitas que el vencimiento de tu plan detenga tu progreso.
            </Text>
          </Section>

          <Text style={text}>
            Tenemos nuevas clases y equipos esperándote. Renueva hoy mismo y retoma tu entrenamiento con la misma energía de siempre.
          </Text>
          
          <Section style={buttonContainer}>
            <Link href="#" style={button}>Ver Planes de Renovación</Link>
          </Section>
        </Section>

        <Hr style={footerHr} />
        
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} {gymName} · Todos los derechos reservados.
          </Text>
          <Text style={footerText}>
            GymOS · Elevando tu potencial
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ExpiredEmail;

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
  padding: "32px 32px 0 32px",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#111827",
  margin: "0 0 24px 0",
  letterSpacing: "-0.025em",
  textTransform: "uppercase" as const,
};

const logo = {
  marginBottom: "24px",
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

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const textMuted = {
  color: "#6b7280",
  fontSize: "15px",
  fontStyle: "italic",
  lineHeight: "22px",
  margin: "0",
};

const card = {
  backgroundColor: "#f3f4f6",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0 0 0",
};

const button = {
  backgroundColor: "#111827",
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
