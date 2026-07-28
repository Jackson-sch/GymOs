import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || req.headers.get("x-culqi-signature");
  const secret = process.env.WEBHOOK_SECRET;
  
  if (secret && signature) {
    const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (signature.length === hmac.length) {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac))) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }
  }

  return NextResponse.json(
    { 
      status: "received", 
      message: "Webhook payload acknowledged. Please use specific gateway endpoints (/api/webhooks/mercadopago or /api/webhooks/culqi) for transaction processing." 
    }, 
    { status: 200 }
  );
}
