import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF, generateTicketPDF, getDefaultReceiptFormat } from "@/lib/pdf";
import { verifySession } from "@/lib/security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 1. Verify session
    await verifySession();

    // 2. Fetch payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        member: true,
        membership: {
          include: { plan: true }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    if (!payment.member) {
      console.error("Member data missing for payment:", payment.id);
      return NextResponse.json({ error: "Datos del socio no encontrados" }, { status: 400 });
    }

    // 3. Determine format — ?format=ticket for 80mm, default is from system config
    const formatParam = request.nextUrl.searchParams.get("format");
    const defaultFormat = await getDefaultReceiptFormat();
    
    // Use param if present, otherwise use system default
    const currentFormat = formatParam?.toUpperCase() || defaultFormat.toUpperCase();
    const isTicket = currentFormat === "TICKET";

    const paymentData = {
      invoiceNumber: payment.invoiceNumber || payment.id.slice(-8).toUpperCase(),
      memberName: payment.member.fullName,
      planName: payment.membership?.plan?.name || "Pago General",
      amount: Number(payment.amount),
      method: payment.method,
      paidAt: payment.paidAt || payment.createdAt,
    };

    // 4. Generate PDF
    try {
      const pdfBuffer = isTicket
        ? await generateTicketPDF(paymentData)
        : await generateInvoicePDF(paymentData);

      const filename = isTicket
        ? `ticket-${payment.invoiceNumber || payment.id}.pdf`
        : `recibo-${payment.invoiceNumber || payment.id}.pdf`;

      // 5. Return as PDF
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=${filename}`,
        },
      });
    } catch (pdfError) {
      console.error("PDF Rendering Error:", pdfError);
      throw pdfError;
    }
  } catch (error) {
    console.error("Route Error (Receipt):", error);
    return NextResponse.json({ 
      error: "Error al generar el recibo",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}
