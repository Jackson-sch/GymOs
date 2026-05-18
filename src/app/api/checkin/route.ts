import { NextResponse } from "next/server";
import { processCheckIn, getCheckInStats } from "@/lib/actions/checkin-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCode, code, pin, method } = body;
    
    const identifier = qrCode || code || pin;
    
    if (!identifier) {
      return NextResponse.json({ success: false, error: "Identificador de acceso requerido" }, { status: 400 });
    }
    
    const checkInMethod = method || (pin ? "PIN" : "QR");
    const result = await processCheckIn(identifier, checkInMethod);
    
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