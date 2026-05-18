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

interface ClassReminderEmailProps {
  memberName: string;
  className: string;
  trainerName: string;
  startTime: string;
  location?: string;
  gymName?: string;
  gymLogo?: string;
}

export const ClassReminderEmail = ({
  memberName,
  className,
  trainerName,
  startTime,
  location = "Sala Principal",
  gymName = "GymOS",
  gymLogo,
}: ClassReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Recordatorio de Clase: {className} hoy</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          {gymLogo ? (
            <Img src={gymLogo} width="auto" height="32" alt={gymName} style={logo} />
          ) : (
            <Heading style={logoText}>{gymName}</Heading>
          )}
        </Section>
        
        <Section style={content}>
          <Heading style={h1}>¡Te esperamos en clase!</Heading>
          <Text style={text}>
            Hola <strong>{memberName}</strong>, solo un recordatorio amistoso de que tienes una reserva confirmada para el día de hoy.
          </Text>
          
          <Section style={reminderCard}>
            <table width="100%">
              <tr>
                <td style={iconCell}>
                  <div style={timeBadge}>HOY</div>
                </td>
                <td style={detailsCell}>
                  <Text style={classNameText}>{className}</Text>
                  <Text style={classMetaText}>con {trainerName}</Text>
                </td>
              </tr>
            </table>
            
            <Hr style={hr} />
            
            <table width="100%">
              <tr>
                <td style={infoLabel}>Hora</td>
                <td style={infoValue}>{startTime}</td>
              </tr>
              <tr>
                <td style={infoLabel}>Ubicación</td>
                <td style={infoValue}>{location}</td>
              </tr>
            </table>
          </Section>

          <Text style={text}>
            Recuerda llegar al menos 5 minutos antes para preparar tu material y asegurar tu lugar. Si no puedes asistir, por favor cancela tu reserva desde la App para liberar el cupo.
          </Text>
          
          <Section style={buttonContainer}>
            <Link href="#" style={button}>Ver mis Reservas</Link>
          </Section>
        </Section>

        <Hr style={footerHr} />
        
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} {gymName} · Todos los derechos reservados.
          </Text>
          <Text style={footerText}>
            Este es un recordatorio automático de GymOS Classes.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ClassReminderEmail;

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
  padding: "32px 32px 16px 32px",
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

const reminderCard = {
  backgroundColor: "#18181b",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "24px",
  color: "#ffffff",
};

const iconCell = {
  width: "64px",
  verticalAlign: "top" as const,
};

const timeBadge = {
  backgroundColor: "#3f3f46",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "700",
  padding: "4px 8px",
  borderRadius: "6px",
  textAlign: "center" as const,
};

const detailsCell = {
  paddingLeft: "16px",
};

const classNameText = {
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
  color: "#ffffff",
};

const classMetaText = {
  fontSize: "14px",
  color: "#a1a1aa",
  margin: "4px 0 0 0",
};

const hr = {
  borderColor: "#3f3f46",
  margin: "20px 0",
};

const infoLabel = {
  fontSize: "13px",
  color: "#a1a1aa",
  padding: "4px 0",
};

const infoValue = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#ffffff",
  textAlign: "right" as const,
  padding: "4px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0 0 0",
};

const button = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  color: "#18181b",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
  border: "1px solid #e5e7eb",
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
