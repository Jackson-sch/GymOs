import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      status: "online", 
      service: "GymOS Webhooks Hub",
      endpoints: ["/api/webhooks/mercadopago", "/api/webhooks/culqi"]
    }, 
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      status: "received", 
      message: "Webhook payload acknowledged. Please use specific gateway endpoints (/api/webhooks/mercadopago or /api/webhooks/culqi) for transaction processing." 
    }, 
    { status: 200 }
  );
}
