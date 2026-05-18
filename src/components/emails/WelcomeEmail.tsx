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

interface WelcomeEmailProps {
  memberName: string;
  planName: string;
  startDate: string;
  endDate: string;
  qrCodeUrl?: string;
  gymName?: string;
  gymLogo?: string;
}

export const WelcomeEmail = ({
  memberName,
  planName,
  startDate,
  endDate,
  qrCodeUrl,
  gymName = "GymOS",
  gymLogo,
}: WelcomeEmailProps) => {
  const formattedQrUrl = qrCodeUrl ? (qrCodeUrl.startsWith("http") || qrCodeUrl.startsWith("data:") ? qrCodeUrl : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeUrl)}`) : undefined;

  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido a {gymName}, {memberName}!</Preview>
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
            <Heading style={h1}>¡Hola, {memberName}!</Heading>
            <Text style={text}>
              Estamos muy emocionados de tenerte con nosotros. Tu viaje hacia una vida más saludable comienza hoy.
            </Text>
            
            <Section style={card}>
              <Text style={cardTitle}>Detalles de tu membresía</Text>
              <Hr style={hr} />
              <table width="100%">
                <tr>
                  <td style={label}>Plan</td>
                  <td style={value}>{planName}</td>
                </tr>
                <tr>
                  <td style={label}>Inicio</td>
                  <td style={value}>{startDate}</td>
                </tr>
                <tr>
                  <td style={label}>Vencimiento</td>
                  <td style={value}>{endDate}</td>
                </tr>
              </table>
            </Section>

            {formattedQrUrl && (
              <Section style={qrSection}>
                <Text style={qrLabel}>Tu código de acceso QR</Text>
                <Img src={formattedQrUrl} width="160" height="160" alt="Código QR de acceso" style={qrImage} />
                <Text style={qrSubtext}>Escanea este código al ingresar para registrar tu asistencia.</Text>
              </Section>
            )}

            <Text style={text}>
            Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo o visitando la recepción.
          </Text>
          
          <Section style={buttonContainer}>
            <Link href="#" style={button}>Explorar mi Perfil</Link>
          </Section>
        </Section>

        <Hr style={footerHr} />
        
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} {gymName} · Todos los derechos reservados.
          </Text>
          <Text style={footerText}>
            Enviado con ❤️ por GymOS Platform
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
  );
};

export default WelcomeEmail;

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

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const card = {
  backgroundColor: "#f3f4f6",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
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
  borderColor: "#e5e7eb",
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

const qrSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
  padding: "24px",
  border: "2px dashed #e5e7eb",
  borderRadius: "16px",
};

const qrLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "16px",
};

const qrImage = {
  margin: "0 auto",
  borderRadius: "8px",
};

const qrSubtext = {
  fontSize: "12px",
  color: "#6b7280",
  marginTop: "16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0 0 0",
};

const button = {
  backgroundColor: "#18181b",
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
