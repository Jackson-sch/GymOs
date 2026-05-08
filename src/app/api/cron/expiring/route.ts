import { NextResponse } from "next/server";
import { processExpiringMembershipsAction } from "@/lib/actions/cron-actions";

export const runtime = "nodejs";

async function verifyCronAuth(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (!authHeader || authHeader !== expectedAuth) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  const isAuthorized = await verifyCronAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  const result = await processExpiringMembershipsAction();
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  
  return NextResponse.json(result);
}