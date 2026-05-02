import QRCode from "qrcode";

/**
 * Genera un código QR en formato Data URL (base64)
 */
export async function generateMemberQR(memberId: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(memberId, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 400,
      color: {
        dark: "#18181b", // Zinc 900
        light: "#ffffff",
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error("Error generating QR:", err);
    throw new Error("Failed to generate QR code");
  }
}
