import { NextResponse } from "next/server";
import { processCheckIn, getCheckInStats } from "@/lib/actions/checkin-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCode, method } = body;
    
    if (!qrCode) {
      return NextResponse.json({ error: "Código QR requerido" }, { status: 400 });
    }
    
    const result = await processCheckIn(qrCode, method || "QR");
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const stats = await getCheckInStats();
  return NextResponse.json(stats);
}